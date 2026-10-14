import { Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage/HomePage.jsx'
import LoginPage from '../pages/LoginPage/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage/RegisterPage.jsx'
import CoursesPage from '../pages/CoursesPage/CoursesPage.jsx'
import CourseDetailsPage from '../pages/CourseDetailsPage/CourseDetailsPage.jsx'
import CourseFilesPage from '../pages/CourseFilesPage/CourseFilesPage.jsx'
import NotificationsPage from '../pages/NotificationsPage/NotificationsPage.jsx'
import UsersPage from '../pages/UsersPage/UsersPage.jsx'
import ChangePasswordPage from '../pages/ChangePasswordPage/ChangePasswordPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

export default function AppRoutes() {
  // All app route definitions.
  // Routes wrapped in <ProtectedRoute> require login and (optionally) a specific role,
  // both read from AuthContext via useAuth().
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/register"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <RegisterPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Lecturer', 'Student']}>
            <CoursesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Lecturer', 'Student']}>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Lecturer', 'Student']}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/files"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Lecturer', 'Student']}>
            <CourseFilesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:courseId/files"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Lecturer', 'Student']}>
            <CourseFilesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Lecturer', 'Student']}>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
