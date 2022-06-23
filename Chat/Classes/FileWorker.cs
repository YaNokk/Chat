using Chat.Models;

namespace Chat.Classes
{
    public class FileWorker
    {
        private readonly ContextDB _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public FileWorker(ContextDB dbContext, IWebHostEnvironment webHostEnvironment)
        {
            _context = dbContext;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<string> SaveImage (IFormFile file)
        {
            string fileName = Path.GetFileNameWithoutExtension(file.FileName).Replace(' ', '-') + DateTime.Now.ToFileTime() + Path.GetExtension(file.FileName);
            string filePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Images", fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return fileName;
        }
        public async Task<List<string>> SaveFiles(List<IFormFile> files, Message message)
        {
            var newFiles = new List<ChatFile>();
            string rootPath = Path.Combine(_webHostEnvironment.ContentRootPath, "Files");
            foreach (var file in files)
            {
                var newFile = new ChatFile { FileName = file.FileName, FileSize = file.Length };
                string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                string filePath = Path.Combine(rootPath, fileName);
                newFile.FilePath = fileName;
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                    newFiles.Add(newFile);
                }
            }
            message.File = newFiles;
            _context.SaveChanges();
            return newFiles.Select(file => file.FileName).ToList();
        }
    }
}
