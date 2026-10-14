using System.ComponentModel.DataAnnotations;

namespace Elmer_PAAD_Infoeduka.Dtos.Auth
{
    public class UserLoginDto
    {

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Provide a correct e-mail address")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = null!;
    }
}
