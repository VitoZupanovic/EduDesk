import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './HomePage.css'

// Dashboard landing screen.
// Shows a quick navigation grid to the main areas of the app.
// Cards visible to a user depend on whether they are logged in and their role.
export default function HomePage() {
  const { isAuthenticated, role, email } = useAuth()

  return (
    <main className="page-container home-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">EduDesk</h1>
          <p className="home-welcome">
            {isAuthenticated
              ? `Welcome back${email ? `, ${email}` : ''}.`
              : 'A simple course platform for courses, notifications and files.'}
          </p>
        </div>
      </header>

      <div className="app-page-content app-fade-in">
      {!isAuthenticated && (
        <section className="app-card home-login-card">
          <h2 className="home-card-title">Please log in</h2>
          <p className="home-card-text">
            Sign in to see your courses and notifications.
          </p>
          <Link to="/login" className="app-button-primary">
            Go to login
          </Link>
        </section>
      )}

      {/* Navigation cards (shown only to logged-in users). */}
      {isAuthenticated && (
        <section className="home-grid">
          <NavCard
            title="Courses"
            description="Browse, open and manage courses."
            to="/courses"
            actionLabel="Open courses"
          />

          <NavCard
            title="Notifications"
            description="Read course notifications and announcements."
            to="/notifications"
            actionLabel="Open notifications"
          />

          {/* Files do not have a dedicated route yet; they live inside courses. */}
          <NavCard
            title="Files"
            description="Course files are available from each course page."
            to="/courses"
            actionLabel="Browse courses"
          />

          {/* Admin-only cards */}
          {role === 'Admin' && (
            <>
              <NavCard
                title="Users"
                description="Manage user accounts."
                to="/users"
                actionLabel="Open users"
              />

              <NavCard
                title="Create user"
                description="Add a new user account (admin only)."
                to="/register"
                actionLabel="Create user"
              />
            </>
          )}
        </section>
      )}
      </div>
    </main>
  )
}

// Small local component to keep the JSX above tidy.
function NavCard({ title, description, to, actionLabel }) {
  return (
    <article className="app-card home-card">
      <h2 className="home-card-title">{title}</h2>
      <p className="home-card-text">{description}</p>
      <Link to={to} className="app-button-primary">
        {actionLabel}
      </Link>
    </article>
  )
}
