const STATUS_MAP = {
  'Onboarding': 'badge-onboarding',
  'Active': 'badge-active',
  'Completed': 'badge-completed',
  'Dropped': 'badge-dropped',
  'Not Started': 'badge-not-started',
  'In Progress': 'badge-in-progress',
}

export default function StatusBadge({ status }) {
  const className = STATUS_MAP[status] || 'badge-onboarding'
  return <span className={`badge ${className}`}>{status}</span>
}
