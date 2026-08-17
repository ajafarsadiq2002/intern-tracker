import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { taskLibrary, getErrorMessage } from '../api'

const ROLES = ['', 'AI/ML Intern', 'Data Science Intern', 'Full Stack Intern']

export default function EditTaskLibraryItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadItem()
  }, [id])

  const loadItem = async () => {
    setLoading(true)
    try {
      const res = await taskLibrary.get(id)
      setItem(res.data)
      setForm({ ...res.data, role: res.data.role || '' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await taskLibrary.update(id, { ...form, role: form.role || null })
      setItem(res.data)
      setForm({ ...res.data, role: res.data.role || '' })
      setEditMode(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update task'))
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task from the library? Existing intern assignments for it will also be removed.')) return
    await taskLibrary.delete(id)
    navigate('/task-library')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }
  if (!item) return <div className="container">Task not found.</div>

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{item.title}</h1>
        <div className="actions">
          <Link to="/task-library" className="btn btn-secondary">← Back to Task Library</Link>
          <button className="btn btn-secondary" onClick={() => setEditMode(!editMode)}>{editMode ? 'Cancel' : 'Edit'}</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {editMode ? (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                className="form-control"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Document Link</label>
              <input
                type="url"
                className="form-control"
                value={form.doc_url || ''}
                onChange={(e) => setForm({ ...form, doc_url: e.target.value })}
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
                {ROLES.map((role) => <option key={role} value={role}>{role || 'Unassigned / any role'}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Role', value: item.role || '-' },
              { label: 'Document', value: item.doc_url ? <a href={item.doc_url} target="_blank" rel="noopener noreferrer">Open Doc</a> : '-' },
            ].map((entry) => (
              <div
                key={entry.label}
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{entry.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, overflowWrap: 'break-word' }}>{entry.value}</div>
              </div>
            ))}
          </div>
        )}
        {item.description && !editMode && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</div>
            <div
              style={{
                padding: '16px',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
              }}
            >
              {item.description}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
