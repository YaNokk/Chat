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
    public class ChatHub : Hub
    {
        private readonly ContextDB _context;
        private readonly UserManager<User> _userManager;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public class SendToRoomParams
        {
            public string Message { get; set; }
            public List<string> Members { get; set; }
            public Boolean Files { get; set; }
            public String? Name { get; set; }
            public Guid? Room { get; set; }
        }
        public class GetRoomResponse
        {
            public Room Room { get; set; }
            public bool NewRoom { get; set; }
        }
        public class ChatHubResponse
        {
            public string? newRoomId { get; set; }
            public string? messageFileId { get; set; }
            public bool Success { get; set; }
        }
        public ChatHub(ContextDB context, UserManager<User> userManager, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _userManager = userManager;
            _webHostEnvironment = webHostEnvironment;

        }
        public async Task JoinRoom (Guid roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());
        }

        public async Task<ChatHubResponse> SendToRoom(SendToRoomParams options)
        {
            var response = new ChatHubResponse { Success = true };
            try
            {
                var user = await _userManager.FindByNameAsync(Context.User.Identity.Name);
                if (user.IsBanned())
                {
                    await Clients.Caller.SendAsync("onError", new {msg = $"Вы заблокированы администратором до {user.LockoutEnd}"});
                    response.Success = false;
                } 
                else if (user.IsSpammer(_context.User.Include("Message").First(_user => _user == user).Message)) {
                    user.SpamLockoutEnd = user.SpamLockoutEnd == null ? DateTime.Now.AddMinutes(5) 
                        : DateTime.Now > user.SpamLockoutEnd ? user.SpamLockoutEnd.Value.AddMinutes(5) : user.SpamLockoutEnd;
                    await _userManager.UpdateAsync(user);
                    await Clients.Caller.SendAsync("onError", new { msg = $"Вы заблокированы за спам до {user.SpamLockoutEnd}" });
                    response.Success = false;
                }
                else
                {
                    if (user.LockoutEnd != null)
                    {
                        user.LockoutEnd = null;
                        await _userManager.UpdateAsync(user);
                    }
                    var members = options.Members != null ? new List<User> { user }.Concat(_userManager.Users.Where(x => options.Members.Contains(x.Id))).ToList() : new List<User> { user };
                    var room = await GetRoom(members, options.Name, options.Room);
                    if (!string.IsNullOrEmpty(options.Message.Trim()))
                    {
                        var msg = new Message()
                        {
                            Content = DecryptStringAES(options.Message),
                            User = user,
                            Room = room.Room,
                            Timestamp = DateTime.Now,
                        };
                        _context.Messages.Add(msg);
                        await _context.SaveChangesAsync();
                        response.newRoomId = room.NewRoom ? room.Room.Id.ToString() : null;
                        if (!options.Files)
                        {
                            await Clients.Group(room.Room.Id.ToString()).SendAsync("ReceiveMessage", msg);
                        }
                        else {
                            response.messageFileId = msg.Id.ToString();
                        }
                    }
                }
            }
            catch (Exception)
            {
                await Clients.Caller.SendAsync("onError", "Message not send! Message should be 1-500 characters.");
            }
            return response;
        }
        private async Task<GetRoomResponse> GetRoom(List<User> members, String? Name, Guid? roomId)
        {
            var existingRoom = _context.Rooms.Where(r => r.Id == roomId).FirstOrDefault();
            if (existingRoom == null)
            {
                var newRoom = new Room() { User = members, Name = Name };
                _context.Rooms.Add(newRoom);
                await Groups.AddToGroupAsync(Context.ConnectionId, newRoom.Id.ToString());
                return new GetRoomResponse { Room = newRoom, NewRoom = true };
            }
            return new GetRoomResponse { Room = existingRoom, NewRoom = false };
        }
        
        private static string DecryptStringAES(string cipherText)
        {
            var keybytes = Encoding.UTF8.GetBytes("8080808080808080");
            var iv = Encoding.UTF8.GetBytes("8080808080808080");

            var encrypted = Convert.FromBase64String(cipherText);
            var decriptedFromJavascript = DecryptStringFromBytes(encrypted, keybytes, iv);
            return string.Format(decriptedFromJavascript);
        }
        private static string DecryptStringFromBytes(byte[] cipherText, byte[] key, byte[] iv)
        {
            // Check arguments.
            if (cipherText == null || cipherText.Length <= 0)
            {
                throw new ArgumentNullException("cipherText");
            }
            if (key == null || key.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            if (iv == null || iv.Length <= 0)
            {
                throw new ArgumentNullException("key");
            }
            // Declare the string used to hold
            // the decrypted text.
            string plaintext = null;
            // Create an RijndaelManaged object
            // with the specified key and IV.
            using (var rijAlg = Aes.Create())
            {
                //Settings
                rijAlg.Mode = CipherMode.CBC;
                rijAlg.Padding = PaddingMode.PKCS7;
                rijAlg.FeedbackSize = 128;
                rijAlg.Key = key;
                rijAlg.IV = iv;
                // Create a decrytor to perform the stream transform.
                var decryptor = rijAlg.CreateDecryptor(rijAlg.Key, rijAlg.IV);
                try
                {
                    // Create the streams used for decryption.
                    using (var msDecrypt = new MemoryStream(cipherText))
                    {
                        using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                        {
                            using (var srDecrypt = new StreamReader(csDecrypt))
                            {
                                // Read the decrypted bytes from the decrypting stream
                                // and place them in a string.
                                plaintext = srDecrypt.ReadToEnd();
                            }
                        }
                    }
                }
                catch
                {
                    plaintext = "keyError";
                }
            }
            return plaintext;
        }
    }
}
