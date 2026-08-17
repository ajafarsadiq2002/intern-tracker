import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { interns as internsApi, tasks as tasksApi } from '../api'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [internsRes, tasksRes] = await Promise.all([
        internsApi.list(),
        tasksApi.list({ status: 'In Progress' }),
      ])
      const interns = internsRes.data
      const tasks = tasksRes.data

      const total = interns.length
      const byRole = {}
      const byStatus = {}
      interns.forEach((i) => {
        byRole[i.role] = (byRole[i.role] || 0) + 1
        byStatus[i.status] = (byStatus[i.status] || 0) + 1
      })

      setStats({ total, byRole, byStatus })
      setUpcomingTasks(tasks.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div>Loading dashboard...</div>
      </div>
    )
  }

  const statEntries = [
    { label: 'Total Interns', value: stats.total, color: '#22d3ee' },
    ...Object.entries(stats.byRole).map(([role, count]) => ({ label: role, value: count, color: '#8b5cf6' })),
  ]

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/interns/new" className="btn btn-primary">+ Onboard Intern</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {statEntries.map((stat, index) => (
          <div className="card stat-card" key={index}>
            <div className="stat-value" style={{ background: `linear-gradient(135deg, ${stat.color}, white)`, WebkitBackgroundClip: 'text' }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Intern Status Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div
                key={status}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                }}
              >
                <StatusBadge status={status} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="page-header" style={{ marginBottom: '16px' }}>
            <h3>In Progress Tasks</h3>
            <Link to="/tasks" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state">No in-progress tasks right now.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Intern</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTasks.map((assignment) => (
                  <tr key={assignment.id}>
                    <td><Link to={`/tasks/${assignment.id}`}>{assignment.task?.title}</Link></td>
                    <td>{assignment.intern?.name}</td>
                    <td>{assignment.due_date || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
