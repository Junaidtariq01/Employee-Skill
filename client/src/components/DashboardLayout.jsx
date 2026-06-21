import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  LineChart, 
  LogOut,
  UserCircle,
  Award,
  Clock,
  PlusCircle,
  Network
} from 'lucide-react';

const DashboardLayout = ({ role = 'employee' }) => {
  const navigate = useNavigate();

  const employeeLinks = [
    { to: '/employee/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/employee/profile', icon: <UserCircle size={20} />, label: 'My Profile' },
    { to: '/employee/skills', icon: <Award size={20} />, label: 'Skill Analysis' },
    { to: '/employee/experience', icon: <Clock size={20} />, label: 'Experience' },
  ];

  const hrLinks = [
    { to: '/hr/dashboard', icon: <LayoutDashboard size={20} />, label: 'HR Dashboard' },
    { to: '/hr/employees', icon: <Users size={20} />, label: 'All Employees' },
    { to: '/hr/trends', icon: <LineChart size={20} />, label: 'Trends Analytics' },
    { to: '/hr/roadmaps', icon: <Network size={20} />, label: 'Roadmaps' },
    { to: '/hr/projects/add', icon: <PlusCircle size={20} />, label: 'Add Project' },
  ];

  const links = role === 'hr' ? hrLinks : employeeLinks;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        borderRight: '1px solid var(--glass-border)',
        background: 'var(--bg-gradient)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-electric))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '18px', color: 'white'
          }}>EQ</div>
          <h2 style={{ fontSize: '20px', color: 'white', margin: 0 }}>EquiWork <span style={{fontSize:'12px', color:'var(--accent-blue)'}}>{role.toUpperCase()}</span></h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s'
              })}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '0 16px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              border: 'none', background: 'transparent',
              color: 'var(--text-secondary)', width: '100%',
              cursor: 'pointer', fontSize: '16px', fontWeight: 500
            }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px', position: 'relative' }}>
        <div className="glow-node primary" style={{ opacity: 0.05, top: 0, right: 0 }}></div>
        <div className="glow-node secondary" style={{ opacity: 0.05, bottom: 0, left: '50%' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
