using Chat.Classes;
using Chat.Hubs;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Chat.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class FileController : ControllerBase
    {
        private readonly ContextDB _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IHubContext<ChatHub> _hubContext;
        public FileController(ContextDB context, IWebHostEnvironment webHostEnvironment, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
            _hubContext = hubContext;
        }
        public class UploadOptions
        {
            public IFormFile File { get; set; }
            public Guid MessageId { get; set; }
        }
        // GET: FileController/Create
        [HttpGet]
        public FileContentResult Download(string filePath)
        {
            return File(
                System.IO.File.ReadAllBytes(
                    Path.Combine(Directory.GetCurrentDirectory(), "Files", filePath)
                ), 
                "application/octet-stream",
                filePath);
        }
        [HttpPost]
        public async Task Upload([FromForm]UploadOptions model)
        {
            var message = _context.Messages.Include(x => x.Room).Include(x => x.User).FirstOrDefault(message => message.Id == model.MessageId);
            await new FileWorker(_context, _webHostEnvironment).SaveFiles(new List<IFormFile>() { model.File }, message);
            await _hubContext.Clients.Group(message.Room.Id.ToString()).SendAsync("ReceiveMessage", message);
        }
    }
}
