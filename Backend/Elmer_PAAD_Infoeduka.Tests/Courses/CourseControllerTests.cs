using Elmer_PAAD_Infoeduka.Controllers;
using Elmer_PAAD_Infoeduka.Dtos.Courses;
using Elmer_PAAD_Infoeduka.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Elmer_PAAD_Infoeduka.Tests.Courses
{
    public class CourseControllerTests
    {
        private EduDeskDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<EduDeskDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new EduDeskDbContext(options);
        }

        private CourseController CreateControllerWithUser(EduDeskDbContext context, string email)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, email)
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);

            var controller = new CourseController(context);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = user
                }
            };

            return controller;
        }

        [Fact]
        public void Get_WhenStudentIsAssigned_ReturnsAssignedCourse()
        {
            using (var context = CreateContext())
            {
                // Arrange
                var studentRole = new UserTypeItem
                {
                    Id = 3,
                    Type = "Student"
                };

                var lecturerRole = new UserTypeItem
                {
                    Id = 2,
                    Type = "Lecturer"
                };

                var student = new User
                {
                    Id = 1,
                    FirstName = "Test",
                    LastName = "Student",
                    Email = "student@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    RoleId = 3,
                    Role = studentRole
                };

                var lecturer = new User
                {
                    Id = 2,
                    FirstName = "Test",
                    LastName = "Lecturer",
                    Email = "lecturer@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    RoleId = 2,
                    Role = lecturerRole
                };

                var assignedCourse = new Course
                {
                    Id = 1,
                    LecturerId = lecturer.Id,
                    Lecturer = lecturer,
                    Name = "Assigned Course",
                    ShortDescription = "Student can access this course",
                    Details = "Course details",
                    EctsScore = 5
                };

                var studentCourseItem = new StudentCourseItem
                {
                    Id = 1,
                    StudentId = student.Id,
                    Student = student,
                    CourseId = assignedCourse.Id,
                    Course = assignedCourse,
                    EnrolledAt = DateTime.UtcNow
                };

                context.UserTypeItems.Add(studentRole);
                context.UserTypeItems.Add(lecturerRole);
                context.Users.Add(student);
                context.Users.Add(lecturer);
                context.Courses.Add(assignedCourse);
                context.StudentCourseItems.Add(studentCourseItem);
                context.SaveChanges();

                var controller = CreateControllerWithUser(context, "student@test.com");

                // Act
                var result = controller.Get();

                // Assert
                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var courses = Assert.IsAssignableFrom<List<CourseDetailsDto>>(okResult.Value);

                Assert.Single(courses);
                Assert.Equal("Assigned Course", courses[0].Name);
            }
        }

        [Fact]
        public void Get_WhenStudentIsNotAssigned_DoesNotReturnUnassignedCourse()
        {
            using (var context = CreateContext())
            {
                // Arrange
                var studentRole = new UserTypeItem
                {
                    Id = 3,
                    Type = "Student"
                };

                var lecturerRole = new UserTypeItem
                {
                    Id = 2,
                    Type = "Lecturer"
                };

                var student = new User
                {
                    Id = 1,
                    FirstName = "Test",
                    LastName = "Student",
                    Email = "student@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    RoleId = 3,
                    Role = studentRole
                };

                var lecturer = new User
                {
                    Id = 2,
                    FirstName = "Test",
                    LastName = "Lecturer",
                    Email = "lecturer@test.com",
                    PasswordHash = "hash",
                    CreatedAt = DateTime.UtcNow,
                    RoleId = 2,
                    Role = lecturerRole
                };

                var assignedCourse = new Course
                {
                    Id = 1,
                    LecturerId = lecturer.Id,
                    Lecturer = lecturer,
                    Name = "Assigned Course",
                    ShortDescription = "Student can access this course",
                    Details = "Course details",
                    EctsScore = 5
                };

                var unassignedCourse = new Course
                {
                    Id = 2,
                    LecturerId = lecturer.Id,
                    Lecturer = lecturer,
                    Name = "Unassigned Course",
                    ShortDescription = "Student cannot access this course",
                    Details = "Course details",
                    EctsScore = 6
                };

                var studentCourseItem = new StudentCourseItem
                {
                    Id = 1,
                    StudentId = student.Id,
                    Student = student,
                    CourseId = assignedCourse.Id,
                    Course = assignedCourse,
                    EnrolledAt = DateTime.UtcNow
                };

                context.UserTypeItems.Add(studentRole);
                context.UserTypeItems.Add(lecturerRole);
                context.Users.Add(student);
                context.Users.Add(lecturer);
                context.Courses.Add(assignedCourse);
                context.Courses.Add(unassignedCourse);
                context.StudentCourseItems.Add(studentCourseItem);
                context.SaveChanges();

                var controller = CreateControllerWithUser(context, "student@test.com");

                // Act
                var result = controller.Get();

                // Assert
                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var courses = Assert.IsAssignableFrom<List<CourseDetailsDto>>(okResult.Value);

                Assert.Single(courses);
                Assert.Contains(courses, x => x.Name == "Assigned Course");
                Assert.DoesNotContain(courses, x => x.Name == "Unassigned Course");
            }
        }
    }
}
