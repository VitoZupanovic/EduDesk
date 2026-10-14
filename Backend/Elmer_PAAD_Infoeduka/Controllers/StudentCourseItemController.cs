using Elmer_PAAD_Infoeduka.Dtos.StudentCourseItem;
using Elmer_PAAD_Infoeduka.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elmer_PAAD_Infoeduka.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentCourseItemController : ControllerBase
    {
        private enum Role
        {
            Admin = 1,
            Lecturer = 2,
            Student = 3,
        }
        
        private readonly EduDeskDbContext _context;

        public StudentCourseItemController(EduDeskDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Fetches all student-course items.
        /// Endpoint: GET /api/StudentCourseItem
        /// Admin will receive all student-course items.
        /// Lecturer will receive only student-course items which are associated with the courses they teach.
        /// Student will receive only student-course items which are associated with them.
        /// </summary>
        [HttpGet]
        public ActionResult<List<StudentCourseItemDetailsDto>> Get()
        {
            try
            {
                string? email = HttpContext.User.Identity?.Name;
                
                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized("User identity is missing.");
                
                User? user = _context.Users
                    .FirstOrDefault(x => x.Email == email);
                
                if (user is null)
                    return NotFound("User not found.");

                var items = GetAllItems((Role)user.RoleId, user.Id);
                var itemsDetails = items.Select(x => MapToDetailsDto(x)).ToList();
                
                return Ok(itemsDetails);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Fetches a given student-course item.
        /// Endpoint: GET /api/StudentCourseItem/{id}/
        /// Admin may receive all student-course items.
        /// Lecturer may receive only student-course items which are associated with the courses they teach
        /// Student may receive only student-course items which are associated with them
        /// </summary>
        [HttpGet("{id}")]
        public ActionResult<StudentCourseItemDetailsDto> Get(long id)
        {
            try
            {
                string? email = HttpContext.User.Identity?.Name;
                
                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized("User identity is missing.");
                
                User? user = _context.Users
                    .FirstOrDefault(x => x.Email == email);
                
                if (user is null)
                    return NotFound("User not found.");
                
                Role userRole = (Role)user.RoleId;

                
                StudentCourseItem? item = _context.StudentCourseItems
                    .Include(x => x.Student)   
                    .Include(x => x.Course)    
                    .FirstOrDefault(x => x.Id == id);


                if (item is null)
                    return NotFound("Item not found.");
                
                if (userRole == Role.Student && item.StudentId != user.Id ||
                    userRole == Role.Lecturer && !IsTeaching(user.Id, item.CourseId))
                    return Forbid();
                
                return Ok(MapToDetailsDto(item));
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return ApiError.FromException(this, ex);
            }
        }

        // Determines if the lecturer teaches a given course
        // Assumes that the user identification represents a lecturer
        private bool IsTeaching(long userId, long courseId)
        {
            Course? course = _context.Courses.FirstOrDefault(x => x.Id == courseId);
            return course?.LecturerId == userId;
        }

        private List<StudentCourseItem> GetAllItems(Role role, long id)
        {
            switch (role)
            {
                case Role.Admin:
                    return _context.StudentCourseItems
                        .Include(x => x.Student)
                        .Include(x => x.Course)
                        .ToList();
                case Role.Lecturer:
                    return _context.StudentCourseItems
                        .Include(x => x.Student)
                        .Include(x => x.Course)
                        .Where(x => x.Course.LecturerId == id)
                        .ToList();
                case Role.Student:
                    return _context.StudentCourseItems
                        .Include(x => x.Student)
                        .Include(x => x.Course)
                        .Where(x => x.StudentId == id)
                        .ToList();
                default:
                    throw new Exception("Invalid role");
            }
        }
        
        /// <summary>
        /// Creates a new student-course item.
        /// Endpoint: POST /api/StudentCourseItem/
        /// Only Admin is allowed to access this endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public ActionResult<StudentCourseItemDetailsDto> Post([FromBody] StudentCourseItemDto item)
        {
            try
            {
                if(!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                User? student = _context.Users.FirstOrDefault(s => s.Id == item.StudentId);
                Course? course = _context.Courses.FirstOrDefault(c => c.Id == item.CourseId);
                
                if (student is null || student.RoleId != (int)Role.Student || course is null)
                    return BadRequest();

                bool alreadyEnrolled = _context.StudentCourseItems
                    .Any(sci => sci.StudentId == item.StudentId && sci.CourseId == item.CourseId);

                if (alreadyEnrolled)
                    return Conflict("Student is already enrolled in this course.");
                
                StudentCourseItem newStudent = new StudentCourseItem
                {
                    StudentId = item.StudentId,
                    CourseId = item.CourseId,
                };

                _context.StudentCourseItems.Add(newStudent);
                _context.SaveChanges();

                StudentCourseItemDetailsDto details = MapToDetailsDto(newStudent);
                return Ok(details);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }
        
        /// <summary>
        /// Deletes a student-course item.
        /// Endpoint: DELETE /api/StudentCourseItem/{id}
        /// Only Admin is allowed to access this endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public ActionResult Delete(long id)
        {
            try
            {
                var affected = _context.StudentCourseItems
                    .Where(i => i.Id == id)
                    .ExecuteDelete();

                if (affected == 0)
                    return NotFound();  
                
                return Ok($"Student-course item with id={id} was deleted.");
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }
        
        private StudentCourseItemDetailsDto MapToDetailsDto(StudentCourseItem? item)
        {
            return new StudentCourseItemDetailsDto
            {
                Id = item.Id,
                StudentId = item.StudentId,
                StudentFullName = $"{item.Student.FirstName} {item.Student.LastName}",
                StudentEmail = item.Student.Email,
                CourseId = item.CourseId,
                CourseName = item.Course.Name
            };
        }

    }    
}
