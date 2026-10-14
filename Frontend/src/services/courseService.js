import { apiRequest } from './api'

// Course service functions for the EduDesk backend.
// api.js attaches the JWT automatically when the user is logged in.
// Security note:
// Role permissions are enforced by the backend, not by this service file.
// The frontend may later hide/show buttons based on role,
// but the backend is the final authority.
// - Admin can manage all courses.
// - Lecturer sees and works with assigned courses.
// - Student sees only enrolled courses.

// 1. Retrieve courses
export async function getCourses() {
  return apiRequest('/api/Course', { method: 'GET' })
}

export async function getCourseById(id) {
  return apiRequest(`/api/Course/${id}`, { method: 'GET' })
}

export async function getMyCourses() {
  return apiRequest('/api/Course/MyCourses', { method: 'GET' })
}

// 2. Create course
export async function createCourse(courseData) {
  // courseData matches CourseDto:
  // { lecturerId, name, shortDescription, details, ectsScore }
  // Note: lecturerId is nullable on the backend (a course can be unassigned).
  return apiRequest('/api/Course', {
    method: 'POST',
    body: courseData,
  })
}

// 3. Update course
export async function updateCourse(id, courseData) {
  // courseData matches CourseDto:
  // { lecturerId, name, shortDescription, details, ectsScore }
  // Note: lecturerId is nullable on the backend.
  return apiRequest(`/api/Course/${id}`, {
    method: 'PUT',
    body: courseData,
  })
}

export async function updateCourseLecturer(id, lecturerId) {
  // Body matches CourseLecturerDto: { lecturerId }.
  // lecturerId may be null to unassign the lecturer.
  return apiRequest(`/api/Course/${id}/Lecturer`, {
    method: 'PATCH',
    body: { lecturerId: lecturerId },
  })
}

// 4. Delete course
export async function deleteCourse(id) {
  return apiRequest(`/api/Course/${id}`, { method: 'DELETE' })
}
