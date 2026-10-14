import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getCourseById } from '../../services/courseService'
import { getNotifications } from '../../services/notificationService'
import { getStudentCourseItems } from '../../services/studentCourseItemService'
import CourseAssignStudentsModal from '../../components/CourseAssignStudentsModal/CourseAssignStudentsModal'
import './CourseDetailsPage.css'

const TABS = {
  DETAILS: 'details',
  NOTIFICATIONS: 'notifications',
  STUDENTS: 'students',
}

function formatDate(value) {
  if (!value) {
    return ''
  }
  return new Date(value).toLocaleString()
}

export default function CourseDetailsPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const { courseId } = useParams()
  const numericCourseId = Number(courseId)
  const canViewStudents = role === 'Admin' || role === 'Lecturer'
  const canManageStudents = role === 'Admin'

  const [activeTab, setActiveTab] = useState(TABS.DETAILS)
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [enrollmentItems, setEnrollmentItems] = useState([])
  const [notifications, setNotifications] = useState([])
  const [studentsModalMode, setStudentsModalMode] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [courseData, enrollmentData, notificationData] = await Promise.all([
        getCourseById(numericCourseId),
        getStudentCourseItems(),
        getNotifications(),
      ])

      setCourse(courseData || null)
      setEnrollmentItems(Array.isArray(enrollmentData) ? enrollmentData : [])
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load course details.')
    } finally {
      setIsLoading(false)
    }
  }, [numericCourseId])

  useEffect(() => {
    if (!Number.isNaN(numericCourseId)) {
      loadData()
    } else {
      setErrorMessage('Invalid course id.')
      setIsLoading(false)
    }
  }, [numericCourseId, loadData])

  const enrolledCount = useMemo(
    () => enrollmentItems.filter((item) => item.courseId === numericCourseId).length,
    [enrollmentItems, numericCourseId],
  )

  const courseNotifications = useMemo(
    () => notifications.filter((item) => item.courseId === numericCourseId),
    [notifications, numericCourseId],
  )

  const isDetailsTab = activeTab === TABS.DETAILS

  return (
    <main className="page-container course-details-page">
      <div className="course-details-shell">
        <header className="course-details-header">
          <h1 className="page-title">{course?.name || 'Course details'}</h1>
          <p className="course-details-subtitle">
            <Link to="/courses" className="app-back-link">
              <span aria-hidden="true">&larr;</span> Back to courses
            </Link>
          </p>
        </header>

        {isLoading && <p className="app-message app-message-loading">Loading course...</p>}

        {!isLoading && errorMessage && (
          <p className="app-message app-message-error">{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && course && (
          <div className="course-details-tabs">
            <button
              type="button"
              className={isDetailsTab ? 'app-button-primary' : 'app-button-secondary'}
              onClick={() => setActiveTab(TABS.DETAILS)}
            >
              Details
            </button>
            <button
              type="button"
              className="app-button-secondary"
              onClick={() => navigate(`/courses/${numericCourseId}/files`)}
            >
              Files
            </button>
            <button
              type="button"
              className={
                activeTab === TABS.NOTIFICATIONS ? 'app-button-primary' : 'app-button-secondary'
              }
              onClick={() => setActiveTab(TABS.NOTIFICATIONS)}
            >
              Notifications
            </button>
            {canViewStudents && (
              <button
                type="button"
                className={
                  activeTab === TABS.STUDENTS ? 'app-button-primary' : 'app-button-secondary'
                }
                onClick={() => setActiveTab(TABS.STUDENTS)}
              >
                Students
              </button>
            )}
          </div>
        )}
      </div>

      {!isLoading && !errorMessage && course && (
        <div
          key={activeTab}
          className={`course-details-panel app-fade-in${
            isDetailsTab ? ' course-details-panel--details' : ''
          }`}
        >
          <section className="app-card course-details-section">
              {activeTab === TABS.DETAILS && (
                <>
                  <h2 className="course-details-section-title">Course information</h2>
                  <p><strong>ECTS:</strong> {course.ectsScore ?? '-'}</p>
                  <p><strong>Short description:</strong> {course.shortDescription || '-'}</p>
                  <p><strong>Details:</strong> {course.details || '-'}</p>
                  <p><strong>Lecturer:</strong> {course.lecturerFullName || 'Not assigned'}</p>
                  <p><strong>Lecturer email:</strong> {course.lecturerEmail || '-'}</p>
                </>
              )}

              {activeTab === TABS.NOTIFICATIONS && (
                <>
                  <h2 className="course-details-section-title">Notifications</h2>
                  {courseNotifications.length === 0 ? (
                    <p className="app-message">No notifications for this course.</p>
                  ) : (
                    <ul className="course-details-list">
                      {courseNotifications.map((item) => (
                        <li key={item.id} className="course-details-list-item">
                          <p className="course-details-list-title">{item.title}</p>
                          <p>{item.text}</p>
                          <p className="course-details-list-meta">
                            Expires: {formatDate(item.expirationDate)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {activeTab === TABS.STUDENTS && canViewStudents && (
                <>
                  <h2 className="course-details-section-title">Students</h2>
                  <p><strong>Enrolled:</strong> {enrolledCount}</p>
                  <div className="page-actions">
                    <button
                      type="button"
                      className="app-button-secondary"
                      onClick={() => setStudentsModalMode('view')}
                    >
                      View students
                    </button>
                    {canManageStudents && (
                      <button
                        type="button"
                        className="app-button-primary"
                        onClick={() => setStudentsModalMode('manage')}
                      >
                        Manage students
                      </button>
                    )}
                  </div>
                </>
              )}
          </section>
        </div>
      )}

      {studentsModalMode && course && (
        <CourseAssignStudentsModal
          mode={studentsModalMode}
          course={course}
          onClose={() => setStudentsModalMode('')}
          onSaved={loadData}
        />
      )}
    </main>
  )
}
