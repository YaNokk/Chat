#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Chat;
using Chat.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using TypeMerger;

namespace Chat.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ContextDB _context;
        private readonly UserManager<User> _userManager;

        public UsersController(ContextDB context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public class TimeoutOptions
        {
            public Guid Id { get; set; }
            public string Timeout { get; set; }
        }

        // GET: api/Users
        [HttpGet]
        public async Task<IEnumerable<Object>> GetUsers()
        {
            var currentUser = await _userManager.FindByNameAsync(User.Identity.Name);
            List<Object> formattedUsers = new List<Object>();
            var users = await _userManager.Users.Include(x => x.Room).ToListAsync();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var roomWithUser = user.Room.Where(x => x.Name == null).FirstOrDefault(room => room.User.Contains(currentUser));
                if (user != currentUser) formattedUsers.Add(new { user.Id, user.Avatar, user.UserName, roles, room = roomWithUser });
            }
            return formattedUsers;
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Object>> GetUser(string id)
        {
            var user = await _context.User.FindAsync(id);
            var roles = await _userManager.GetRolesAsync(user);
            if (user == null)
            {
                return NotFound();
            }

            return new { user, roles };
        }
        [HttpPost]
        [Authorize(Roles = Roles.Moderator + "," + Roles.Admin)]
        public async Task<Object> TimeoutUser (TimeoutOptions options)
        {
            var user = await _userManager.FindByIdAsync(options.Id.ToString());
            var roles = await _userManager.GetRolesAsync(user);
            if (user.LockoutEnd == null || user.LockoutEnd < DateTime.Now)
            {
                user.LockoutEnd = DateTimeOffset.Parse(options.Timeout);
                await _userManager.UpdateAsync(user);
            }
            return TypeMerger.TypeMerger.Merge(new { Roles = roles }, user);
        }
    }
}
