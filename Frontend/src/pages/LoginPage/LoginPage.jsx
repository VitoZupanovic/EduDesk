import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../../services/authService'
import { useAuth } from "../../context/useAuth"
import logo from '../../assets/images/logo.jpeg'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuthData } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setErrorMessage('')
    setIsLoading(true)

    try {
      const token = await loginRequest(email, password)

      setAuthData(token)

      navigate('/')
    } catch (error) {
      setErrorMessage(error.message || 'Login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-icon">
          <img src={logo} alt="EduDesk logo" className="login-icon-image" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="app-form-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="app-form-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <div className="app-message app-message-error">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="app-button-primary login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <h1 className="login-title">Elmer PAAD</h1>
      </section>
    </main>
  )
}
