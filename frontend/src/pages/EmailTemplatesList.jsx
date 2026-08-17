import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { emailTemplates } from '../api'

export default function EmailTemplatesList() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const res = await emailTemplates.list()
      setTemplates(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Email Templates</h1>
      </div>

      <div className="card">
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
          These templates are used when sending welcome emails to interns. Click a template to customize it.
        </p>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '200px' }}>
            <div className="spinner" />
          </div>
        ) : templates.length === 0 ? (
          <div className="empty-state">No templates found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: '20px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{template.role}</div>
                  <Link
                    to={`/email-templates/${encodeURIComponent(template.role)}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </Link>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>{template.subject}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
