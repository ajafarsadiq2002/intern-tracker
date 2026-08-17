import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { taskLibrary, getErrorMessage } from '../api'

const ROLES = ['', 'AI/ML Intern', 'Data Science Intern', 'Full Stack Intern']

export default function AddTaskLibraryItem() {
  const [form, setForm] = useState({ title: '', description: '', doc_url: '', role: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await taskLibrary.create({ ...form, role: form.role || null })
      navigate('/task-library')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add task'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Add Task Link</h1>
        <Link to="/task-library" className="btn btn-secondary">← Back to Task Library</Link>
      </div>

      <div className="card" style={{ maxWidth: '650px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. AI/ML Internship Tasks"
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
              placeholder="https://docs.google.com/document/d/..."
              value={form.doc_url}
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
              placeholder="Brief description of the task document..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Task Link'}
            </button>
            <Link to="/task-library" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
