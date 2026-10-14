import './NotificationCard.css'

function formatDate(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleString()
}

export default function NotificationCard({ notification, role, onEdit, onDelete }) {
  if (!notification) {
    return null
  }

  const canManage = role === 'Admin' || role === 'Lecturer'

  return (
    <article className="app-card notification-card">
      <header className="notification-card-header">
        <h3>{notification.title}</h3>
        <span>{notification.courseName || 'Global'}</span>
      </header>

      <p className="notification-card-text">{notification.text}</p>

      <dl className="notification-card-meta">
        <div>
          <dt>Published</dt>
          <dd>{formatDate(notification.publishDate)}</dd>
        </div>
        <div>
          <dt>Expires</dt>
          <dd>{formatDate(notification.expirationDate)}</dd>
        </div>
        <div>
          <dt>Created by</dt>
          <dd>{notification.creatorFullName || notification.creatorEmail}</dd>
        </div>
      </dl>

      {canManage && (
        <div className="notification-card-actions">
          <button
            type="button"
            className="app-button-secondary"
            onClick={() => onEdit && onEdit(notification)}
          >
            Edit
          </button>
          <button
            type="button"
            className="app-button-danger"
            onClick={() => onDelete && onDelete(notification)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  )
}
