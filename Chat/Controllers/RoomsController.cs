using Chat.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chat.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly ContextDB _context;
        private readonly UserManager<User> _userManager;

        public RoomsController(ContextDB context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        [ActionName("Chats")]
        public async Task<List<Object>> GetRooms()
        {
            var rooms = new List<Object>();
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            rooms.AddRange(_context.Rooms.Include(x => x.Message).ThenInclude(x => x.File).Include(x => x.User)
                .Where(room => room.User.FirstOrDefault(_user => _user.Id == user.Id) != null)
                .Select(room => new { Id = room.Id, Name = room.Name, LastMessage = room.Message.OrderBy(message => message.Timestamp).LastOrDefault(),
                    Members = room.User.Select(user => new {user.Id, user.Avatar, user.UserName})})
                .ToList());;
            return rooms;
        }
        [HttpGet("{id}")]
        [ActionName("Chats")]
        public async Task<Object> GetRoom(Guid id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);
            var room = _context.Rooms.Include(x => x.Message).ThenInclude(x => x.File).Include(x => x.User)
                .FirstOrDefault(room => room.Id == id);
            return new { room.Id, messages = room.Message.Select(message => new {message.Id, message.File, message.Content, message.Timestamp, user = new { message.User.Id, message.User.UserName, message.User.Avatar} }).ToList() };
        }
    }
}
