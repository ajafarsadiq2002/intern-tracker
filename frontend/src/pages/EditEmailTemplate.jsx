import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { emailTemplates, getErrorMessage } from '../api'

const PLACEHOLDER_PATTERN = /\{\{\s*[a-zA-Z_][\w]*\s*\}\}/g

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const PLACEHOLDER_BOX_STYLE =
  'display:inline-block;padding:1px 6px;margin:0 1px;border-radius:6px;' +
  'border:1px solid rgba(6, 182, 212, 0.5);background:rgba(6, 182, 212, 0.12);' +
  'color:#67e8f9;font-family:monospace;font-size:13px;'

// Wraps every {{ placeholder }} token in an editable inline box; surrounding prose stays plain text.
const renderBodyHtml = (text) => {
  const parts = []
  let lastIndex = 0
  let match
  const regex = new RegExp(PLACEHOLDER_PATTERN)
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)))
    }
    parts.push(`<span style="${PLACEHOLDER_BOX_STYLE}">${escapeHtml(match[0])}</span>`)
    lastIndex = match.index + match[0].length
  }
  parts.push(escapeHtml(text.slice(lastIndex)))
  return parts.join('')
}

export default function EditEmailTemplate() {
  const { role } = useParams()
  const navigate = useNavigate()
  const [template, setTemplate] = useState({ subject: '', body: '', placeholders: [] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    loadTemplate()
  }, [role])

  useEffect(() => {
    if (!loading && bodyRef.current) {
      bodyRef.current.innerHTML = renderBodyHtml(template.body || '')
    }
    // Only re-render boxes when a fresh template finishes loading, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const loadTemplate = async () => {
    try {
      const res = await emailTemplates.get(role)
      setTemplate(res.data)
    } catch (err) {
      setError('Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const bodyText = bodyRef.current ? bodyRef.current.innerText : template.body
    if (!template.subject.trim() || !bodyText.trim()) {
      setError('Subject and body are required')
      return
    }

    setSaving(true)
    try {
      const res = await emailTemplates.update(role, {
        subject: template.subject,
        body: bodyText,
      })
      setTemplate(res.data)
      setSuccess('Template saved successfully')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save template'))
    } finally {
      setSaving(false)
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
        <h1>Edit Template: {role}</h1>
        <Link to="/email-templates" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Email Subject</label>
            <input
              type="text"
              className="form-control"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Body</label>
            <div
              ref={bodyRef}
              className="form-control"
              contentEditable
              suppressContentEditableWarning
              style={{
                minHeight: '480px',
                maxHeight: '640px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                outline: 'none',
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </form>
      </div>
    </div>
  )
}
