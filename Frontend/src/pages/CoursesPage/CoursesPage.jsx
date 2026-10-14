import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import {
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from '../../services/courseService'
import { getStudentCourseItems } from '../../services/studentCourseItemService'
import { getUsers } from '../../services/userService'
import CourseCard from '../../components/CourseCard/CourseCard'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import CourseAssignStudentsModal from '../../components/CourseAssignStudentsModal/CourseAssignStudentsModal'
import './CoursesPage.css'

const LECTURER_ROLE_ID = 2

function getEmptyForm() {
  return {
    name: '',
    shortDescription: '',
    details: '',
    ectsScore: '',
    lecturerId: '',
  }
}

function courseToForm(course) {
  return {
    name: course.name || '',
    shortDescription: course.shortDescription || '',
    details: course.details || '',
    ectsScore:
      course.ectsScore !== undefined && course.ectsScore !== null
        ? String(course.ectsScore)
        : '',
    lecturerId: course.lecturerId ? String(course.lecturerId) : '',
  }
}

function formToCourseDto(form) {
  return {
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim(),
    details: form.details.trim(),
    ectsScore: Number(form.ectsScore),
    // lecturerId is part of CourseDto on create/update (nullable = unassigned).
    lecturerId: form.lecturerId ? Number(form.lecturerId) : null,
  }
}

export default function CoursesPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isAdmin = role === 'Admin'

  const [courses, setCourses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchText, setSearchText] = useState('')
  const [courseForm, setCourseForm] = useState(getEmptyForm())
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [courseToManageStudents, setCourseToManageStudents] = useState(null)
  const [enrollmentItems, setEnrollmentItems] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const courseNameInputRef = useRef(null)

  const loadCourses = useCallback(async function loadCourses(showLoading = true) {
    if (showLoading) {
      setIsLoading(true)
    }

    setErrorMessage('')

    try {
      const coursePromise = getCourses()
      const enrollmentPromise = getStudentCourseItems()
      const userPromise = isAdmin ? getUsers() : Promise.resolve([])

      const [courseData, enrollmentData, userData] = await Promise.all([
        coursePromise,
        enrollmentPromise,
        userPromise,
      ])

      setCourses(Array.isArray(courseData) ? courseData : [])
      setEnrollmentItems(Array.isArray(enrollmentData) ? enrollmentData : [])

      if (isAdmin) {
        const lecturerList = (Array.isArray(userData) ? userData : []).filter(
          (user) => user.roleId === LECTURER_ROLE_ID,
        )
        setLecturers(lecturerList)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load courses.')
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  // After Edit opens the form, focus the course name field for quick typing.
  useEffect(() => {
    if (isFormVisible && editingCourse && courseNameInputRef.current) {
      courseNameInputRef.current.focus()
      courseNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isFormVisible, editingCourse])

  const search = searchText.trim().toLowerCase()
  const filteredCourses = search
    ? courses.filter((course) => {
        const name = (course.name || '').toLowerCase()
        const shortDescription = (course.shortDescription || '').toLowerCase()
        return name.includes(search) || shortDescription.includes(search)
      })
    : courses

  // Open goes to the course details hub.
  function handleOpen(course) {
    if (course?.id) {
      navigate(`/courses/${course.id}`)
    }
  }

  function handleNewCourse() {
    setEditingCourse(null)
    setCourseForm(getEmptyForm())
    setIsFormVisible(true)
    setErrorMessage('')
  }

  function handleEdit(course) {
    setEditingCourse(course)
    setCourseForm(courseToForm(course))
    setIsFormVisible(true)
    setErrorMessage('')
  }

  function handleDelete(course) {
    setCourseToDelete(course)
  }

  function handleManageStudents(course) {
    setCourseToManageStudents(course)
  }

  function cancelForm() {
    setIsFormVisible(false)
    setEditingCourse(null)
    setCourseForm(getEmptyForm())
  }

  function updateCourseForm(event) {
    setCourseForm({
      ...courseForm,
      [event.target.name]: event.target.value,
    })
  }

  async function handleCreateCourse(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSaving(true)

    try {
      await createCourse(formToCourseDto(courseForm))
      cancelForm()
      // Reload so cards show the new course and lecturer names from the backend.
      await loadCourses(false)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create course.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateCourse(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSaving(true)

    try {
      await updateCourse(editingCourse.id, formToCourseDto(courseForm))
      cancelForm()
      await loadCourses(false)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update course.')
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmDeleteCourse() {
    setErrorMessage('')

    try {
      await deleteCourse(courseToDelete.id)
      setCourseToDelete(null)
      if (editingCourse?.id === courseToDelete.id) {
        cancelForm()
      }
      await loadCourses(false)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete course.')
      setCourseToDelete(null)
    }
  }

  function getEnrolledCount(courseId) {
    return enrollmentItems.filter((item) => item.courseId === courseId).length
  }

  return (
    <main className="page-container courses-page">
      <header className="page-header courses-page__header">
        <h1 className="page-title">Courses</h1>

        <div className="page-actions courses-page__actions">
          {isAdmin && (
            <button
              type="button"
              className="app-button-primary"
              onClick={handleNewCourse}
            >
              + New course
            </button>
          )}
        </div>
      </header>

      <div className="courses-toolbar">
        <div className="courses-search">
          <input
            type="search"
            className="app-form-control"
            placeholder="Search courses..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
      </div>

      <div className="app-page-content app-fade-in courses-page__content">
      {isLoading && (
        <p className="app-message app-message-loading">Loading courses...</p>
      )}

      {!isLoading && errorMessage && (
        <p className="app-message app-message-error">{errorMessage}</p>
      )}

      {!isLoading && isAdmin && isFormVisible && (
        <section className="app-card courses-form-card">
          <h2 className="courses-form-title">
            {editingCourse ? 'Edit course' : 'Add course'}
          </h2>
          <form
            className="row g-3"
            onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
          >
            <div className="col-12 col-md-6">
              <input
                ref={courseNameInputRef}
                className="app-form-control"
                name="name"
                placeholder="Course name"
                value={courseForm.name}
                onChange={updateCourseForm}
                required
              />
            </div>

            <div className="col-12 col-md-3">
              <input
                className="app-form-control"
                name="ectsScore"
                type="number"
                min="0"
                step="0.5"
                placeholder="ECTS"
                value={courseForm.ectsScore}
                onChange={updateCourseForm}
                required
              />
            </div>

            <div className="col-12 col-md-3">
              <select
                className="app-form-control"
                name="lecturerId"
                value={courseForm.lecturerId}
                onChange={updateCourseForm}
              >
                <option value="">Lecturer: Not assigned</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.firstName} {lecturer.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <input
                className="app-form-control"
                name="shortDescription"
                placeholder="Short description"
                value={courseForm.shortDescription}
                onChange={updateCourseForm}
              />
            </div>

            <div className="col-12">
              <textarea
                className="app-form-control courses-details-textarea"
                name="details"
                placeholder="Details"
                value={courseForm.details}
                onChange={updateCourseForm}
              />
            </div>

            <div className="col-12 page-actions">
              <button
                type="submit"
                className="app-button-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : editingCourse ? 'Save' : 'Add course'}
              </button>
              <button
                type="button"
                className="app-button-secondary"
                onClick={cancelForm}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {!isLoading && filteredCourses.length === 0 && !errorMessage && (
        <p className="app-message courses-empty-state">No courses found.</p>
      )}

      {!isLoading && filteredCourses.length > 0 && (
        <section className="courses-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              role={role}
              enrolledCount={getEnrolledCount(course.id)}
              onOpen={handleOpen}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageStudents={handleManageStudents}
            />
          ))}
        </section>
      )}

      </div>

      {courseToDelete && (
        <ConfirmModal
          show={Boolean(courseToDelete)}
          title="Delete course"
          message={`Delete "${courseToDelete.name}"? This cannot be undone.`}
          confirmText="Delete"
          onCancel={() => setCourseToDelete(null)}
          onConfirm={confirmDeleteCourse}
        />
      )}

      {courseToManageStudents && (
        <CourseAssignStudentsModal
          mode="manage"
          course={courseToManageStudents}
          onClose={() => setCourseToManageStudents(null)}
          onSaved={() => loadCourses(false)}
        />
      )}
    </main>
  )
}
