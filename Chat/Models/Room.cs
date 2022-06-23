namespace Chat.Models
{
    public class Room
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public ICollection<User> User { get; set; }
        public ICollection<Message> Message { get; set; }
    }
}
