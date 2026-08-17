import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { page: 'dashboard', label: 'Dashboard', path: '/' },
  { page: 'interns', label: 'Interns', path: '/interns' },
  { page: 'tasks', label: 'Tasks', path: '/tasks' },
  { page: 'tasks', label: 'Task Library', path: '/task-library' },
  { page: 'email_templates', label: 'Email Templates', path: '/email-templates' },
  { page: 'assistant', label: 'Assistant', path: '/assistant' },
  { page: 'admin_users', label: 'Admin Users', path: '/admin/users', superAdminOnly: true },
]

export default function Layout({ children }) {
  const { user, loading, logout, canAccess } = useAuth()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'

  if (isAuthPage) {
    return <div className="auth-page">{children}</div>
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              to="/"
              style={{
                color: 'white',
                fontWeight: 800,
                fontSize: '20px',
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginRight: '24px',
              }}
            >
              Intern Tracker
            </Link>
            {NAV_ITEMS.map((item) => {
              if (item.superAdminOnly && user?.role !== 'super_admin') return null
              if (!canAccess(item.page)) return null
              const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {user && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{user.full_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</div>
              </div>
            )}
            <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="container page-content" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        {children}
      </main>
    </div>
  )
}
