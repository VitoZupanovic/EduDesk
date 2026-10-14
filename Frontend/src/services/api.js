// Shared API helper for backend integration.
// All service files should use apiRequest instead of writing fetch directly.

// 1. Base API URL
// Read from .env so each teammate can use their own local backend port.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5289'

// 2. Read JWT token from localStorage
// JWT is saved after login and used for secured backend requests.
export function getStoredToken() {
  return localStorage.getItem('JWT')
}

// 3. Create shared request headers
// Bearer token is the JWT format expected by ASP.NET authorization.
export function createAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  }

  const token = getStoredToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}


function getApiErrorMessage(status, data) {
  
  if (status === 401) {
    return 'Your session has expired or you are not logged in. Please log in again.'
  }

  if (status === 403) {
    return 'You do not have permission to do this action.'
  }

  let message = `Something went wrong. Please try again.`

  if (data && data.errors) {
    const firstErrorKey = Object.keys(data.errors)[0]
    message = data.errors[firstErrorKey][0]
  } else if (data && data.message) {
    message = data.message
  } else if (data && data.title) {
    message = data.title
  } else if (typeof data === 'string' && data.length > 0) {
    try {
      const parsedError = JSON.parse(data)

      if (parsedError.errors) {
        const firstErrorKey = Object.keys(parsedError.errors)[0]
        message = parsedError.errors[firstErrorKey][0]
      } else if (parsedError.message) {
        message = parsedError.message
      } else if (parsedError.title) {
        message = parsedError.title
      } else {
        message = data
      }
    } catch {
      message = data
    }
  }

  return message
}

// 4. Send shared API request
// endpoint example: '/api/Course'
// options can include method and body.
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const method = options.method || 'GET'
  const headers = createAuthHeaders()

  const fetchOptions = {
    method: method,
    headers: headers,
  }

  // Convert JS object body to JSON for POST/PUT/PATCH requests.
  if (options.body !== undefined && options.body !== null) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, fetchOptions)

  // 5. Handle API response
  // Read as text first because response may be JSON, text, or empty.
  const text = await response.text()

  let data = null
  if (text.length > 0) {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      data = JSON.parse(text)
    } else {
      data = text
    }
  }

  // Throw error for HTTP status outside 200-299.
  if (!response.ok) {
    // If the backend rejects the JWT, notify AuthContext to log the user out.
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth-expired'))
    }

    const error = new Error(getApiErrorMessage(response.status, data))
    error.status = response.status
    throw error
  }

  return data
}