using Chat.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Chat
{
    public class ContextDB : IdentityDbContext
    {
        public ContextDB(DbContextOptions options) : base(options)
        {

        }
        public DbSet<User> User {get; set;}
        public DbSet<Room> Rooms {get; set;}
        public DbSet<Message> Messages { get; set; }
    }
}
