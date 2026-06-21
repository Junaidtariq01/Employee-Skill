import React, { useEffect, useState } from 'react';
import { CheckCircle2, Plus, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

const normalizeSkill = (skill) => skill.trim().toLowerCase();

const HRRoadmaps = () => {
  const [employees, setEmployees] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState({
    profileId: '',
    title: '',
    roadmapDetails: '',
    targetSkills: [],
    status: 'Pending',
  });

  const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));

  const loadData = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        setCurrentUserId(user.id);
      }

      const [
        { data: employeeData, error: employeeError },
        { data: roadmapData, error: roadmapError },
        { data: trendData, error: trendError }
      ] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, department, skills, role').eq('role', 'employee').order('first_name', { ascending: true }),
        supabase.from('upskilling_recommendations').select('id, profile_id, hr_id, title, roadmap_details, target_skills, status, created_at').order('created_at', { ascending: false }),
        supabase.from('market_trends').select('metric_name').order('recorded_at', { ascending: false })
      ]);

      if (employeeError) {
        throw employeeError;
      }

      if (roadmapError) {
        throw roadmapError;
      }

      if (trendError) {
        throw trendError;
      }

      setEmployees(employeeData || []);
      setRoadmaps(roadmapData || []);
      setMarketTrends(trendData || []);
    } catch (err) {
      console.error('Error loading roadmaps:', err);
      setFeedback({ type: 'error', text: err.message || 'Unable to load roadmap data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      targetSkills: prev.targetSkills.includes(skill)
        ? prev.targetSkills.filter((item) => item !== skill)
        : [...prev.targetSkills, skill]
    }));
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (!skill) return;

    setFormData((prev) => ({
      ...prev,
      targetSkills: prev.targetSkills.includes(skill)
        ? prev.targetSkills
        : [...prev.targetSkills, skill]
    }));
    setCustomSkill('');
  };

  const selectedEmployee = employees.find((employee) => employee.id === formData.profileId) || null;

  const trendingSkills = Array.from(
    marketTrends.reduce((map, trend) => {
      const metricName = (trend.metric_name || '').trim();
      if (!metricName) return map;

      const normalized = normalizeSkill(metricName);
      if (!map.has(normalized)) {
        map.set(normalized, metricName);
      }
      return map;
    }, new Map()).values()
  );

  const recommendedTargetSkills = selectedEmployee
    ? trendingSkills.filter((skill) => {
        const currentSkills = new Set((selectedEmployee.skills || []).map(normalizeSkill));
        return !currentSkills.has(normalizeSkill(skill));
      })
    : [];

  const availableTargetSkills = Array.from(
    new Map(
      [...recommendedTargetSkills, ...formData.targetSkills].map((skill) => [normalizeSkill(skill), skill])
    ).values()
  );

  const handleEmployeeChange = (profileId) => {
    if (!profileId) {
      setFormData((prev) => ({
        ...prev,
        profileId: '',
        targetSkills: []
      }));
      return;
    }

    const employee = employees.find((item) => item.id === profileId);
    const employeeSkills = new Set((employee?.skills || []).map(normalizeSkill));
    const nextTargetSkills = trendingSkills.filter((skill) => !employeeSkills.has(normalizeSkill(skill)));

    setFormData((prev) => ({
      ...prev,
      profileId,
      targetSkills: nextTargetSkills
    }));
  };

  const handleSubmit = async () => {
    if (!formData.profileId || !formData.title.trim() || formData.targetSkills.length === 0) {
      setFeedback({ type: 'error', text: 'Select an employee, add a roadmap title, and choose at least one target skill.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const { error } = await supabase.from('upskilling_recommendations').insert({
        profile_id: formData.profileId,
        hr_id: currentUserId,
        title: formData.title.trim(),
        roadmap_details: formData.roadmapDetails.trim(),
        target_skills: formData.targetSkills,
        status: formData.status,
      });

      if (error) {
        throw error;
      }

      setFormData({
        profileId: '',
        title: '',
        roadmapDetails: '',
        targetSkills: [],
        status: 'Pending',
      });
      setCustomSkill('');
      setFeedback({ type: 'success', text: 'Roadmap assigned successfully.' });
      await loadData();
    } catch (err) {
      console.error('Error creating roadmap:', err);
      setFeedback({ type: 'error', text: err.message || 'Unable to assign roadmap.' });
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (roadmapId, status) => {
    try {
      const { error } = await supabase.from('upskilling_recommendations').update({ status }).eq('id', roadmapId);
      if (error) {
        throw error;
      }
      setRoadmaps((prev) => prev.map((roadmap) => (
        roadmap.id === roadmapId ? { ...roadmap, status } : roadmap
      )));
    } catch (err) {
      console.error('Error updating roadmap status:', err);
      setFeedback({ type: 'error', text: err.message || 'Unable to update roadmap status.' });
    }
  };

  if (loading) {
    return <div className="animate-fade-in"><p>Loading roadmaps...</p></div>;
  }

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Roadmap Assignment</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Assign target skills and learning roadmaps to employees based on the latest market priorities.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Create Roadmap</h3>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label">Employee</label>
            <select
              className="glass-input"
              value={formData.profileId}
              onChange={(event) => handleEmployeeChange(event.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id} style={{ color: '#0b1020' }}>
                  {employee.first_name} {employee.last_name} ({employee.department || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label">Roadmap Title</label>
            <input
              type="text"
              className="glass-input"
              placeholder="Q3 Cloud Foundations Roadmap"
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label">Roadmap Details</label>
            <textarea
              className="glass-input"
              rows="5"
              placeholder="Outline the milestones, certifications, practice work, and mentoring steps."
              value={formData.roadmapDetails}
              onChange={(event) => setFormData((prev) => ({ ...prev, roadmapDetails: event.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label">Status</label>
            <select
              className="glass-input"
              value={formData.status}
              onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
              style={{ width: '100%' }}
            >
              {['Pending', 'In Progress', 'Completed'].map((status) => (
                <option key={status} value={status} style={{ color: '#0b1020' }}>{status}</option>
              ))}
            </select>
          </div>

          <div className="glass-panel" style={{ padding: '18px', marginBottom: '18px' }}>
            <label className="input-label" style={{ display: 'block', marginBottom: '10px' }}>Target Skills</label>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: 0, marginBottom: '14px' }}>
              {selectedEmployee
                ? 'Suggested from current market trends and filtered to skills the employee does not already have.'
                : 'Select an employee to load target skills from the current trending skill gaps.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Add a custom skill"
                value={customSkill}
                onChange={(event) => setCustomSkill(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={addCustomSkill}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {availableTargetSkills.map((skill) => {
                const isSelected = formData.targetSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '999px',
                      border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                      background: isSelected ? 'rgba(0,210,255,0.1)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            {selectedEmployee && recommendedTargetSkills.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '14px', marginBottom: 0 }}>
                This employee already covers all currently tracked trending skills.
              </p>
            )}
          </div>

          {formData.targetSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
              {formData.targetSkills.map((skill) => (
                <div key={skill} onClick={() => toggleSkill(skill)} style={{ padding: '9px 14px', borderRadius: '999px', background: 'rgba(0,210,255,0.1)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <CheckCircle2 size={14} />
                  {skill}
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSubmit} className="btn-primary" style={{ width: 'auto' }} disabled={submitting}>
            {submitting ? 'Assigning...' : 'Assign Roadmap'}
          </button>

          {feedback && (
            <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '12px', background: feedback.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', color: feedback.type === 'error' ? '#ef4444' : '#34d399' }}>
              {feedback.text}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Employee Snapshot</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {employees.slice(0, 6).map((employee) => (
              <div key={employee.id} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <strong>{employee.first_name} {employee.last_name}</strong>
                  <span style={{ color: 'var(--accent-blue)', fontSize: '12px' }}>{employee.department || 'General'}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {(employee.skills || []).slice(0, 4).join(', ') || 'No skills listed yet'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Assigned Roadmaps</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {roadmaps.length ? roadmaps.map((roadmap) => {
            const employee = employeeMap.get(roadmap.profile_id);
            return (
              <div key={roadmap.id} style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <strong>{roadmap.title}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
                      <UserRound size={14} />
                      <span>{employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown employee'}</span>
                    </div>
                  </div>
                  <select
                    className="glass-input"
                    value={roadmap.status}
                    onChange={(event) => updateStatus(roadmap.id, event.target.value)}
                    style={{ width: 'auto', minWidth: '150px' }}
                  >
                    {['Pending', 'In Progress', 'Completed'].map((status) => (
                      <option key={status} value={status} style={{ color: '#0b1020' }}>{status}</option>
                    ))}
                  </select>
                </div>

                {roadmap.roadmap_details && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{roadmap.roadmap_details}</p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {(roadmap.target_skills || []).map((skill) => (
                    <span key={skill} style={{ padding: '6px 12px', borderRadius: '999px', background: 'rgba(0,210,255,0.1)', color: 'var(--accent-blue)', fontSize: '12px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          }) : (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No roadmaps assigned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRRoadmaps;
