import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { interns as internsApi, getErrorMessage } from '../api'
import StatusBadge from '../components/StatusBadge'

const ROLES = ['AI/ML Intern', 'Data Science Intern', 'Full Stack Intern']
const STATUSES = ['Onboarding', 'Active', 'Completed', 'Dropped']

export default function InternDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [intern, setIntern] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(null)
  const [present, setPresent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadIntern()
  }, [id])

  const loadIntern = async () => {
    setLoading(true)
    try {
      const res = await internsApi.get(id)
      setIntern(res.data)
      setForm(res.data)
    } finally {
      setLoading(false)
    }
  }

  const togglePresent = () => {
    const next = !present
    setPresent(next)
    if (next) setForm({ ...form, end_date: '' })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await internsApi.update(id, { ...form, end_date: present ? null : form.end_date || null })
      setIntern(res.data)
      setForm(res.data)
      setPresent(!res.data.end_date)
      setEditMode(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update intern'))
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    await internsApi.delete(id)
    navigate('/interns')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }
  if (!intern) return <div className="container">Intern not found.</div>

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{intern.name}</h1>
        <div className="actions">
          {(intern.status === 'Onboarding' || intern.status === 'Active') && (
            <Link to={`/emails/compose/${intern.id}`} className="btn btn-primary">Send Welcome Email</Link>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (!editMode) setPresent(!form.end_date)
              setEditMode(!editMode)
            }}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {editMode ? (
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.start_date || ''}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>End Date</label>
                  <button
                    type="button"
                    onClick={togglePresent}
                    className={`btn btn-sm ${present ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '2px 10px', fontSize: '11px' }}
                  >
                    Present
                  </button>
                </div>
                <input
                  type="date"
                  className="form-control"
                  value={form.end_date || ''}
                  disabled={present}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Email', value: intern.email },
              { label: 'Role', value: intern.role },
              { label: 'Status', value: <StatusBadge status={intern.status} /> },
              { label: 'Duration', value: `${intern.start_date || '-'} to ${intern.end_date || 'Present'}` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, overflowWrap: 'break-word' }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <h3>Assigned Tasks</h3>
          <Link to={`/tasks/new?intern=${intern.id}`} className="btn btn-primary btn-sm">+ Assign Task</Link>
        </div>
        {intern.assignments?.length === 0 ? (
          <div className="empty-state">No tasks assigned yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Document</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {intern.assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td><Link to={`/tasks/${assignment.id}`}>{assignment.task?.title}</Link></td>
                  <td>
                    {assignment.task?.doc_url ? (
                      <a href={assignment.task.doc_url} target="_blank" rel="noopener noreferrer">Open Doc</a>
                    ) : '-'}
                  </td>
                  <td>{assignment.due_date || '-'}</td>
                  <td><StatusBadge status={assignment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
