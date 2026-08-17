import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { tasks, interns, taskLibrary, getErrorMessage } from '../api'

const STATUSES = ['Not Started', 'In Progress', 'Completed']

export default function AssignTask() {
  const [searchParams] = useSearchParams()
  const preselectedIntern = searchParams.get('intern')

  const [form, setForm] = useState({
    task_id: '',
    intern_id: preselectedIntern || '',
    due_date: '',
    status: 'Not Started',
  })
  const [internsList, setInternsList] = useState([])
  const [libraryItems, setLibraryItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    interns.list().then((res) => setInternsList(res.data))
    taskLibrary.list().then((res) => setLibraryItems(res.data))
  }, [])

  const selectedIntern = internsList.find((i) => i.id === form.intern_id)
  const suggestedItems = selectedIntern
    ? libraryItems.filter((item) => !item.role || item.role === selectedIntern.role)
    : libraryItems

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await tasks.assign(form)
      navigate(preselectedIntern ? `/interns/${preselectedIntern}` : '/tasks')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to assign task'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Assign Task</h1>
        <Link to="/tasks" className="btn btn-secondary">← Back to Tasks</Link>
      </div>

      <div className="card" style={{ maxWidth: '650px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        {libraryItems.length === 0 ? (
          <div className="empty-state">
            No tasks in the library yet. <Link to="/task-library/new">Add one</Link> before assigning.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Intern</label>
              <select
                className="form-control"
                value={form.intern_id}
                onChange={(e) => setForm({ ...form, intern_id: e.target.value })}
                required
              >
                <option value="">Select intern</option>
                {internsList.map((intern) => (
                  <option key={intern.id} value={intern.id}>{intern.name} ({intern.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Task</label>
              <select
                className="form-control"
                value={form.task_id}
                onChange={(e) => setForm({ ...form, task_id: e.target.value })}
                required
              >
                <option value="">Select task from library</option>
                {suggestedItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}{item.role ? ` (${item.role})` : ''}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.due_date}
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
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Task'}
              </button>
              <Link to="/tasks" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
