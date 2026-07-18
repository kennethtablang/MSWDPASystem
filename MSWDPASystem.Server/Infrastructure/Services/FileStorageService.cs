using MSWDPASystem.Server.Common.Interfaces;

namespace MSWDPASystem.Server.Infrastructure.Services;

public class FileStorageService(IConfiguration configuration, IWebHostEnvironment environment) : IFileStorageService
{
    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string subDirectory = "")
    {
        var basePath = configuration["FileStorage:BasePath"] ?? "uploads";
        var uploadPath = Path.Combine(environment.ContentRootPath, basePath, subDirectory);

        Directory.CreateDirectory(uploadPath);

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var filePath = Path.Combine(uploadPath, uniqueFileName);

        await using var fileOutput = File.Create(filePath);
        await fileStream.CopyToAsync(fileOutput);

        return Path.Combine(basePath, subDirectory, uniqueFileName).Replace("\\", "/");
    }

    public Task DeleteFileAsync(string filePath)
    {
        var fullPath = Path.Combine(environment.ContentRootPath, filePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }

    public async Task<byte[]?> ReadFileAsync(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath)) return null;

        var basePath = configuration["FileStorage:BasePath"] ?? "uploads";
        var storageRoot = Path.GetFullPath(Path.Combine(environment.ContentRootPath, basePath));
        var fullPath = Path.GetFullPath(Path.Combine(environment.ContentRootPath, filePath));

        // Containment check: never read outside the storage root, even if a stored
        // path were ever tampered with to contain traversal segments.
        if (!fullPath.StartsWith(storageRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            return null;

        if (!File.Exists(fullPath)) return null;

        return await File.ReadAllBytesAsync(fullPath);
    }

    public bool IsValidFileType(string contentType, string fileName) =>
        AllowedContentTypes.Contains(contentType.ToLower());

    public bool IsWithinSizeLimit(long fileSizeBytes, long maxBytes = 10_485_760) =>
        fileSizeBytes <= maxBytes;
}
