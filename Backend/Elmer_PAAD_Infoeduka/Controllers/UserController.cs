using System.ComponentModel;
using Elmer_PAAD_Infoeduka.Dtos.Users;
using Elmer_PAAD_Infoeduka.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Elmer_PAAD_Infoeduka.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private enum Role
        {
            Admin = 1,
            Lecturer = 2,
            Student = 3,
        }
        
        private readonly EduDeskDbContext _context;

        public UserController(EduDeskDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Retrieves users.
        /// Endpoint: GET /api/User/
        /// Admin can retrieve all users.
        /// Lecturer can retrieve only the users (students) for the courses they teach.
        /// Endpoint is not allowed for students.
        /// </summary>
        [Authorize(Roles = "Admin, Lecturer")]
        [HttpGet]
        public ActionResult<List<UserDetailsDto>> Get()
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
                
                Role role = (Role)user.RoleId;

                List<User> users = GetAllUsers(user.Id, role);
                
                return Ok(users.Select(x => MapToDetailsDto(x)).ToList());
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        private List<User> GetAllUsers(long userId, Role role)
        {
            switch (role)
            {
                case Role.Admin:
                    return _context.Users.ToList();
                case Role.Lecturer:
                    return _context.Users
                        .Join(_context.StudentCourseItems,
                            u => u.Id,
                            sc => sc.StudentId,
                            (u, sc) => new { User = u, StudentCourse = sc })
                        .Join(_context.Courses,
                            usc => usc.StudentCourse.CourseId,
                            c => c.Id,
                            (usc, c) => new { usc.User, Course = c })
                        .Where(x => x.Course.LecturerId == userId)
                        .Select(x => x.User)
                        .Distinct()
                        .ToList();
                default:
                    throw new InvalidEnumArgumentException("Invalid role");
            }
        }
        
        /// <summary>
        /// Retrieves a user.
        /// Endpoint: GET /api/User/{id}
        /// Admin can retrieve any user.
        /// Lecturer can retrieve only the user (students) for the courses they teach.
        /// Endpoint is not allowed for students.
        /// </summary>
        [Authorize(Roles = "Admin, Lecturer")]
        [HttpGet("{id}")]
        public ActionResult<UserDetailsDto> Get(long id)
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

                User? targetUser = GetUserById(user.Id, id, (Role)user.RoleId);

                if (targetUser is null)
                    return NotFound("User not found.");
                
                return Ok(MapToDetailsDto(targetUser));
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }
        
        private User? GetUserById(long userId, long targetId, Role role)
        {
            switch (role)
            {
                case Role.Admin:
                    return _context.Users
                        .FirstOrDefault(u => u.Id == targetId);
                case Role.Lecturer:
                    return (from u in _context.Users
                            join sc in _context.StudentCourseItems on u.Id equals sc.StudentId
                            join c in _context.Courses on sc.CourseId equals c.Id
                            where c.LecturerId == userId && u.Id == targetId
                            select u)
                        .FirstOrDefault();
                default:
                    throw new InvalidEnumArgumentException("Invalid role");
            }
        }

        /// <summary>
        /// Updates an existing user.
        /// Endpoint: PUT /api/User/{id}
        /// Only Admin is allowed to access this endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public ActionResult<UserDetailsDto> Put([FromRoute] long id, [FromBody] UserUpdateDto userDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                User? existingUser = _context.Users
                    .FirstOrDefault(x => x.Id == id);
                
                if (existingUser is null)
                    return NotFound($"User with id={id} was not found.");
                
                existingUser.FirstName = userDto.FirstName;
                existingUser.LastName = userDto.LastName;
                existingUser.Email = userDto.Email;
                existingUser.RoleId = userDto.RoleId;
                
                _context.SaveChanges();
                
                UserDetailsDto result = MapToDetailsDto(existingUser);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Deletes an existing user and related fields
        /// Endpoint: Delete /api/User/{id}
        /// Only Admin is allowed to access this endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public ActionResult Delete([FromRoute] long id)
        {
            try
            {
                User? user = _context.Users
                    .FirstOrDefault(x => x.Id == id);
                
                if (user is null)
                    return NotFound($"User with id={id} was not found.");

                DeleteRelatedFields(user.Id, (Role)user.RoleId);
                _context.Users.Remove(user);
                
                _context.SaveChanges();
                return Ok($"User with id={id} and all related records were deleted.");
                
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        private void DeleteRelatedFields(long userId, Role role)
        {
            if (role == Role.Admin)
            {
                List<Notification> notifications = _context.Notifications
                    .Where(x => x.CreatorId == userId)
                    .ToList();
                _context.Notifications.RemoveRange(notifications);
            }
            else if (role == Role.Lecturer)
            {
                List<Notification> notifications = _context.Notifications
                    .Where(x => x.CreatorId == userId)
                    .ToList();
                _context.Notifications.RemoveRange(notifications);

                List<Course> courses = _context.Courses
                    .Where(x => x.LecturerId == userId)
                    .ToList();
                
                courses.ForEach(c => c.LecturerId = null);
            }
            else if (role == Role.Student)
            {
                List<StudentCourseItem> studentCourseItems = _context.StudentCourseItems
                    .Where(x => x.StudentId == userId)
                    .ToList();
                _context.StudentCourseItems.RemoveRange(studentCourseItems);
            }
        }

        private UserDetailsDto MapToDetailsDto(User user)
        {
            return new UserDetailsDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RoleId = user.RoleId,
            };
        }
    }    
}
