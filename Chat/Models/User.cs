using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;

namespace Chat.Models
{
    public class User : IdentityUser
    {
        public string Avatar { get; set; } = string.Empty;
        public ICollection<Room> Room { get; set; }
        public ICollection<Message> Message { get; set; }
        public DateTimeOffset? SpamLockoutEnd { get; set; }
        public bool IsBanned()
        {
            return this.LockoutEnd != null && this.LockoutEnd > DateTime.Now;
        }
        public bool IsSpammer(IEnumerable<Message> message) // Пользователь блокируется при > 100 сообщений в минуту
        {
            return message.Where(message => message.Timestamp >= DateTime.Now.AddMinutes(-1)).ToList().Count() > 5;
        }
    }
}
