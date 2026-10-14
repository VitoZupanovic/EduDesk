// Student-course item service placeholders.
// Backend: StudentCourseItemController at /api/StudentCourseItem. JWT required.
// Note: there is NO PUT/update endpoint.

import { apiRequest } from "./api"

const BASE = '/api/StudentCourseItem'

export async function getStudentCourseItems() {
  return apiRequest(BASE, { 
    method: 'GET'
  })
}

export async function getStudentCourseItemById(id) {
  return apiRequest(`${BASE}/${id}`, {
     method: 'GET'
  })
}

export async function createStudentCourseItem(data) {
  return apiRequest(BASE, {
    method: 'POST',
    body: data
  })
}

export async function deleteStudentCourseItem(id) {
  return apiRequest(`${BASE}/${id}`, {
    method: 'DELETE'
  })
}