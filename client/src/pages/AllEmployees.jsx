import React, { useEffect, useState } from 'react';
import { Search, Download, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'hr')
        .neq('role', 'admin');

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        setEmployees(data || []);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const haystack = [
      employee.first_name,
      employee.last_name,
      employee.department,
      employee.branch,
      employee.id,
      ...(employee.skills || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Employee Database</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and analyze workforce talent.</p>
        </div>
        <button className="btn-secondary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={16} /> Export CSV
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', top: '12px', left: '16px', color: 'var(--text-secondary)' }} size={20} />
            <input
              type="text"
              className="glass-input"
              style={{ width: '100%', paddingLeft: '48px' }}
              placeholder="Search employees by name, ID, or skills..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading employee data...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Employee</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Branch</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Department</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Score</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Skills</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                          {emp.first_name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{emp.first_name} {emp.last_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{emp.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>{emp.branch || 'Global'}</td>
                    <td style={{ padding: '16px' }}>{emp.department || 'N/A'}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                          <div style={{ width: `${emp.score || 0}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '14px' }}>{emp.score || 0}/100</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{emp.skills?.length || 0} listed</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredEmployees.length && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                No employees matched the current filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEmployees;
