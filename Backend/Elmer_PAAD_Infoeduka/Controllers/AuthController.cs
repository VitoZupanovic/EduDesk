using Elmer_PAAD_Infoeduka.Dtos.Auth;
using Elmer_PAAD_Infoeduka.Models;
using Elmer_PAAD_Infoeduka.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elmer_PAAD_Infoeduka.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly EduDeskDbContext _context;

        public AuthController(IConfiguration config, EduDeskDbContext context)
        {
            _config = config;
            _context = context;
        }

        [HttpPost("[action]")]
        public ActionResult Login(UserLoginDto userDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var genericLoginFail = "Incorrect username or password";

                var existingUser = _context.Users
                    .Include(x => x.Role)
                    .FirstOrDefault(x => x.Email == userDto.Email);

                if (existingUser == null)
                    return BadRequest(genericLoginFail);

                var passwordHasher = new PasswordHasher<User>();

                var result = passwordHasher.VerifyHashedPassword(
                    existingUser,
                    existingUser.PasswordHash,
                    userDto.Password
                );

                if (result == PasswordVerificationResult.Failed)
                    return BadRequest(genericLoginFail);

                var secureKey = _config["JWT:SecureKey"];
                if (string.IsNullOrWhiteSpace(secureKey))
                    return StatusCode(500, "JWT secure key is missing.");

                var serializedToken = JwtProviderHelper.CreateToken(
                    secureKey,
                    120,
                    existingUser.Email,
                    existingUser.Role.Type
                );

                return Ok(serializedToken);
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        [Authorize]
        [HttpPost("[action]")]
        public ActionResult ChangePassword(ChangePasswordDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userEmail = User.Identity?.Name; //CURRENTLY LOGGED IN USER

                if (string.IsNullOrWhiteSpace(userEmail))
                    return Unauthorized("Invalid token.");

                var user = _context.Users.FirstOrDefault(x => x.Email == userEmail);

                if (user == null)
                    return NotFound("User not found.");

                var passwordHasher = new PasswordHasher<User>();

                var result = passwordHasher.VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    dto.CurrentPassword
                );

                if (result == PasswordVerificationResult.Failed)
                    return BadRequest("Current password is incorrect.");

                user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);

                _context.Users.Update(user);
                _context.SaveChanges();

                return Ok("Password changed successfully.");
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("[action]")]
        public ActionResult CreateUser(UserRegisterDto userDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool emailExists = _context.Users.Any(x => x.Email == userDto.Email);
                if (emailExists)
                    return BadRequest("A user with this email already exists.");

                var roleExists = _context.UserTypeItems.Any(x => x.Id == userDto.RoleId);
                if (!roleExists)
                    return BadRequest("Invalid role.");

                var user = new User
                {
                    FirstName = userDto.FirstName,
                    LastName = userDto.LastName,
                    Email = userDto.Email,
                    CreatedAt = DateTime.UtcNow,
                    RoleId = userDto.RoleId
                };

                var passwordHasher = new PasswordHasher<User>();
                user.PasswordHash = passwordHasher.HashPassword(user, userDto.Password);

                _context.Users.Add(user);
                _context.SaveChanges();

                return Ok(new
                {
                    message = "User created successfully.",
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.RoleId,
                    user.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return ApiError.FromException(this, ex);
            }
        }

    }
}
