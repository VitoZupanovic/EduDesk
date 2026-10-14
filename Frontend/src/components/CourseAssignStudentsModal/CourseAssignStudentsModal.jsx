import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getUsers } from '../../services/userService'
import {
  createStudentCourseItem,
  deleteStudentCourseItem,
  getStudentCourseItems,
} from '../../services/studentCourseItemService'
import ConfirmModal from '../ConfirmModal/ConfirmModal'
import './CourseAssignStudentsModal.css'

const STUDENT_ROLE_ID = 3

export default function CourseAssignStudentsModal({
  mode = 'manage',
  course,
  onClose,
  onSaved,
}) {
  const isManageMode = mode === 'manage'
  const [students, setStudents] = useState([])
  const [courseEnrollments, setCourseEnrollments] = useState([])
  const [enrollmentByStudentId, setEnrollmentByStudentId] = useState({})
  const [originalEnrolledIds, setOriginalEnrolledIds] = useState(new Set())
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [pendingRemovalIds, setPendingRemovalIds] = useState([])

  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const [userData, enrollmentData] = await Promise.all([
        getUsers(),
        getStudentCourseItems(),
      ])

      const courseId = Number(course.id)
      const enrollmentsForCourse = (Array.isArray(enrollmentData) ? enrollmentData : []).filter(
        (item) => item.courseId === courseId,
      )
      const enrolledStudentIds = new Set(
        enrollmentsForCourse.map((item) => item.studentId),
      )
      const enrollmentLookup = Object.fromEntries(
        enrollmentsForCourse.map((item) => [item.studentId, item]),
      )

      const allStudents = (Array.isArray(userData) ? userData : []).filter(
        (user) => user.roleId === STUDENT_ROLE_ID,
      )
      const sortedStudents = allStudents.sort((left, right) => {
        const leftIsEnrolled = enrolledStudentIds.has(left.id)
        const rightIsEnrolled = enrolledStudentIds.has(right.id)
        if (leftIsEnrolled && !rightIsEnrolled) return -1
        if (!leftIsEnrolled && rightIsEnrolled) return 1

        const leftName = `${left.firstName || ''} ${left.lastName || ''}`.toLowerCase()
        const rightName = `${right.firstName || ''} ${right.lastName || ''}`.toLowerCase()
        return leftName.localeCompare(rightName)
      })

      setStudents(sortedStudents)
      setCourseEnrollments(enrollmentsForCourse)
      setEnrollmentByStudentId(enrollmentLookup)
      setOriginalEnrolledIds(enrolledStudentIds)
      setSelectedIds(new Set(enrolledStudentIds))
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load students.')
    } finally {
      setIsLoading(false)
    }
  }, [course.id])

  useEffect(() => {
    let cancelled = false

    async function loadWithGuard() {
      await loadStudents()
      if (cancelled) {
        return
      }
    }
    loadWithGuard()

    return () => {
      cancelled = true
    }
  }, [loadStudents])

  const filteredStudents = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    if (!query) {
      return students
    }

    return students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`
      const email = student.email || ''

      return (
        fullName.toLowerCase().includes(query) || email.toLowerCase().includes(query)
      )
    })
  }, [students, searchText])

  function toggleStudent(studentId) {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
    setErrorMessage('')
  }

  const enrolledStudents = filteredStudents.filter((student) => selectedIds.has(student.id))
  const notEnrolledStudents = filteredStudents.filter((student) => !selectedIds.has(student.id))

  function getDiff() {
    const toAdd = [...selectedIds].filter((id) => !originalEnrolledIds.has(id))
    const toRemove = [...originalEnrolledIds].filter((id) => !selectedIds.has(id))
    return { toAdd, toRemove }
  }

  async function saveChanges(toAdd, toRemove) {
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await Promise.all(
        toAdd.map((studentId) =>
          createStudentCourseItem({
            studentId: studentId,
            courseId: course.id,
          }),
        ),
      )

      await Promise.all(
        toRemove.map((studentId) => {
          const enrollment = enrollmentByStudentId[studentId]
          if (!enrollment) {
            return Promise.resolve()
          }
          return deleteStudentCourseItem(enrollment.id)
        }),
      )

      await loadStudents()
      setPendingRemovalIds([])
      if (onSaved) {
        await onSaved()
      }
      setSuccessMessage('Enrollment changes were saved.')
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save enrollment changes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSaveEnrollmentChanges() {
    const { toAdd, toRemove } = getDiff()
    if (toAdd.length === 0 && toRemove.length === 0) {
      return
    }

    if (toRemove.length > 0) {
      setPendingRemovalIds(toRemove)
      return
    }

    saveChanges(toAdd, toRemove)
  }

  return createPortal(
    <div className="casm-overlay" onClick={onClose}>
      <section
        className="casm app-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="casm-header">
          <h2>{isManageMode ? 'Manage students' : 'Enrolled students'}</h2>
          <button
            type="button"
            className="casm-close"
            onClick={onClose}
            aria-label="Close student assignment modal"
          >
            &times;
          </button>
        </header>

        <p className="casm-course-name">
          Course: <strong>{course.name}</strong>
        </p>

        <p className="casm-enrollment-summary">
          Enrolled: {courseEnrollments.length}
        </p>

        {successMessage && <p className="app-message">{successMessage}</p>}

        {isLoading ? (
          <p className="app-message app-message-loading">Loading students...</p>
        ) : (
          <>
            <input
              type="search"
              className="app-form-control"
              placeholder="Search students by name or email..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />

            <ul className="casm-student-list">
              {filteredStudents.length === 0 ? (
                <li className="casm-empty">
                  {students.length === 0
                    ? 'No students found.'
                    : 'No students match your search.'}
                </li>
              ) : (
                <>
                  <li className="casm-section-title">Enrolled students</li>
                  {enrolledStudents.length === 0 && (
                    <li className="casm-empty">No students enrolled.</li>
                  )}
                  {enrolledStudents.map((student) => (
                    <li key={student.id} className="casm-student-item">
                      <label className="casm-student-label">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          disabled={!isManageMode}
                        />
                        <span>
                          {student.firstName} {student.lastName} ({student.email})
                        </span>
                      </label>
                    </li>
                  ))}

                  {isManageMode && (
                    <>
                      <li className="casm-section-title">Not enrolled</li>
                      {notEnrolledStudents.length === 0 && (
                        <li className="casm-empty">No more students to add.</li>
                      )}
                      {notEnrolledStudents.map((student) => (
                        <li key={student.id} className="casm-student-item">
                          <label className="casm-student-label">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              disabled={!isManageMode}
                            />
                            <span>
                              {student.firstName} {student.lastName} ({student.email})
                            </span>
                          </label>
                        </li>
                      ))}
                    </>
                  )}
                </>
              )}
            </ul>
          </>
        )}

        {errorMessage && <p className="app-message app-message-error">{errorMessage}</p>}

        <div className="casm-actions">
          <button
            type="button"
            className="app-button-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </button>
          {isManageMode && (
            <button
              type="button"
              className="app-button-primary"
              onClick={handleSaveEnrollmentChanges}
              disabled={
                isLoading ||
                isSubmitting ||
                getDiff().toAdd.length + getDiff().toRemove.length === 0
              }
            >
              {isSubmitting ? 'Saving...' : 'Save enrollment changes'}
            </button>
          )}
        </div>
      </section>

      {pendingRemovalIds.length > 0 && (
        <ConfirmModal
          show={true}
          title="Confirm student removal"
          message={`Remove ${pendingRemovalIds.length} student(s) from "${course.name}"?`}
          confirmText="Remove and save"
          onCancel={() => setPendingRemovalIds([])}
          onConfirm={() => {
            const { toAdd, toRemove } = getDiff()
            saveChanges(toAdd, toRemove)
          }}
          isLoading={isSubmitting}
        />
      )}
    </div>,
    document.body,
  )
}
