import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { interns, emails, getErrorMessage } from '../api'

export default function ComposeEmail() {
  const { internId } = useParams()
  const navigate = useNavigate()
  const [intern, setIntern] = useState(null)
  const [email, setEmail] = useState({ to: '', subject: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [internId])

  const loadData = async () => {
    setLoading(true)
    try {
      const internRes = await interns.get(internId)
      setIntern(internRes.data)

      const previewRes = await emails.preview(internId)
      setEmail(previewRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load email preview'))
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess('')
    try {
      const res = await emails.send(internId, email)
      setSuccess(res.data.message)
      setTimeout(() => navigate('/interns'), 1500)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send email'))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Compose Welcome Email</h1>
        <Link to="/interns" className="btn btn-secondary">← Back to Interns</Link>
      </div>

      {intern && (
        <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {intern.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{intern.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{intern.role} • {intern.email}</div>
          </div>
        </div>
      )}

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSend}>
          <div className="form-group">
            <label>To</label>
            <input
              type="email"
              className="form-control"
              value={email.to}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              className="form-control"
              value={email.subject}
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Body</label>
            <textarea
              className="form-control"
              rows={24}
              value={email.body}
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Sending...' : 'Send Welcome Email'}
          </button>
        </form>
      </div>
    </div>
  )
}
