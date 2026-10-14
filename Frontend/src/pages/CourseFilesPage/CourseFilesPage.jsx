import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getCourses } from '../../services/courseService'
import {
  createCourseFile,
  deleteCourseFile,
  getCourseFiles,
  updateCourseFile,
} from '../../services/courseFileService'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import './CourseFilesPage.css'

function getEmptyForm(courseId = null) {
  return {
    courseId: courseId ? String(courseId) : '',
    name: '',
    fileLink: '',
  }
}

function formatDate(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleString()
}

export default function CourseFilesPage() {
  const { role } = useAuth()
  const { courseId } = useParams()

  const [courseFiles, setCourseFiles] = useState([])
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState(getEmptyForm())
  const [editingFile, setEditingFile] = useState(null)
  const [fileToDelete, setFileToDelete] = useState(null)

  const canManage = role === 'Admin' || role === 'Lecturer'
  const selectedCourseId = courseId ? Number(courseId) : null
  const selectedCourse = courses.find((course) => course.id === selectedCourseId)
  const visibleFiles = selectedCourseId
    ? courseFiles.filter((file) => file.courseId === selectedCourseId)
    : courseFiles

  async function loadData() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [fileData, courseData] = await Promise.all([
        getCourseFiles(),
        canManage ? getCourses() : Promise.resolve([]),
      ])

      setCourseFiles(Array.isArray(fileData) ? fileData : [])
      setCourses(Array.isArray(courseData) ? courseData : [])
      if (selectedCourseId) {
        setFormData((currentData) => ({
          ...currentData,
          courseId: String(selectedCourseId),
        }))
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load course files.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getCourseFiles(),
      canManage ? getCourses() : Promise.resolve([]),
    ])
      .then(([fileData, courseData]) => {
        if (cancelled) {
          return
        }

        setCourseFiles(Array.isArray(fileData) ? fileData : [])
        setCourses(Array.isArray(courseData) ? courseData : [])
        if (selectedCourseId) {
          setFormData((currentData) => ({
            ...currentData,
            courseId: String(selectedCourseId),
          }))
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error.message || 'Failed to load course files.')
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
  }, [canManage, role, selectedCourseId])

  function updateForm(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  async function handleCreateFile(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      await createCourseFile({
        courseId: Number(formData.courseId),
        name: formData.name,
        fileLink: formData.fileLink,
      })

      setFormData(getEmptyForm(selectedCourseId))
      await loadData()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create course file.')
    }
  }

  function startEditFile(file) {
    setEditingFile(file)
    setFormData({
      courseId: String(file.courseId),
      name: file.name || '',
      fileLink: file.fileLink || '',
    })
  }

  function cancelEditFile() {
    setEditingFile(null)
    setFormData(getEmptyForm(selectedCourseId))
  }

  async function handleUpdateFile(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      const updatedFile = await updateCourseFile(editingFile.id, {
        courseId: Number(formData.courseId),
        name: formData.name,
        fileLink: formData.fileLink,
      })

      setCourseFiles(
        courseFiles.map((file) =>
          file.id === updatedFile.id ? updatedFile : file,
        ),
      )
      cancelEditFile()
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update course file.')
    }
  }

  async function confirmDeleteFile() {
    setErrorMessage('')

    try {
      await deleteCourseFile(fileToDelete.id)
      setCourseFiles(courseFiles.filter((file) => file.id !== fileToDelete.id))
      setFileToDelete(null)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete course file.')
    }
  }

  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">
            {selectedCourse ? `${selectedCourse.name} files` : 'Files'}
          </h1>
          {selectedCourseId && (
            <p>
              <Link to={`/courses/${selectedCourseId}`} className="app-back-link">
                <span aria-hidden="true">&larr;</span> Back to course details
              </Link>
            </p>
          )}
        </div>
      </header>

      <div className="app-page-content app-fade-in">
      {isLoading && <p className="app-message app-message-loading">Loading...</p>}

      {!isLoading && errorMessage && (
        <p className="app-message app-message-error">{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && canManage && (
        <section className="app-card">
          <h2 className="course-files-form-title">
            {editingFile ? 'Edit file' : 'Add file'}
          </h2>
          <form
            className="row g-3"
            onSubmit={editingFile ? handleUpdateFile : handleCreateFile}
          >
            <div className="col-12 col-md-4">
              <select
                className="app-form-control"
                name="courseId"
                value={formData.courseId}
                onChange={updateForm}
                disabled={selectedCourseId !== null}
                required
              >
                <option value="">Choose course</option>
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
                name="name"
                placeholder="File name"
                value={formData.name}
                onChange={updateForm}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <input
                className="app-form-control"
                name="fileLink"
                placeholder="File link"
                value={formData.fileLink}
                onChange={updateForm}
                required
              />
            </div>

            <div className="col-12 page-actions">
              <button type="submit" className="app-button-primary">
                {editingFile ? 'Save' : 'Add file'}
              </button>
              {editingFile && (
                <button
                  type="button"
                  className="app-button-secondary"
                  onClick={cancelEditFile}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {!isLoading && !errorMessage && visibleFiles.length === 0 && (
        <p className="app-message">No course files found.</p>
      )}

      {!isLoading &&
        !errorMessage &&
        visibleFiles.length > 0 && (
          <section className="course-files-grid">
            {visibleFiles.map((file) => (
              <article className="app-card course-file-card" key={file.id}>
                <header className="course-file-card-header">
                  <h3>{file.name}</h3>
                  <span>{file.courseName}</span>
                </header>

                <p>Added: {formatDate(file.createdAt)}</p>

                <div className="course-file-card-actions">
                  <a
                    className="app-button-primary"
                    href={file.fileLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </a>

                  {canManage && (
                    <>
                      <button
                        type="button"
                        className="app-button-secondary"
                        onClick={() => startEditFile(file)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="app-button-danger"
                        onClick={() => setFileToDelete(file)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

      {fileToDelete && (
        <ConfirmModal
          show={Boolean(fileToDelete)}
          title="Delete file"
          message={`Delete "${fileToDelete.name}"?`}
          confirmText="Delete"
          onCancel={() => setFileToDelete(null)}
          onConfirm={confirmDeleteFile}
        />
      )}
      </div>
    </main>
  )
}
