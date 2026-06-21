import React, { useEffect, useState } from 'react';
import { Activity, BarChart3, Gauge, RefreshCw, Users } from 'lucide-react';
import { TrendsBarChart } from '../components/Charts';
import { supabase } from '../lib/supabase';

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
        <h3 style={{ fontSize: '28px', margin: 0 }}>{value}</h3>
      </div>
      <div style={{ color: 'var(--accent-blue)' }}>{icon}</div>
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>{subtitle}</p>
  </div>
);

const formatTrendValue = (value) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const TrendsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: trendsData, error: trendsError }, { data: employeeData, error: employeeError }] = await Promise.all([
          supabase.from('market_trends').select('*').order('recorded_at', { ascending: false }),
          supabase.from('profiles').select('id, score').eq('role', 'employee')
        ]);

        if (trendsError) {
          throw trendsError;
        }

        if (employeeError) {
          throw employeeError;
        }

        setTrends(trendsData || []);
        setEmployees(employeeData || []);
      } catch (err) {
        console.error('Error loading trends analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-fade-in"><p>Loading trends analytics...</p></div>;
  }

  const topTrends = [...trends]
    .map((trend) => ({ ...trend, numericValue: formatTrendValue(trend.value) }))
    .sort((a, b) => b.numericValue - a.numericValue)
    .slice(0, 8);

  const categoryMap = trends.reduce((acc, trend) => {
    const category = trend.category || 'General';
    const current = acc.get(category) || { category, count: 0, total: 0 };
    current.count += 1;
    current.total += formatTrendValue(trend.value);
    acc.set(category, current);
    return acc;
  }, new Map());

  const categories = Array.from(categoryMap.values())
    .map((item) => ({
      ...item,
      average: item.count ? Math.round(item.total / item.count) : 0
    }))
    .sort((a, b) => b.average - a.average);

  const avgScore = employees.length
    ? Math.round(employees.reduce((sum, employee) => sum + (employee.score || 0), 0) / employees.length)
    : 0;

  const lastSync = trends[0]?.recorded_at
    ? new Date(trends[0].recorded_at).toLocaleString()
    : 'No sync yet';

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Trends Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live market priorities mapped against workforce readiness.</p>
        </div>
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshCw size={16} color="var(--accent-electric)" />
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Last sync: {lastSync}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="Tracked Trends" value={trends.length} subtitle="Current market intelligence signals" icon={<BarChart3 size={22} />} />
        <StatCard title="Trend Categories" value={categories.length} subtitle="Distinct strategic focus areas" icon={<Activity size={22} />} />
        <StatCard title="Avg Workforce Score" value={`${avgScore}/100`} subtitle="Current employee-market alignment" icon={<Gauge size={22} />} />
        <StatCard title="Employees Scored" value={employees.length} subtitle="Profiles included in the analytics snapshot" icon={<Users size={22} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Top Market Drivers</h3>
          <TrendsBarChart
            data={topTrends.map((trend) => ({
              metric_name: trend.metric_name,
              value: trend.numericValue
            }))}
          />
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Category Pressure</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categories.length ? categories.map((category) => (
              <div key={category.category} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '16px' }}>
                  <strong>{category.category}</strong>
                  <span style={{ color: 'var(--accent-blue)' }}>{category.average}/100</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {category.count} tracked signal{category.count === 1 ? '' : 's'} in this category.
                </p>
              </div>
            )) : (
              <p style={{ color: 'var(--text-secondary)' }}>Generate trends to populate category analysis.</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Trend Watchlist</h3>
        {topTrends.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {topTrends.map((trend) => (
              <div key={`${trend.metric_name}-${trend.category}`} style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <strong style={{ lineHeight: 1.4 }}>{trend.metric_name}</strong>
                  <span style={{ color: 'var(--accent-electric)', fontWeight: 700 }}>{trend.numericValue}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{trend.category || 'General'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No market trends are stored yet.</p>
        )}
      </div>
    </div>
  );
};

export default TrendsAnalytics;
