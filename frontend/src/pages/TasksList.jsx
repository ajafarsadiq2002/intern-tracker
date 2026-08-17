import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tasks as tasksApi, interns as internsApi } from '../api'
import StatusBadge from '../components/StatusBadge'

const STATUSES = ['', 'Not Started', 'In Progress', 'Completed']

export default function TasksList() {
  const [tasks, setTasks] = useState([])
  const [interns, setInterns] = useState([])
  const [filters, setFilters] = useState({ status: '', intern_id: '', search: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksRes, internsRes] = await Promise.all([
        tasksApi.list(filters),
        internsApi.list(),
      ])
      setTasks(tasksRes.data)
      setInterns(internsRes.data)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Unassign this task from the intern?')) return
    try {
      await tasksApi.delete(id)
      loadData()
    } catch (err) {
      alert('Failed to unassign task')
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Tasks</h1>
        <div className="actions">
          <Link to="/task-library" className="btn btn-secondary">Task Library</Link>
          <Link to="/tasks/new" className="btn btn-primary">+ Assign Task</Link>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search task title"
          className="form-control"
          style={{ maxWidth: '300px' }}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="form-control"
          style={{ maxWidth: '180px' }}
          value={filters.intern_id}
          onChange={(e) => setFilters({ ...filters, intern_id: e.target.value })}
        >
          <option value="">All Interns</option>
          {interns.map((intern) => (
            <option key={intern.id} value={intern.id}>{intern.name}</option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ maxWidth: '180px' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '200px' }}>
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No tasks found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Intern</th>
                <th>Document</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((assignment) => (
                <tr key={assignment.id}>
                  <td><Link to={`/tasks/${assignment.id}`}>{assignment.task?.title}</Link></td>
                  <td><Link to={`/interns/${assignment.intern_id}`}>{assignment.intern?.name}</Link></td>
                  <td>
                    {assignment.task?.doc_url ? (
                      <a href={assignment.task.doc_url} target="_blank" rel="noopener noreferrer">Open Doc</a>
                    ) : '-'}
                  </td>
                  <td>{assignment.due_date || '-'}</td>
                  <td><StatusBadge status={assignment.status} /></td>
                  <td>
                    <div className="actions">
                      <Link to={`/tasks/${assignment.id}`} className="btn btn-secondary btn-sm">View</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(assignment.id)}>Unassign</button>
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
