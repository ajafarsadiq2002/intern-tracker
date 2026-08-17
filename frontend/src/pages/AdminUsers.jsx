import { useEffect, useState } from 'react'
import { auth, getErrorMessage } from '../api'

const ALL_PAGES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'interns', label: 'Interns' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'email_templates', label: 'Email Templates' },
  { key: 'assistant', label: 'Assistant' },
  { key: 'admin_users', label: 'Admin Users' },
]

const ROLES = ['admin', 'hr', 'manager', 'viewer']

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'viewer',
    allowed_pages: ['dashboard'],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await auth.listUsers()
      setUsers(res.data)
    } finally {
      setLoading(false)
    }
  }

  const togglePage = (page) => {
    const current = form.allowed_pages
    const next = current.includes(page)
      ? current.filter((p) => p !== page)
      : [...current, page]
    setForm({ ...form, allowed_pages: next })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await auth.register(form)
      setSuccess('User created successfully')
      setForm({
        full_name: '',
        email: '',
        password: '',
        role: 'viewer',
        allowed_pages: ['dashboard'],
      })
      loadUsers()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create user'))
    }
  }

  const toggleUserStatus = async (user) => {
    const nextStatus = user.is_active === 'active' ? 'inactive' : 'active'
    try {
      await auth.updateUser(user.id, { is_active: nextStatus })
      loadUsers()
    } catch (err) {
      alert('Failed to update user')
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await auth.deleteUser(userId)
      loadUsers()
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Admin Users</h1>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Create New User</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="john@constient.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Allowed Pages</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ALL_PAGES.map((page) => {
                const active = form.allowed_pages.includes(page.key)
                return (
                  <button
                    key={page.key}
                    type="button"
                    onClick={() => togglePage(page.key)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: active ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid var(--border)',
                      background: active ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                      color: active ? '#67e8f9' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {page.label}
                  </button>
                )
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Create User</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>All Users</h3>
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '200px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Allowed Pages</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'white',
                        }}
                      >
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      {user.full_name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span style={{ textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</span></td>
                  <td><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{(user.allowed_pages || []).join(', ')}</span></td>
                  <td>
                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: user.is_active === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: user.is_active === 'active' ? '#4ade80' : '#fda4af',
                      }}
                    >
                      {user.is_active}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleUserStatus(user)}
                      >
                        {user.is_active === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
