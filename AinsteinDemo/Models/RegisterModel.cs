using System.ComponentModel;

namespace AinsteinDemo.Models
{
    public class RegisterModel
    {
        [DisplayName("First Name")]
        public string FirstName { get; set; }
        [DisplayName("Last Name")]
        public string LastName { get; set; }
        public string Email { get; set; }   
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}