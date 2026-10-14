import { useEffect, useState } from 'react'
import { getUserFromToken, getUserRole, getUserEmail } from '../services/authService'
import { AuthContext } from './AuthContextObject'

// Auth context: owns login state and the JWT in localStorage.
// LoginPage calls setAuthData(token) after authService.login() succeeds.
// Components read auth data through useAuth().

export function AuthProvider({ children }) {
  // `children` is whatever JSX is placed inside <AuthProvider>...</AuthProvider>.

  // 2. Initialize auth state
  // useState lets a component remember a value between re-renders.
  // We read the JWT from localStorage so the user stays logged in after refresh.
  const [token, setToken] = useState(localStorage.getItem('JWT'))

  // Decode user data from JWT if token already exists in localStorage
  const [user, setUser] = useState(getUserFromToken())
  const [role, setRole] = useState(getUserRole())
  const [email, setEmail] = useState(getUserEmail())

  // 3. Save auth data after login
  function setAuthData(newToken, userData = null) {
    localStorage.setItem('JWT', newToken)
    setToken(newToken)

    // If userData is passed manually, use it.
    // Otherwise decode user data from the JWT.
    setUser(userData || getUserFromToken())
    setRole(getUserRole())
    setEmail(getUserEmail())
  }


  // 4. Clear auth data on logout
  function logout() {
    localStorage.removeItem('JWT')
    setToken(null)
    setUser(null)
    setRole(null)
    setEmail(null)
  }

  // 5. Handle auth expired event
  useEffect(() => {
    function handleAuthExpired() {
      logout()
    }
  
    window.addEventListener('auth-expired', handleAuthExpired)
  
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired)
    }
  }, [])
  // 6. Expose auth context values
  const isAuthenticated = token !== null && token !== ''

  // Value provided by the AuthContext: makes auth state and actions available to consumers.
  const value = {
    token,
    user,
    role,
    email,
    isAuthenticated,
    setAuthData,
    logout,
  }
    
  // <AuthContext.Provider> a special component that makes `value` available 
  // to all components rendered inside it (that is what {children} is for).
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

