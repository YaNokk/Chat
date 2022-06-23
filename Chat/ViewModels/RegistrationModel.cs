using System.ComponentModel.DataAnnotations;

namespace Chat.ViewModels
{
    public class RegistrationModel
    {
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
        [Required]
        [Compare("Password", ErrorMessage = "Пароли не совпадают")]
        [DataType(DataType.Password)]
        public string PasswordConfirm { get; set; } = string.Empty;
        [Required]
        public string Role { get; set; } = String.Empty;
        [Required]
        public IFormFile Avatar { get; set; }
    }
}
