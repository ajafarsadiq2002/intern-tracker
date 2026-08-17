import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { tasks as tasksApi, getErrorMessage } from '../api'
import StatusBadge from '../components/StatusBadge'

const STATUSES = ['Not Started', 'In Progress', 'Completed']

export default function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await tasksApi.get(id)
      setAssignment(res.data)
      setForm({ due_date: res.data.due_date || '', status: res.data.status })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await tasksApi.update(id, form)
      setAssignment(res.data)
      setEditMode(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update assignment'))
    }
  }

  const handleDelete = async () => {
    if (!confirm('Unassign this task from the intern?')) return
    await tasksApi.delete(id)
    navigate('/tasks')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }
  if (!assignment) return <div className="container">Task assignment not found.</div>

  const task = assignment.task

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>{task?.title}</h1>
        <div className="actions">
          {task?.doc_url && (
            <a href={task.doc_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open Document</a>
          )}
          <button className="btn btn-secondary" onClick={() => setEditMode(!editMode)}>{editMode ? 'Cancel' : 'Edit'}</button>
          <button className="btn btn-danger" onClick={handleDelete}>Unassign</button>
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {editMode ? (
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.due_date || ''}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
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
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Intern', value: <Link to={`/interns/${assignment.intern_id}`}>{assignment.intern?.name}</Link> },
              { label: 'Role', value: task?.role || '-' },
              { label: 'Due Date', value: assignment.due_date || '-' },
              { label: 'Status', value: <StatusBadge status={assignment.status} /> },
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
        {task?.description && !editMode && (
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
              {task.description}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
