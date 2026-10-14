// Auth service: calls the backend auth endpoints and reads info from the JWT.
// Token storage (localStorage) lives in AuthContext; this file does not touch it.

import { apiRequest, getStoredToken } from './api'

// 1. Login
// Calls POST /api/Auth/Login and returns the JWT string.
// LoginPage is responsible for passing the returned token to AuthContext.setAuthData(token).
export async function login(email, password) {
  return await apiRequest('/api/Auth/Login', {
    method: 'POST',
    body: { email, password },
  })
}

// 2. Change password
// Calls POST /api/Auth/ChangePassword for the currently logged-in user.
export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
  return await apiRequest('/api/Auth/ChangePassword', {
    method: 'POST',
    body: {
      currentPassword,
      newPassword,
      confirmNewPassword,
    },
  })
}

// 3. Admin creates a user
// Calls POST /api/Auth/CreateUser. Backend allows this only for Admin.
export async function createUser(userData) {
  return await apiRequest('/api/Auth/CreateUser', {
    method: 'POST',
    body: userData,
  })
}

// 4. Decode JWT token payload
// Reads the JWT directly from localStorage to keep this helper stateless.
// AuthContext is still the only owner of token writes/clears.
export function getUserFromToken() {
  const token = getStoredToken();

  if (!token) {
    return null
  }

  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))

    return decodedPayload
  } catch {
    return null
  }
}

// 5. Get role from JWT token
export function getUserRole() {
  const user = getUserFromToken()

  if (!user) {
    return null
  }

  return user.role || null
}

// 6. Get email/name from JWT token
export function getUserEmail() {
  const user = getUserFromToken()

  if (!user) {
    return null
  }

  return user.unique_name || user.sub || null
}
