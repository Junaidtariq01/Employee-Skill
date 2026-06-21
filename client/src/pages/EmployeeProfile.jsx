import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Edit3, Award, Clock, Star } from 'lucide-react';
import { SkillsRadarChart } from '../components/Charts';
import { supabase } from '../lib/supabase';

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [marketTrends, setMarketTrends] = useState([]);
  const [gradeHistory, setGradeHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const [
          { data: profileData },
          { data: trendData },
          { data: historyData },
          { data: recommendationData },
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('market_trends').select('metric_name, value').order('recorded_at', { ascending: false }).limit(10),
          supabase.from('grade_history').select('id, old_grade, new_grade, reason, changed_at').eq('profile_id', user.id).order('changed_at', { ascending: false }).limit(5),
          supabase.from('upskilling_recommendations').select('id, title, target_skills, status').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(3)
        ]);

        setProfile(profileData);
        setMarketTrends(trendData || []);
        setGradeHistory(historyData || []);
        setRecommendations(recommendationData || []);
      } catch (err) {
        console.error('Error loading employee profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-fade-in"><p>Loading profile...</p></div>;
  }

  if (!profile) {
    return <div className="animate-fade-in"><p>No profile data found.</p></div>;
  }

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.trim() || 'EW';
  const trendMap = new Map(marketTrends.map((trend) => [trend.metric_name.toLowerCase(), Number(trend.value) || 0]));
  const skillRadarData = (profile.skills || []).slice(0, 6).map((skill, index) => ({
    subject: skill,
    score: trendMap.get(skill.toLowerCase()) || Math.max(45, 80 - (index * 6)),
    fullMark: 100,
  }));

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px', position: 'relative' }}>
        <button className="btn-secondary" style={{ position: 'absolute', top: '40px', right: '40px', width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
          <Edit3 size={16} /> Edit Profile
        </button>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-electric))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 'bold'
            }}
          >
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{profile.first_name} {profile.last_name}</h1>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '14px' }}>{profile.id.slice(0, 8)}</span>
              <span style={{ padding: '4px 12px', background: 'rgba(0,210,255,0.1)', color: 'var(--accent-blue)', borderRadius: '20px', fontSize: '14px' }}>{profile.department || 'General'}</span>
              <span style={{ padding: '4px 12px', background: 'rgba(58,123,213,0.1)', color: '#3a7bd5', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={14} /> AI Score {profile.score || 0}/100
              </span>
            </div>
            <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {profile.branch || 'Global Branch'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> {profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--accent-blue)" /> Skill Proficiency
            </h3>
            <SkillsRadarChart data={skillRadarData} />
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>About</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>
              {profile.bio || 'This employee has not added a bio yet.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {(profile.skills || []).map((skill) => (
                <span key={skill} style={{ padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', fontSize: '12px' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--accent-electric)" /> Grade History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {gradeHistory.length ? gradeHistory.map((entry) => (
                <div key={entry.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--accent-blue)', borderRadius: '4px 12px 12px 4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0 }}>Score moved from {entry.old_grade} to {entry.new_grade}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(entry.changed_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{entry.reason || 'AI reevaluation'}</p>
                </div>
              )) : (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No grade history recorded yet.</p>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '24px' }}>Assigned Roadmaps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recommendations.length ? recommendations.map((recommendation) => (
                <div key={recommendation.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <strong>{recommendation.title}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>{recommendation.status}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(recommendation.target_skills || []).map((skill) => (
                      <span key={skill} style={{ padding: '5px 10px', borderRadius: '999px', background: 'rgba(58,123,213,0.12)', color: '#7db7ff', fontSize: '12px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )) : (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No recommendations assigned yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
