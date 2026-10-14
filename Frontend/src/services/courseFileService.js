import { apiRequest } from './api'

export async function getCourseFiles() {
  return apiRequest('/api/CourseFile', { method: 'GET' })
}

export async function getCourseFileById(id) {
  return apiRequest(`/api/CourseFile/${id}`, { method: 'GET' })
}

export async function createCourseFile(courseFileData) {
  return apiRequest('/api/CourseFile', {
    method: 'POST',
    body: courseFileData,
  })
}

export async function updateCourseFile(id, courseFileData) {
  return apiRequest(`/api/CourseFile/${id}`, {
    method: 'PUT',
    body: courseFileData,
  })
}

export async function deleteCourseFile(id) {
  return apiRequest(`/api/CourseFile/${id}`, { method: 'DELETE' })
}
