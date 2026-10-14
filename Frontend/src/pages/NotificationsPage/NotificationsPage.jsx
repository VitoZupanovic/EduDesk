import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { getCourses } from '../../services/courseService'
import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from '../../services/notificationService'
import NotificationCard from '../../components/NotificationCard/NotificationCard'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import './NotificationsPage.css'

function getEmptyForm() {
  return {
    courseId: '',
    title: '',
    text: '',
    expirationDate: '',
  }
}

function toInputDateTime(value) {
  return value ? value.slice(0, 16) : ''
}

export default function NotificationsPage() {
  const { role } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [notificationForm, setNotificationForm] = useState(getEmptyForm())
  const [editingNotification, setEditingNotification] = useState(null)
  const [notificationToDelete, setNotificationToDelete] = useState(null)

  const canManage = role === 'Admin' || role === 'Lecturer'

  async function loadData(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setErrorMessage('')

    try {
      const [notificationData, courseData] = await Promise.all([
        getNotifications(),
        canManage ? getCourses() : Promise.resolve([]),
      ])

      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      setCourses(Array.isArray(courseData) ? courseData : [])
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getNotifications(),
      canManage ? getCourses() : Promise.resolve([]),
    ])
      .then(([notificationData, courseData]) => {
        if (cancelled) {
          return
        }

        setNotifications(Array.isArray(notificationData) ? notificationData : [])
        setCourses(Array.isArray(courseData) ? courseData : [])
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error.message || 'Failed to load data.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [canManage, role])

  function updateNotificationForm(event) {
    setNotificationForm({
      ...notificationForm,
      [event.target.name]: event.target.value,
    })
  }

  async function handleCreateNotification(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      await createNotification({
        courseId: notificationForm.courseId
          ? Number(notificationForm.courseId)
          : null,
        title: notificationForm.title,
        text: notificationForm.text,
        expirationDate: notificationForm.expirationDate,
      })

      setNotificationForm(getEmptyForm())
      await loadData(false)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create notification.')
    }
  }

  function startEditNotification(notification) {
    setEditingNotification(notification)
    setNotificationForm({
      courseId: notification.courseId ? String(notification.courseId) : '',
      title: notification.title || '',
      text: notification.text || '',
      expirationDate: toInputDateTime(notification.expirationDate),
    })
  }

  function cancelEditNotification() {
    setEditingNotification(null)
    setNotificationForm(getEmptyForm())
  }

  async function handleUpdateNotification(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      const updatedNotification = await updateNotification(editingNotification.id, {
        courseId: notificationForm.courseId
          ? Number(notificationForm.courseId)
          : null,
        title: notificationForm.title,
        text: notificationForm.text,
        expirationDate: notificationForm.expirationDate,
      })

      setNotifications(
        notifications.map((item) =>
          item.id === updatedNotification.id ? updatedNotification : item,
        ),
      )
      cancelEditNotification()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update notification.')
    }
  }

  async function confirmDeleteNotification() {
    setErrorMessage('')

    try {
      await deleteNotification(notificationToDelete.id)
      setNotifications(
        notifications.filter((item) => item.id !== notificationToDelete.id),
      )
      setNotificationToDelete(null)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete notification.')
    }
  }

  return (
    <main className="page-container notifications-page">
      <header className="page-header">
        <h1 className="page-title">Notifications</h1>
      </header>

      <div className="app-page-content app-fade-in">
      {isLoading && <p className="app-message app-message-loading">Loading...</p>}

      {!isLoading && errorMessage && (
        <p className="app-message app-message-error">{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && canManage && (
        <section className="app-card">
          <h2 className="notifications-form-title">
            {editingNotification ? 'Edit notification' : 'Add notification'}
          </h2>
          <form
            className="row g-3"
            onSubmit={
              editingNotification
                ? handleUpdateNotification
                : handleCreateNotification
            }
          >
            <div className="col-12 col-md-4">
              <select
                className="app-form-control"
                name="courseId"
                value={notificationForm.courseId}
                onChange={updateNotificationForm}
              >
                <option value="">Global</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <input
                className="app-form-control"
                name="title"
                placeholder="Title"
                value={notificationForm.title}
                onChange={updateNotificationForm}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <input
                className="app-form-control"
                type="datetime-local"
                name="expirationDate"
                value={notificationForm.expirationDate}
                onChange={updateNotificationForm}
                required
              />
            </div>

            <div className="col-12">
              <textarea
                className="app-form-control notifications-textarea"
                name="text"
                placeholder="Text"
                value={notificationForm.text}
                onChange={updateNotificationForm}
                required
              />
            </div>

            <div className="col-12 page-actions">
              <button type="submit" className="app-button-primary">
                {editingNotification ? 'Save' : 'Add'}
              </button>
              {editingNotification && (
                <button
                  type="button"
                  className="app-button-secondary"
                  onClick={cancelEditNotification}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {!isLoading && !errorMessage && notifications.length === 0 && (
        <p className="app-message">No notifications found.</p>
      )}

      {!isLoading && !errorMessage && notifications.length > 0 && (
        <section>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              role={role}
              onEdit={startEditNotification}
              onDelete={setNotificationToDelete}
            />
          ))}
        </section>
      )}

      {notificationToDelete && (
        <ConfirmModal
          show={Boolean(notificationToDelete)}
          title="Delete notification"
          message={`Delete "${notificationToDelete.title}"?`}
          confirmText="Delete"
          onCancel={() => setNotificationToDelete(null)}
          onConfirm={confirmDeleteNotification}
        />
      )}
      </div>
    </main>
  )
}
