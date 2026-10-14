using Elmer_PAAD_Infoeduka.Dtos.Notifications;
using Elmer_PAAD_Infoeduka.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elmer_PAAD_Infoeduka.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly EduDeskDbContext _context;

        private const int AdminRoleId = 1;
        private const int LecturerRoleId = 2;
        private const int StudentRoleId = 3;

        public NotificationController(EduDeskDbContext context)
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

        private static NotificationDetailsDto MapToDetailsDto(Notification notification)
        {
            return new NotificationDetailsDto
            {
                Id = notification.Id,
                CreatorId = notification.CreatorId,
                CreatorFullName = notification.Creator.FirstName + " " + notification.Creator.LastName,
                CreatorEmail = notification.Creator.Email,
                CourseId = notification.CourseId,
                CourseName = notification.Course == null ? null : notification.Course.Name,
                Title = notification.Title,
                Text = notification.Text,
                PublishDate = notification.PublishDate,
                ExpirationDate = notification.ExpirationDate
            };
        }

        private bool CanReadNotification(User user, Notification notification)
        {
            if (user.RoleId == AdminRoleId)
                return true;

            if (user.RoleId == LecturerRoleId)
            {
                if (notification.CourseId == null)
                    return true;

                return notification.Course != null && notification.Course.LecturerId == user.Id;
            }

            if (user.RoleId == StudentRoleId)
            {
                // Global notifications will be visible to every logged in student
                if (notification.CourseId == null)
                    return true;

                return _context.StudentCourseItems.Any(x =>
                    x.StudentId == user.Id && x.CourseId == notification.CourseId);
            }

            return false;
        }

        private bool CanManageCourseNotification(User user, long? courseId)
        {
            if (user.RoleId == AdminRoleId)
                return true;

            if (user.RoleId != LecturerRoleId || courseId == null)
                return false;

            return _context.Courses.Any(x => x.Id == courseId && x.LecturerId == user.Id);
        }

        /// <summary>
        /// Returns notifications visible to the logged-in user.
        /// Endpoint: GET /api/Notification
        /// Admin can see all notifications.
        /// Lecturer can see notifications for courses assigned to them.
        /// Student can see global notifications and notifications for enrolled courses.
        /// </summary>
        [HttpGet]
        public ActionResult<List<NotificationDetailsDto>> Get()
        {
            try
            {
                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                // Load Course and Creator here because the DTO shows readable names, not only ids
                List<Notification> notifications = _context.Notifications
                    .Include(x => x.Creator)
                    .Include(x => x.Course)
                    .ToList();

                List<NotificationDetailsDto> result = notifications
                    .Where(x => CanReadNotification(currentUser, x))
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
        /// Returns one notification by id if the logged-in user has access to it.
        /// Endpoint: GET /api/Notification/{id}
        /// Admin can access any notification.
        /// Lecturer can access notifications for assigned courses.
        /// Student can access global notifications and notifications for enrolled courses.
        /// </summary>
        [HttpGet("{id}")]
        public ActionResult<NotificationDetailsDto> Get(long id)
        {
            try
            {
                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                Notification? notification = _context.Notifications
                    .Include(x => x.Creator)
                    .Include(x => x.Course)
                    .FirstOrDefault(x => x.Id == id);

                if (notification == null)
                    return NotFound($"Notification with id={id} was not found.");

                if (!CanReadNotification(currentUser, notification))
                    return Forbid();

                return Ok(MapToDetailsDto(notification));
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Creates a new notification.
        /// Endpoint: POST /api/Notification
        /// Admin can create notifications for any course.
        /// Lecturer can create notifications only for courses assigned to them.
        /// </summary>
        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPost]
        public ActionResult<NotificationDetailsDto> Post(NotificationDto notificationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                if (!CanManageCourseNotification(currentUser, notificationDto.CourseId))
                    return Forbid();

                Course? course = null;

                if (notificationDto.CourseId != null)
                {
                    course = _context.Courses.FirstOrDefault(x => x.Id == notificationDto.CourseId);

                    if (course == null)
                        return NotFound($"Course with id={notificationDto.CourseId} was not found.");
                }

                Notification notification = new Notification
                {
                    CreatorId = currentUser.Id,
                    CourseId = notificationDto.CourseId,
                    Title = notificationDto.Title,
                    Text = notificationDto.Text,
                    PublishDate = DateTime.Now,
                    ExpirationDate = notificationDto.ExpirationDate
                };

                _context.Notifications.Add(notification);
                _context.SaveChanges();

                // Loading again because Creator and Course are needed for the details response
                Notification? createdNotification = _context.Notifications
                    .Include(x => x.Creator)
                    .Include(x => x.Course)
                    .FirstOrDefault(x => x.Id == notification.Id);

                if (createdNotification == null)
                    return NotFound("Created notification could not be loaded.");

                return Ok(MapToDetailsDto(createdNotification));
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Updates an existing notification.
        /// Endpoint: PUT /api/Notification/{id}
        /// Admin can update any notification.
        /// Lecturer can update notifications only for courses assigned to them.
        /// </summary>
        [Authorize(Roles = "Admin,Lecturer")]
        [HttpPut("{id}")]
        public ActionResult<NotificationDetailsDto> Put(long id, NotificationDto notificationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                User? currentUser = GetCurrentUser();

                if (currentUser == null)
                    return Unauthorized("User identity is missing.");

                Notification? existingNotification = _context.Notifications
                    .Include(x => x.Course)
                    .FirstOrDefault(x => x.Id == id);

                if (existingNotification == null)
                    return NotFound($"Notification with id={id} was not found.");

                // Check old and new course so lecturers cannot move other notifications to their course
                if (!CanManageCourseNotification(currentUser, existingNotification.CourseId) ||
                    !CanManageCourseNotification(currentUser, notificationDto.CourseId))
                    return Forbid();

                existingNotification.CourseId = notificationDto.CourseId;
                existingNotification.Title = notificationDto.Title;
                existingNotification.Text = notificationDto.Text;
                existingNotification.ExpirationDate = notificationDto.ExpirationDate;

                _context.SaveChanges();

                // Loading again because the response should contain creator and course names
                Notification? updatedNotification = _context.Notifications
                    .Include(x => x.Creator)
                    .Include(x => x.Course)
                    .FirstOrDefault(x => x.Id == id);

                if (updatedNotification == null)
                    return NotFound("Updated notification could not be loaded.");

                return Ok(MapToDetailsDto(updatedNotification));
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        /// <summary>
        /// Deletes a notification by id.
        /// Endpoint: DELETE /api/Notification/{id}
        /// Admin can delete any notification.
        /// Lecturer can delete notifications only for courses assigned to them.
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

                Notification? notification = _context.Notifications
                    .FirstOrDefault(x => x.Id == id);

                if (notification == null)
                    return NotFound($"Notification with id={id} was not found.");

                if (!CanManageCourseNotification(currentUser, notification.CourseId))
                    return Forbid();

                _context.Notifications.Remove(notification);
                _context.SaveChanges();

                return Ok($"Notification with id={id} was deleted.");
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }
    }
}
