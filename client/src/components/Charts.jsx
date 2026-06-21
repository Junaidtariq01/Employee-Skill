import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const defaultPerformanceData = [
  { name: 'Jan', score: 82 },
  { name: 'Feb', score: 85 },
  { name: 'Mar', score: 84 },
  { name: 'Apr', score: 89 },
  { name: 'May', score: 93 },
  { name: 'Jun', score: 95 },
];

const defaultSkillsData = [
  { subject: 'React', score: 90, fullMark: 100 },
  { subject: 'Node.js', score: 85, fullMark: 100 },
  { subject: 'Python', score: 70, fullMark: 100 },
  { subject: 'Cloud', score: 80, fullMark: 100 },
  { subject: 'UI/UX', score: 65, fullMark: 100 },
  { subject: 'Leadership', score: 85, fullMark: 100 },
];

const EmptyChartState = ({ message, height = '300px' }) => (
  <div style={{ height, width: '100%', minWidth: 0, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
    <p>{message}</p>
  </div>
);

export const PerformanceChart = ({
  data = defaultPerformanceData,
  xKey = 'name',
  lineKey = 'score',
  height = '300px',
  color = 'var(--accent-blue)',
}) => {
  if (!data.length) {
    return <EmptyChartState message="No performance history available yet." height={height} />;
  }

  return (
    <div style={{ height, width: '100%', minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--glass-border)', borderRadius: '8px' }}
            itemStyle={{ color }}
          />
          <Line type="monotone" dataKey={lineKey} stroke={color} strokeWidth={3} dot={{ fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SkillsRadarChart = ({
  data = defaultSkillsData,
  dataKey = 'score',
  subjectKey = 'subject',
  height = '300px',
}) => {
  if (!data.length) {
    return <EmptyChartState message="Add more skills to unlock this view." height={height} />;
  }

  return (
    <div style={{ height, width: '100%', minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey={subjectKey} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar name="Skills" dataKey={dataKey} stroke="var(--accent-electric)" fill="var(--accent-blue)" fillOpacity={0.3} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--glass-border)', borderRadius: '8px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrendsBarChart = ({
  data = [],
  xKey = 'metric_name',
  barKey = 'value',
  height = '320px',
}) => {
  if (!data.length) {
    return <EmptyChartState message="Generate trends to populate this chart." height={height} />;
  }

  return (
    <div style={{ height, width: '100%', minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={70} />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--glass-border)', borderRadius: '8px' }} />
          <Bar dataKey={barKey} fill="var(--accent-electric)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
