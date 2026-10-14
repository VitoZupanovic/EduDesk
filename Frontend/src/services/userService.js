// User service placeholders.
// Backend: UserController at /api/User. JWT required.
// Note: there is NO POST /api/User. Use authService.createUser() (POST /api/Auth/CreateUser, Admin).

import { apiRequest } from "./api"

const BASE = '/api/User'

export async function getUsers() {
  return apiRequest(BASE, { 
    method: 'GET'
  })
}

export async function getUserById(id) {
  return apiRequest(`${BASE}/${id}`, {
     method: 'GET'
  })
}

export async function updateUser(id, data) {
  return apiRequest(`${BASE}/${id}`, {
    method: 'PUT',
    body: data
  })
}

export async function deleteUser(id) {
  return apiRequest(`${BASE}/${id}`, {
    method: 'DELETE'
  })
}
