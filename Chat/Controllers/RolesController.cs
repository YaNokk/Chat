using Chat.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Chat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly ContextDB _context;
        public RolesController (ContextDB context)
        {
            _context = context;
        }
        [HttpGet]
        public List<IdentityRole> Roles()
        {
            return _context.Roles.ToList();
        }
    }
}
