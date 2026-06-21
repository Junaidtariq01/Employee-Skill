import React, { useEffect, useState } from 'react';
import { Briefcase, Zap, Star, CheckCircle, Lightbulb, Sparkles } from 'lucide-react';
import { SkillsRadarChart } from '../components/Charts';
import { supabase } from '../lib/supabase';

const MetricCard = ({ title, value, icon, color, subtitle }) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
        <h3 style={{ fontSize: '28px', margin: 0 }}>{value}</h3>
      </div>
      <div style={{ padding: '12px', background: `rgba(${color}, 0.1)`, borderRadius: '12px', color: `rgb(${color})` }}>
        {icon}
      </div>
    </div>
    {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{subtitle}</p>}
  </div>
);

const buildReviewSections = (reviewText) => {
  const cleaned = (reviewText || '')
    .replace(/\r/g, '')
    .replace(/\*\*/g, '')
    .trim();

  if (!cleaned) {
    return {
      summary: 'No review available yet. Fresh market signals and roadmap updates will appear here.',
      highlights: [],
    };
  }

  const parts = cleaned
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((part) => part.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);

  return {
    summary: parts[0] || cleaned,
    highlights: parts.slice(1, 5),
  };
};

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [gradeHistory, setGradeHistory] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [
            { data: profileData },
            { data: recommendationData },
            { data: historyData },
            { data: trendData },
          ] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('upskilling_recommendations').select('id, title, roadmap_details, target_skills, status, created_at').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(3),
            supabase.from('grade_history').select('id, old_grade, new_grade, reason, changed_at').eq('profile_id', user.id).order('changed_at', { ascending: false }).limit(4),
            supabase.from('market_trends').select('metric_name, value, category, recorded_at').order('recorded_at', { ascending: false }).limit(6)
          ]);

          setProfile(profileData);
          setRecommendations(recommendationData || []);
          setGradeHistory(historyData || []);
          setMarketTrends(trendData || []);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="animate-fade-in"><p>Loading dashboard...</p></div>;
  }

  if (!profile) {
    return <div className="animate-fade-in"><p>No profile data found.</p></div>;
  }

  const grade = profile.score >= 85 ? 'High Match' : profile.score >= 70 ? 'Strong Match' : 'Growing Match';
  const department = profile.department ? profile.department.charAt(0).toUpperCase() + profile.department.slice(1) : 'General';

  const trendWeightMap = new Map(
    marketTrends.map((trend) => [trend.metric_name.toLowerCase(), Number(trend.value) || 0])
  );

  const skillRadarData = (profile.skills || []).slice(0, 6).map((skill, index) => ({
    subject: skill,
    score: trendWeightMap.get(skill.toLowerCase()) || Math.max(45, 78 - (index * 5)),
    fullMark: 100,
  }));

  const topTrendNames = marketTrends.slice(0, 4).map((trend) => trend.metric_name);
  const reviewSections = buildReviewSections(profile.review);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome back, {profile.first_name || 'User'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here&apos;s your workforce intelligence overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d2ff', boxShadow: '0 0 10px #00d2ff' }}></span>
            Grade: {grade} {department}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <MetricCard title="Performance Score" value={`${profile.score || 0}/100`} icon={<Star size={24} />} color="0, 210, 255" subtitle="AI assessed market fit" />
        <MetricCard title="Roadmaps" value={recommendations.length} icon={<Briefcase size={24} />} color="58, 123, 213" subtitle="Assigned upskilling plans" />
        <MetricCard title="Experience" value={`${profile.experience_years || 0} yrs`} icon={<CheckCircle size={24} />} color="34, 197, 94" subtitle={`${profile.skills?.length || 0} skills on profile`} />
        <MetricCard title="Priority Trends" value={topTrendNames.length} icon={<Sparkles size={24} />} color="234, 179, 8" subtitle="Active market signals influencing your score" />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={20} color="#eab308" /> AI Review
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
            <div style={{ padding: '20px', background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#facc15', marginBottom: '10px' }}>
                Summary
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: reviewSections.highlights.length ? '18px' : 0, color: 'var(--text-primary)' }}>
                {reviewSections.summary}
              </p>

              {reviewSections.highlights.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reviewSections.highlights.map((item, index) => (
                    <div key={`${item}-${index}`} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: 'var(--accent-blue)', marginTop: '8px', flexShrink: 0 }}></span>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '18px', background: 'rgba(0,210,255,0.08)', borderRadius: '18px', border: '1px solid rgba(0,210,255,0.16)' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '12px' }}>
                  Grade Snapshot
                </p>
                <h4 style={{ fontSize: '24px', marginBottom: '6px' }}>{grade}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Score {profile.score || 0}/100 across {department.toLowerCase()} signals and market fit.
                </p>
              </div>

              <div style={{ padding: '18px', background: 'rgba(58,123,213,0.08)', borderRadius: '18px', border: '1px solid rgba(58,123,213,0.16)' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7db7ff', marginBottom: '12px' }}>
                  Focus Areas
                </p>
                {topTrendNames.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {topTrendNames.map((trend) => (
                      <span key={trend} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', color: '#d7ecff', fontSize: '12px' }}>
                        {trend}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    Market priorities will appear here after the next trend sync.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="var(--accent-electric)" /> Skill Growth
          </h3>
          <SkillsRadarChart data={skillRadarData} />
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px' }}>Assigned Roadmaps</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.length ? recommendations.map((recommendation) => (
              <div key={recommendation.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', gap: '12px' }}>
                  <span style={{ fontWeight: 600 }}>{recommendation.title}</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>{recommendation.status}</span>
                </div>
                <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {recommendation.roadmap_details || 'No roadmap details have been added yet.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(recommendation.target_skills || []).map((skill) => (
                    <span key={skill} style={{ padding: '5px 10px', borderRadius: '999px', background: 'rgba(58,123,213,0.12)', color: '#7db7ff', fontSize: '12px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No roadmaps assigned yet. HR recommendations will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Grade History</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {gradeHistory.length ? gradeHistory.map((entry) => (
            <div key={entry.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{entry.old_grade} to {entry.new_grade}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(entry.changed_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{entry.reason || 'AI reevaluation'}</p>
            </div>
          )) : (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No grade history has been recorded for this account yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
