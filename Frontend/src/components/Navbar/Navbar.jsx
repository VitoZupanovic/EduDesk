import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import logo from "../../assets/images/logo.jpeg";
import "./Navbar.css";

// Top navigation bar.
// Login/Logout and role-based links are driven by useAuth() from AuthContext.
export default function Navbar() {

  const navigate = useNavigate()
  const { isAuthenticated, role, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!showUserMenu) {
      return undefined
    }

    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  function confirmLogout() {
    setShowLogoutConfirm(false)
    logout()
    navigate('/login')
  }

  // Bootstrap adds an "active" class for active NavLinks; this helper avoids
  // mixing the regular Bootstrap class with the active class manually.
  function navLinkClass({ isActive }) {
    return isActive ? "nav-link active" : "nav-link";
  }

  function getUserInitial() {
    const token = localStorage.getItem('JWT')

    if (!token) {
      return 'U'
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const email = payload.unique_name || payload.sub || ''

      return email ? email.charAt(0).toUpperCase() : 'U'
    } catch {
      return 'U'
    }
  }

  return (
    <nav className="navbar navbar-expand-lg bg-light border-bottom app-navbar">
      <div className="container-fluid">
        {/* Left side: brand */}
        <NavLink to="/" className="navbar-brand fw-semibold app-navbar-brand">
          <img src={logo} alt="" className="navbar-brand-logo" aria-hidden="true" />
          <span>EduDesk</span>
        </NavLink>

        {/* Mobile toggle button (Bootstrap collapse) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Right side: page links */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
            </li>

            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink to="/courses" className={navLinkClass}>
                    Courses
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/files" className={navLinkClass}>
                    Files
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/notifications" className={navLinkClass}>
                    Notifications
                  </NavLink>
                </li>

              </>
            )}

            {isAuthenticated && role === 'Admin' && (
              <>
                <li className="nav-item">
                  <NavLink to="/users" className={navLinkClass}>
                    Users
                  </NavLink>
                </li>
              </>
            )}

            {!isAuthenticated ? (
              <li className="nav-item">
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
              </li>
            ) : (
              <li className="nav-item user-menu-wrapper" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-avatar-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Open user menu"
                  aria-expanded={showUserMenu}
                >
                  <span className="user-avatar">
                    {getUserInitial()}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <NavLink
                      to="/change-password"
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Change Password
                    </NavLink>

                    {role === 'Admin' && (
                      <NavLink
                        to="/register"
                        className="user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Create User
                      </NavLink>
                    )}

                    <button
                      type="button"
                      className="user-menu-item user-menu-button"
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowLogoutConfirm(true)
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
      <ConfirmModal
        show={showLogoutConfirm}
        title="Confirm logout"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </nav>
  );
}
