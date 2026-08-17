import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { taskLibrary } from '../api'

const ROLES = ['', 'AI/ML Intern', 'Data Science Intern', 'Full Stack Intern']

export default function TaskLibraryList() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ role: '', search: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [filters])

  const loadItems = async () => {
    setLoading(true)
    try {
      const res = await taskLibrary.list(filters)
      setItems(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task from the library? Existing intern assignments for it will also be removed.')) return
    try {
      await taskLibrary.delete(id)
      loadItems()
    } catch (err) {
      alert('Failed to delete task')
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Task Library</h1>
        <Link to="/task-library/new" className="btn btn-primary">+ Add Task Link</Link>
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
          style={{ maxWidth: '200px' }}
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          {ROLES.map((role) => <option key={role} value={role}>{role || 'All Roles'}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '200px' }}>
            <div className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">No task links yet. Add one per role to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Role</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><Link to={`/task-library/${item.id}`}>{item.title}</Link></td>
                  <td>{item.role || '-'}</td>
                  <td>
                    {item.doc_url ? (
                      <a href={item.doc_url} target="_blank" rel="noopener noreferrer">Open Doc</a>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/task-library/${item.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
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
