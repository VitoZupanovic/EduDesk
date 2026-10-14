using Elmer_PAAD_Infoeduka.Dtos.CourseFiles;
using Elmer_PAAD_Infoeduka.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elmer_PAAD_Infoeduka.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CourseFileController : ControllerBase
    {
        private readonly EduDeskDbContext _context;

        private const int AdminRoleId = 1;
        private const int LecturerRoleId = 2;
        private const int StudentRoleId = 3;

        public CourseFileController(EduDeskDbContext context)
        {
            _context = context;
        }

        private User? GetCurrentUser()
        {
            string? email = HttpContext.User.Identity?.Name;

            if (string.IsNullOrWhiteSpace(email))
                return null;

            return _context.Users.FirstOrDefault(x => x.Email == email);
        }

        private static CourseFileDetailsDto MapToDetailsDto(CourseFile file)
        {
            return new CourseFileDetailsDto
            {
                Id = file.Id,
                CourseId = file.CourseId,
                CourseName = file.Course.Name,
                Name = file.Name,
                FileLink = file.FileLink,
                CreatedAt = file.CreatedAt
            };
        }

        private bool CanReadCourse(User user, Course course)
        {
            if (user.RoleId == AdminRoleId)
                return true;

            if (user.RoleId == LecturerRoleId)
                return course.LecturerId == user.Id;

            if (user.RoleId == StudentRoleId)
                return course.StudentCourseItems.Any(x => x.StudentId == user.Id);

            return false;
        }

        private bool CanManageCourse(User user, long courseId)
        {
            if (user.RoleId == AdminRoleId)
                return true;

            if (user.RoleId != LecturerRoleId)
                return false;

            return _context.Courses.Any(x => x.Id == courseId && x.LecturerId == user.Id);
        }

        /// <summary>
        /// Returns course files visible to the logged-in user.
        /// Endpoint: GET /api/CourseFile
        /// Admin can see all files.
        /// Lecturer can see files for courses assigned to them.
        /// Student can see files for courses in which they are enrolled.
        /// </summary>
        [HttpGet]
        public ActionResult<List<CourseFileDetailsDto>> Get()
        {
            try
            {
                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                // StudentCourseItems are needed later so students only see files from their courses
                List<CourseFile> files = _context.CourseFiles
                    .Include(x => x.Course)
                        .ThenInclude(x => x.StudentCourseItems)
                    .ToList();

                List<CourseFileDetailsDto> result = files
                    .Where(x => CanReadCourse(currentUser, x.Course))
                    .Select(x => MapToDetailsDto(x))
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Returns one course file by id if the logged-in user has access to it.
        /// Endpoint: GET /api/CourseFile/{id}
        /// Admin can access any file.
        /// Lecturer can access files for assigned courses.
        /// Student can access files for enrolled courses.
        /// </summary>
        [HttpGet("{id}")]
        public ActionResult<CourseFileDetailsDto> Get(long id)
        {
            try
            {
                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                CourseFile? file = _context.CourseFiles
                    .Include(x => x.Course)
                        .ThenInclude(x => x.StudentCourseItems)
                    .FirstOrDefault(x => x.Id == id);

                if (file == null)
                    return NotFound($"Course file with id={id} was not found.");

                if (!CanReadCourse(currentUser, file.Course))
                    return Forbid();

                return Ok(MapToDetailsDto(file));
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Creates a new course file.
        /// Endpoint: POST /api/CourseFile
        /// Admin can add files to any course.
        /// Lecturer can add files only to courses assigned to them.
        /// </summary>
        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost]
        public ActionResult<CourseFileDetailsDto> Post(CourseFileDto fileDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                if (!CanManageCourse(currentUser, fileDto.CourseId))
                    return Forbid();

                Course? course = _context.Courses.FirstOrDefault(x => x.Id == fileDto.CourseId);

                if (course == null)
                    return NotFound($"Course with id={fileDto.CourseId} was not found.");

                CourseFile file = new CourseFile
                {
                    CourseId = fileDto.CourseId,
                    Name = fileDto.Name,
                    FileLink = fileDto.FileLink,
                    CreatedAt = DateTime.Now
                };

                _context.CourseFiles.Add(file);
                _context.SaveChanges();

                // Loading again with Course because the details DTO returns CourseName
                CourseFile? createdFile = _context.CourseFiles
                    .Include(x => x.Course)
                    .FirstOrDefault(x => x.Id == file.Id);

                if (createdFile == null)
                    return NotFound("Created course file could not be loaded.");

                return Ok(MapToDetailsDto(createdFile));
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Updates an existing course file.
        /// Endpoint: PUT /api/CourseFile/{id}
        /// Admin can update any course file.
        /// Lecturer can update files only for courses assigned to them.
        /// </summary>
        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPut("{id}")]
        public ActionResult<CourseFileDetailsDto> Put(long id, CourseFileDto fileDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                CourseFile? existingFile = _context.CourseFiles
                    .FirstOrDefault(x => x.Id == id);

                if (existingFile == null)
                    return NotFound($"Course file with id={id} was not found.");

                // Check both courses so a lecturer cannot move a file between courses they do not own
                if (!CanManageCourse(currentUser, existingFile.CourseId) ||
                    !CanManageCourse(currentUser, fileDto.CourseId))
                    return Forbid();

                existingFile.CourseId = fileDto.CourseId;
                existingFile.Name = fileDto.Name;
                existingFile.FileLink = fileDto.FileLink;

                _context.SaveChanges();

                // Loading again with Course because CourseId could have changed
                CourseFile? updatedFile = _context.CourseFiles
                    .Include(x => x.Course)
                    .FirstOrDefault(x => x.Id == id);

                if (updatedFile == null)
                    return NotFound("Updated course file could not be loaded.");

                return Ok(MapToDetailsDto(updatedFile));
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Deletes a course file by id.
        /// Endpoint: DELETE /api/CourseFile/{id}
        /// Admin can delete any course file.
        /// Lecturer can delete files only for courses assigned to them.
        /// </summary>
        [Authorize(Roles = "Admin,Lecturer")]
        [HttpDelete("{id}")]
        public ActionResult Delete(long id)
        {
            try
            {
                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                CourseFile? file = _context.CourseFiles.FirstOrDefault(x => x.Id == id);

                if (file == null)
                    return NotFound($"Course file with id={id} was not found.");

                if (!CanManageCourse(currentUser, file.CourseId))
                    return Forbid();

                _context.CourseFiles.Remove(file);
                _context.SaveChanges();

                return Ok($"Course file with id={id} was deleted.");
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }
    }
}
