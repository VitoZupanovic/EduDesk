import './CourseCard.css'

// Course summary card.
// Props:
// - course: a CourseDetailsDto from the backend.
// - role: current user's role ('Admin' | 'Lecturer' | 'Student' | null).
// - onOpen, onEdit, onDelete, onManageStudents: action handlers from parent.
// Edit/Delete are only shown to Admin; backend is still the real authority.
export default function CourseCard({
  course,
  role,
  onOpen,
  onEdit,
  onDelete,
  onManageStudents,
  enrolledCount = 0,
}) {
  if (!course) {
    return null
  }

  const {
    name,
    shortDescription,
    details,
    ectsScore,
    lecturerFullName,
    lecturerEmail,
  } = course

  return (
    <article className="app-card course-card">
      <header className="course-card-header">
        <h3 className="course-card-title">{name}</h3>
        {ectsScore !== undefined && ectsScore !== null && (
          <span className="course-card-ects">{ectsScore} ECTS</span>
        )}
      </header>

      {shortDescription && (
        <p className="course-card-description">{shortDescription}</p>
      )}

      {details && <p className="course-card-details">{details}</p>}

      <p className="course-card-lecturer">
        <span className="course-card-label">Lecturer: </span>
        {lecturerFullName || 'Not assigned'}
        {lecturerEmail && (
          <span className="course-card-lecturer-email"> ({lecturerEmail})</span>
        )}
      </p>
      {(role === 'Admin' || role === 'Lecturer') && (
        <p className="course-card-enrolled">
          <span className="course-card-label">Students enrolled: </span>
          {enrolledCount}
        </p>
      )}

      <div className="course-card-actions">
        <button
          type="button"
          className="app-button-primary"
          onClick={() => onOpen && onOpen(course)}
        >
          Open
        </button>

        {role === 'Admin' && (
          <>
            <button
              type="button"
              className="app-button-primary"
              onClick={() => onManageStudents && onManageStudents(course)}
            >
              Manage students
            </button>
            <button
              type="button"
              className="app-button-secondary"
              onClick={() => onEdit && onEdit(course)}
            >
              Edit
            </button>
            <button
              type="button"
              className="app-button-danger"
              onClick={() => onDelete && onDelete(course)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  )
}
