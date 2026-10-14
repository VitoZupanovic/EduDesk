import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getCourses } from '../../services/courseService'
import { createStudentCourseItem, getStudentCourseItems } from '../../services/studentCourseItemService'
import './AssignCourseModal.css'

export default function AssignCourseModal({ user, onClose }) {
  const [courses, setCourses]         = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch]           = useState('')          
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState(null)
  const [success, setSuccess]         = useState(false)

  useEffect(() => {
      Promise.all([getCourses(), getStudentCourseItems()])
        .then(([allCourses, enrollments]) => {
          const assignedCourseIds = new Set(
            enrollments
              .filter((e) => e.studentId === user.id)
              .map((e) => e.courseId)
          )
          setCourses(allCourses.filter((c) => !assignedCourseIds.has(c.id)))
        })
        .catch(() => setError('Failed to load courses.'))
        .finally(() => setLoading(false))
    }, [user.id])


  const selectionOrder = [...selectedIds]

  const filteredCourses = courses
  .filter((c) => c.name.toLowerCase().startsWith(search.toLowerCase()))
  .sort((a, b) => {
    const aIndex = selectionOrder.indexOf(a.id)
    const bIndex = selectionOrder.indexOf(b.id)
    const aSelected = aIndex !== -1
    const bSelected = bIndex !== -1
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    if (aSelected && bSelected) return aIndex - bIndex
    return 0
  })

  function toggleCourse(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setError(null)
  }

  async function handleAssign() {
    if (selectedIds.size === 0) return
    setSubmitting(true)
    setError(null)
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          createStudentCourseItem({ studentId: user.id, courseId: id })
        )
      )
      setSuccess(true)
    } catch (err) {
      setError(err?.message ?? 'Failed to assign course(s). The student may already be enrolled in one of the selected courses.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="acm-overlay" onClick={onClose}>
      <div className="acm" onClick={(e) => e.stopPropagation()}>
        <div className="acm__header">
          <h2 className="acm__title">Assign course</h2>
          <button className="acm__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {success ? (
          <>
            <p className="acm__success">
              {user.firstName} {user.lastName} has been successfully enrolled in {selectedIds.size} course{selectedIds.size > 1 ? 's' : ''}.
            </p>
            <div className="acm__actions">
              <button type="button" className="app-button-primary" onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <>
            <p className="acm__student">
              Student: <strong>{user.firstName} {user.lastName}</strong>
            </p>

            {loading ? (
              <p className="acm__status">Loading courses...</p>
            ) : (
              <>
                <input                                  
                  type="search"
                  className="acm__search"
                  placeholder="Search courses…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <ul className="acm__course-list">
                  {filteredCourses.length === 0 ? (
                    <li className="acm__course-empty">{search.trim() ? 'No courses match your search.' : 'No courses to assign.'}</li>
                  ) : (
                    filteredCourses.map((c) => (
                      <li key={c.id} className="acm__course-item">
                        <label className="acm__course-label">
                          <input
                            type="checkbox"
                            className="acm__checkbox"
                            checked={selectedIds.has(c.id)}
                            onChange={() => toggleCourse(c.id)}
                          />
                          <span>
                            {c.name}{c.lecturerFullName ? ` (${c.lecturerFullName})` : ''}
                          </span>
                        </label>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}

            {error && <p className="acm__error">{error}</p>}

            <div className="acm__actions">
              <button type="button" className="app-button-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className="app-button-primary" onClick={handleAssign} disabled={selectedIds.size === 0 || submitting || loading}>
                {submitting ? 'Assigning…' : `Assign`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}