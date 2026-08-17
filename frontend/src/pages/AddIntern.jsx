import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { interns, getErrorMessage } from '../api'

const ROLES = ['AI/ML Intern', 'Data Science Intern', 'Full Stack Intern']
const STATUSES = ['Onboarding', 'Active', 'Completed', 'Dropped']

export default function AddIntern() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: ROLES[0],
    start_date: '',
    end_date: '',
    status: 'Onboarding',
  })
  const [present, setPresent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const togglePresent = () => {
    const next = !present
    setPresent(next)
    if (next) setForm({ ...form, end_date: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await interns.create({ ...form, end_date: present ? null : form.end_date || null })
      navigate('/interns')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add intern'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Onboard Intern</h1>
        <Link to="/interns" className="btn btn-secondary">← Back to Interns</Link>
      </div>

      <div className="card" style={{ maxWidth: '650px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter intern's full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="intern@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                value={form.start_date}
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
                value={form.end_date}
                disabled={present}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Onboard Intern'}
            </button>
            <Link to="/interns" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
