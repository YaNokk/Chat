using Chat.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Chat.Hubs
{
    [Authorize]
    public class ConnectionHub : Hub
    {
        private readonly ContextDB _context;
        private readonly UserManager<User> _userManager;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public class ChatHubResponse
        {
            public string? newRoomId { get; set; }
            public string? messageFileId { get; set; }
            public bool Success { get; set; }
        }
        public ConnectionHub(ContextDB context, UserManager<User> userManager, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _userManager = userManager;
            _webHostEnvironment = webHostEnvironment;

        }

        public async Task Connect()
        {
            try
            {
                var user = await _userManager.FindByNameAsync(Context.User.Identity.Name);
                Clients.All.SendAsync("UserConnected", user);
            }
            catch (Exception)
            {
                Clients.Caller.SendAsync("onError", "Error");
            }
        }
        public async Task Disconnect()
        {
            try
            {
                var user = await _userManager.FindByNameAsync(Context.User.Identity.Name);
                Clients.All.SendAsync("UserDisconnected", user);
            }
            catch (Exception)
            {
                Clients.Caller.SendAsync("onError", "Error");
            }
        }
    }
}
