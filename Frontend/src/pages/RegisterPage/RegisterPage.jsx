import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser } from '../../services/authService'
import './RegisterPage.css'

export default function RegisterPage() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: 3,
  })

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: name === 'roleId' ? Number(value) : value,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setErrorMessage('')
    setIsLoading(true)

    try {

      if (formData.password.length < 8) {
        setErrorMessage('Password should be at least 8 characters long.')
        setIsLoading(false)
        return
      }
      await createUser(formData)

      setMessage('User created successfully.')

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: 3,
      })
    } catch (error) {
      setErrorMessage(error.message || 'User creation failed.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleCancel() {
    navigate('/users')
  }

  return (
    <main className="page-container register-page">
      <section className="register-form-card app-card">
        <div className="register-form-header">
          <h1 className="register-form-title">Create User</h1>

          <button
            type="button"
            className="register-form-close"
            onClick={handleCancel}
            aria-label="Close create user form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="app-form-control"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="app-form-control"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="app-form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="app-form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="roleId" className="form-label">
              Role
            </label>
            <select
              id="roleId"
              name="roleId"
              className="app-form-control"
              value={formData.roleId}
              onChange={handleChange}
              required
            >
              <option value={1}>Admin</option>
              <option value={2}>Lecturer</option>
              <option value={3}>Student</option>
            </select>
          </div>

          {message && (
            <div className="app-message app-message-loading">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="app-message app-message-error">
              {errorMessage}
            </div>
          )}

          <div className="register-form-actions">
            <button
              type="button"
              className="app-button-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="app-button-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}