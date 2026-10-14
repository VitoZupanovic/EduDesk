using Elmer_PAAD_Infoeduka.Dtos;
using Elmer_PAAD_Infoeduka.Dtos.Courses;
using Elmer_PAAD_Infoeduka.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elmer_PAAD_Infoeduka.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CourseController : ControllerBase
    {
        // Database context, injected by DI
        private readonly EduDeskDbContext _context;

        private const int AdminRoleId = 1;
        private const int LecturerRoleId = 2;
        private const int StudentRoleId = 3;

        public CourseController(EduDeskDbContext context)
        {
            _context = context;
        }

        private static CourseDetailsDto MapToDetailsDto(Course course)
        {
            return new CourseDetailsDto
            {
                Id = course.Id,
                LecturerId = course.LecturerId,
                LecturerFullName = course.LecturerId != null
                    ? course.Lecturer.FirstName + " " + course.Lecturer.LastName
                    : "Unknown",
                LecturerEmail = course.Lecturer?.Email ?? "Unknown",
                Name = course.Name,
                ShortDescription = course.ShortDescription,
                Details = course.Details,
                EctsScore = course.EctsScore
            };
        }

        private static bool CanAccessCourse(User currentUser, Course course)
        {
            if (currentUser.RoleId == AdminRoleId)
                return true;

            if (currentUser.RoleId == LecturerRoleId)
                return course.LecturerId == currentUser.Id;

            if (currentUser.RoleId == StudentRoleId)
                return course.StudentCourseItems.Any(x => x.StudentId == currentUser.Id);

            return false;
        }

        /// <summary>
        /// Returns courses visible to the logged-in user.
        /// Endpoint: GET /api/Course
        /// Admin can see all courses.
        /// Lecturer can see courses assigned to them.
        /// Student can see courses in which they are enrolled.
        /// </summary>
        [HttpGet]
        public ActionResult<ICollection<CourseDetailsDto>> Get()
        {
            try
            {
                // 1. get logged-in user email from JWT
                string? email = HttpContext.User.Identity?.Name;

                // 2. if identity is missing, return Unauthorized
                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized("User identity is missing.");

                // 3. find logged-in user
                User? currentUser = _context.Users
                    .FirstOrDefault(x => x.Email == email);

                // 4. if user not found, return NotFound
                if (currentUser == null)
                    return NotFound("User not found.");

                // 5. create base query with related lecturer data
                IQueryable<Course> query = _context.Courses
                    .Include(x => x.Lecturer)
                    .Include(x => x.StudentCourseItems);

                // 6. if role is Lecturer, filter courses by LecturerId
                if (currentUser.RoleId == LecturerRoleId)
                {
                    query = query.Where(x => x.LecturerId == currentUser.Id);
                }

                // 7. if role is Student, filter courses by StudentCourseItems
                else if (currentUser.RoleId == StudentRoleId)
                {
                    query = query.Where(x =>
                        x.StudentCourseItems.Any(sci => sci.StudentId == currentUser.Id));
                }

                // 8. if role is not Admin, Lecturer, or Student, return Forbid
                else if (currentUser.RoleId != AdminRoleId)
                {
                    return Forbid();
                }

                // 9. load courses from database
                List<Course> courses = query.ToList();

                // 10. map entities to DTOs
                List<CourseDetailsDto> result = courses
                    .Select(x => MapToDetailsDto(x))
                    .ToList();

                // 11. return DTO list
                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Returns one course by id if the logged-in user has access to it.
        /// Endpoint: GET /api/Course/{id}
        /// Admin can access any course.
        /// Lecturer can access only assigned courses.
        /// Student can access only enrolled courses.
        /// </summary>
        [HttpGet("{id}")]
        public ActionResult<CourseDetailsDto> Get(long id)
        {
            try
            {
                // 1. get logged-in user email from JWT
                string? email = HttpContext.User.Identity?.Name;

                // 2. if identity is missing, return Unauthorized
                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized("User identity is missing.");

                // 3. find logged-in user
                User? currentUser = _context.Users
                    .FirstOrDefault(x => x.Email == email);

                // 4. if user not found, return NotFound
                if (currentUser == null)
                    return NotFound("User not found.");

                // 5. find course by id with lecturer and student-course relation data
                Course? course = _context.Courses
                    .Include(x => x.Lecturer)
                    .Include(x => x.StudentCourseItems)
                    .FirstOrDefault(x => x.Id == id);

                // 6. if course not found, return NotFound
                if (course == null)
                    return NotFound($"Course with id={id} was not found.");

                // 7. check whether current user is allowed to access this course
                bool canAccess = CanAccessCourse(currentUser, course);

                // 8. if access is not allowed, return Forbid
                if (!canAccess)
                    return Forbid();

                // 9. map entity to DTO
                CourseDetailsDto result = MapToDetailsDto(course);

                // 10. return DTO
                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Creates a new course.
        /// Endpoint: POST /api/Course
        /// Only Admin is allowed to access this endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public ActionResult<CourseDetailsDto> Post(CourseDto courseDto)
        {
            try
            {
                // 1. validate model state
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // 2. validate lecturer if provided
                if (courseDto.LecturerId != null)
                {
                    User? lecturer = _context.Users
                        .FirstOrDefault(x => x.Id == courseDto.LecturerId);

                    if (lecturer == null)
                        return NotFound($"Lecturer with id={courseDto.LecturerId} was not found.");

                    if (lecturer.RoleId != LecturerRoleId)
                        return BadRequest("Selected user is not a lecturer.");
                }

                // 3. create new Course entity
                Course newCourse = new Course
                {
                    LecturerId = courseDto.LecturerId,
                    Name = courseDto.Name,
                    ShortDescription = courseDto.ShortDescription,
                    Details = courseDto.Details,
                    EctsScore = courseDto.EctsScore
                };

                // 4. save course to database
                _context.Courses.Add(newCourse);
                _context.SaveChanges();

                // 5. reload created course with lecturer data if needed
                Course? createdCourse = _context.Courses
                    .Include(x => x.Lecturer)
                    .FirstOrDefault(x => x.Id == newCourse.Id);

                if (createdCourse == null)
                    return NotFound("Created course could not be loaded.");

                // 6. map entity to DTO
                CourseDetailsDto result = MapToDetailsDto(createdCourse);

                // 7. return created DTO
                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Updates an existing course.
        /// Endpoint: PUT /api/Course/{id}
        /// Only Admin is allowed to access this endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public ActionResult<CourseDetailsDto> Put(long id, CourseDto courseDto)
        {
            try
            {
                // 1. validate model state
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // 2. find existing course by id
                Course? existingCourse = _context.Courses
                    .FirstOrDefault(x => x.Id == id);

                // 3. if course not found, return NotFound
                if (existingCourse == null)
                    return NotFound($"Course with id={id} was not found.");

                // 4. validate lecturer if provided
                if (courseDto.LecturerId != null)
                {
                    User? lecturer = _context.Users
                        .FirstOrDefault(x => x.Id == courseDto.LecturerId);

                    if (lecturer == null)
                        return NotFound($"Lecturer with id={courseDto.LecturerId} was not found.");

                    if (lecturer.RoleId != LecturerRoleId)
                        return BadRequest("Selected user is not a lecturer.");
                }

                // 5. update editable course fields
                existingCourse.LecturerId = courseDto.LecturerId;
                existingCourse.Name = courseDto.Name;
                existingCourse.ShortDescription = courseDto.ShortDescription;
                existingCourse.Details = courseDto.Details;
                existingCourse.EctsScore = courseDto.EctsScore;

                // 6. save changes
                _context.SaveChanges();

                // 7. reload updated course with lecturer data
                Course? updatedCourse = _context.Courses
                    .Include(x => x.Lecturer)
                    .FirstOrDefault(x => x.Id == existingCourse.Id);

                if (updatedCourse == null)
                    return NotFound("Updated course could not be loaded.");

                // 8. map entity to DTO
                CourseDetailsDto result = MapToDetailsDto(updatedCourse);

                // 9. return updated DTO
                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Deletes a course by id.
        /// Endpoint: DELETE /api/Course/{id}
        /// Only Admin is allowed to access this endpoint.
        /// Deletes related student-course assignments, notifications, and course files.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public ActionResult Delete(long id)
        {
            using var transaction = _context.Database.BeginTransaction();

            try
            {
                // 1. find existing course by id
                Course? existingCourse = _context.Courses
                    .FirstOrDefault(x => x.Id == id);

                // 2. if course not found, return NotFound
                if (existingCourse == null)
                    return NotFound($"Course with id={id} was not found.");

                // 3. load related student-course assignments
                List<StudentCourseItem> studentCourseItems = _context.StudentCourseItems
                    .Where(x => x.CourseId == id)
                    .ToList();

                // 4. load related notifications
                List<Notification> notifications = _context.Notifications
                    .Where(x => x.CourseId == id)
                    .ToList();

                // 5. load related course files
                List<CourseFile> courseFiles = _context.CourseFiles
                    .Where(x => x.CourseId == id)
                    .ToList();

                // 6. remove related records first
                _context.StudentCourseItems.RemoveRange(studentCourseItems);
                _context.Notifications.RemoveRange(notifications);
                _context.CourseFiles.RemoveRange(courseFiles);

                // 7. remove course from database
                _context.Courses.Remove(existingCourse);

                // 8. save changes
                _context.SaveChanges();

                // 9. commit transaction
                transaction.Commit();

                // 10. return success response
                return Ok($"Course with id={id} and all related records were deleted.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Changes the lecturer assigned to a course.
        /// Endpoint: PATCH /api/Course/{id}/Lecturer
        /// Only Admin is allowed to access this endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/Lecturer")]
        public ActionResult<CourseDetailsDto> PatchLecturer(long id, CourseLecturerDto courseLecturerDto)
        {
            try
            {
                // 1. validate model state
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // 2. find existing course by id
                Course? existingCourse = _context.Courses
                    .FirstOrDefault(x => x.Id == id);

                // 3. if course not found, return NotFound
                if (existingCourse == null)
                    return NotFound($"Course with id={id} was not found.");

                // 4. validate lecturer if provided
                if (courseLecturerDto.LecturerId != null)
                {
                    User? lecturer = _context.Users
                        .FirstOrDefault(x => x.Id == courseLecturerDto.LecturerId);

                    if (lecturer == null)
                        return NotFound($"Lecturer with id={courseLecturerDto.LecturerId} was not found.");

                    if (lecturer.RoleId != LecturerRoleId)
                        return BadRequest("Selected user is not a lecturer.");
                }

                // 5. update course LecturerId
                existingCourse.LecturerId = courseLecturerDto.LecturerId;

                // 6. save changes
                _context.SaveChanges();

                // 7. reload updated course with lecturer data
                Course? updatedCourse = _context.Courses
                    .Include(x => x.Lecturer)
                    .FirstOrDefault(x => x.Id == existingCourse.Id);

                if (updatedCourse == null)
                    return NotFound("Updated course could not be loaded.");

                // 8. map entity to DTO
                CourseDetailsDto result = MapToDetailsDto(updatedCourse);

                // 9. return updated DTO
                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }


        /// <summary>
        /// Returns courses assigned to the currently logged-in lecturer or enrolled student.
        /// Endpoint: GET /api/Course/MyCourses
        /// Available to authenticated users.
        /// </summary>
        [HttpGet("[action]")]
        public ActionResult<ICollection<CourseDetailsDto>> MyCourses()
        {
            try
            {
                // 1. get logged-in user email from JWT
                string? email = HttpContext.User.Identity?.Name;

                // 2. if identity is missing, return Unauthorized
                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized("User identity is missing.");

                // 3. find logged-in user
                User? currentUser = _context.Users
                    .FirstOrDefault(x => x.Email == email);

                // 4. if user not found, return NotFound
                if (currentUser == null)
                    return NotFound("User not found.");

                // 5. create base query with lecturer data
                IQueryable<Course> query = _context.Courses
                    .Include(x => x.Lecturer)
                    .Include(x => x.StudentCourseItems);

                // 6. if user is Lecturer, filter by LecturerId
                if (currentUser.RoleId == LecturerRoleId)
                {
                    query = query.Where(x => x.LecturerId == currentUser.Id);
                }

                // 7. if user is Student, filter by StudentCourseItems
                else if (currentUser.RoleId == StudentRoleId)
                {
                    query = query.Where(x =>
                        x.StudentCourseItems.Any(sci => sci.StudentId == currentUser.Id));
                }

                // 8. if user is not Admin, Lecturer, or Student, return Forbid
                else if (currentUser.RoleId != AdminRoleId)
                {
                    return Forbid();
                }

                // 9. load courses from database
                List<Course> courses = query.ToList();

                // 10. map entities to DTOs
                List<CourseDetailsDto> result = courses
                    .Select(x => MapToDetailsDto(x))
                    .ToList();

                // 11. return DTO list
                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }
    }
}