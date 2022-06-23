namespace Chat.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        public string? Content { get; set; }
        public ICollection<ChatFile>? File { get; set; } = null;
        public DateTime Timestamp { get; set; }
        public User User { get; set; }
        public Room Room { get; set; }
    }
}
