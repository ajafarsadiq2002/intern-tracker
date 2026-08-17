import { useEffect, useRef, useState } from 'react'
import { assistant, getErrorMessage } from '../api'

export default function Assistant() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingReply, setLoadingReply] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    setLoadingList(true)
    try {
      const res = await assistant.listConversations()
      setConversations(res.data)
    } finally {
      setLoadingList(false)
    }
  }

  const openConversation = async (id) => {
    setError('')
    setActiveId(id)
    const res = await assistant.getConversation(id)
    setMessages(res.data.messages)
  }

  const startNewChat = () => {
    setError('')
    setActiveId(null)
    setMessages([])
  }

  const deleteConversation = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return
    await assistant.deleteConversation(id)
    setConversations(conversations.filter((c) => c.id !== id))
    if (activeId === id) {
      setActiveId(null)
      setMessages([])
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setError('')

    let conversationId = activeId
    if (!conversationId) {
      const res = await assistant.createConversation()
      conversationId = res.data.id
      setConversations([res.data, ...conversations])
      setActiveId(conversationId)
    }

    const userText = input
    setInput('')
    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, role: 'user', content: userText }])
    setLoadingReply(true)

    try {
      const res = await assistant.sendMessage(conversationId, userText)
      setMessages((prev) => [...prev, res.data.reply])
      setConversations((prev) => {
        const updated = prev.map((c) => (c.id === conversationId ? res.data.conversation : c))
        return updated.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to get a reply from the assistant'))
    } finally {
      setLoadingReply(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Assistant</h1>
      </div>

      <div className="card" style={{ padding: 0, display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '560px', overflow: 'hidden' }}>
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={startNewChat}>+ New Chat</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loadingList ? (
              <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>No conversations yet.</div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: activeId === c.id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    borderLeft: activeId === c.id ? '3px solid #22d3ee' : '3px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '2px 8px', fontSize: '11px', flexShrink: 0 }}
                    onClick={(e) => deleteConversation(c.id, e)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Ask about interns, their tasks, or ask it to draft a welcome, task-assignment, or HR completion-request email.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #06b6d4, #8b5cf6)' : 'rgba(15, 23, 42, 0.6)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '14px',
                }}
              >
                {m.content}
              </div>
            ))}
            {loadingReply && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '13px' }}>Assistant is thinking...</div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && <div className="alert alert-error" style={{ margin: '0 20px 12px' }}>{error}</div>}

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', padding: '16px', borderTop: '1px solid var(--border)' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Message the assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loadingReply}
            />
            <button type="submit" className="btn btn-primary" disabled={loadingReply || !input.trim()}>Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}
