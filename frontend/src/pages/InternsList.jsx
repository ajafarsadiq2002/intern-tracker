import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { interns as internsApi } from '../api'
import StatusBadge from '../components/StatusBadge'

const ROLES = ['', 'AI/ML Intern', 'Data Science Intern', 'Full Stack Intern']
const STATUSES = ['', 'Onboarding', 'Active', 'Completed', 'Dropped']

export default function InternsList() {
  const [interns, setInterns] = useState([])
  const [filters, setFilters] = useState({ role: '', status: '', search: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInterns()
  }, [filters])

  const loadInterns = async () => {
    setLoading(true)
    try {
      const res = await internsApi.list(filters)
      setInterns(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this intern?')) return
    try {
      await internsApi.delete(id)
      loadInterns()
    } catch (err) {
      alert('Failed to delete intern')
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Interns</h1>
        <Link to="/interns/new" className="btn btn-primary">+ Add Intern</Link>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or email"
          className="form-control"
          style={{ maxWidth: '300px' }}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="form-control"
          style={{ maxWidth: '180px' }}
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          {ROLES.map((role) => <option key={role} value={role}>{role || 'All Roles'}</option>)}
        </select>
        <select
          className="form-control"
          style={{ maxWidth: '180px' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          {STATUSES.map((status) => <option key={status} value={status}>{status || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '200px' }}>
            <div className="spinner" />
          </div>
        ) : interns.length === 0 ? (
          <div className="empty-state">No interns found. Start by onboarding one.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern) => (
                <tr key={intern.id}>
                  <td><Link to={`/interns/${intern.id}`}>{intern.name}</Link></td>
                  <td>{intern.email}</td>
                  <td>{intern.role}</td>
                  <td><StatusBadge status={intern.status} /></td>
                  <td>{intern.start_date || '-'}</td>
                  <td>
                    <div className="actions">
                      <Link to={`/interns/${intern.id}`} className="btn btn-secondary btn-sm">View</Link>
                      {(intern.status === 'Onboarding' || intern.status === 'Active') && (
                        <Link to={`/emails/compose/${intern.id}`} className="btn btn-primary btn-sm">Email</Link>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(intern.id)}>Delete</button>
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
