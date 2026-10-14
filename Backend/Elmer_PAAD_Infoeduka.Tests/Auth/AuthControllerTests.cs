using Elmer_PAAD_Infoeduka.Controllers;
using Elmer_PAAD_Infoeduka.Dtos.Auth;
using Elmer_PAAD_Infoeduka.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Elmer_PAAD_Infoeduka.Tests.Auth
{
    public class AuthControllerTests
    {
        private EduDeskDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<EduDeskDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new EduDeskDbContext(options);
        }

        private IConfiguration CreateConfiguration()
        {
            var settings = new Dictionary<string, string?>
            {
                { "JWT:SecureKey", "this-is-my-test-secure-key-with-enough-length-12345" }
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();
        }

        [Fact]
        public void Login_WithCorrectCredentials_ReturnsToken()
        {
            using (var context = CreateContext())
            {
                // Arrange
                var role = new UserTypeItem
                {
                    Id = 3,
                    Type = "Student"
                };

                var user = new User
                {
                    Id = 1,
                    FirstName = "Test",
                    LastName = "Student",
                    Email = "student@test.com",
                    CreatedAt = DateTime.UtcNow,
                    RoleId = 3,
                    Role = role
                };

                var passwordHasher = new PasswordHasher<User>();
                user.PasswordHash = passwordHasher.HashPassword(user, "password123");

                context.UserTypeItems.Add(role);
                context.Users.Add(user);
                context.SaveChanges();

                var controller = new AuthController(CreateConfiguration(), context);

                var loginDto = new UserLoginDto
                {
                    Email = "student@test.com",
                    Password = "password123"
                };

                // Act
                var result = controller.Login(loginDto);

                // Assert
                var okResult = Assert.IsType<OkObjectResult>(result);
                var token = Assert.IsType<string>(okResult.Value);

                Assert.False(string.IsNullOrWhiteSpace(token));
            }
        }

        [Fact]
        public void Login_WithIncorrectPassword_ReturnsBadRequest()
        {
            using (var context = CreateContext())
            {
                // Arrange
                var role = new UserTypeItem
                {
                    Id = 3,
                    Type = "Student"
                };

                var user = new User
                {
                    Id = 1,
                    FirstName = "Test",
                    LastName = "Student",
                    Email = "student@test.com",
                    CreatedAt = DateTime.UtcNow,
                    RoleId = 3,
                    Role = role
                };

                var passwordHasher = new PasswordHasher<User>();
                user.PasswordHash = passwordHasher.HashPassword(user, "password123");

                context.UserTypeItems.Add(role);
                context.Users.Add(user);
                context.SaveChanges();

                var controller = new AuthController(CreateConfiguration(), context);

                var loginDto = new UserLoginDto
                {
                    Email = "student@test.com",
                    Password = "wrongpassword"
                };

                // Act
                var result = controller.Login(loginDto);

                // Assert
                var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);

                Assert.Equal("Incorrect username or password", badRequestResult.Value);
            }
        }

    }
}
