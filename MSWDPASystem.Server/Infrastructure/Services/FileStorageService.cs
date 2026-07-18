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

    public string GetFileUrl(string filePath)
    {
        // Files are served by static-file middleware rooted at the base storage folder
        // (RequestPath "/files"), so the stored base-path prefix must be stripped.
        var basePath = configuration["FileStorage:BasePath"] ?? "uploads";
        var normalized = filePath.Replace("\\", "/");
        var prefix = basePath.Replace("\\", "/").TrimEnd('/') + "/";
        if (normalized.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            normalized = normalized[prefix.Length..];
        return $"/files/{normalized}";
    }

    public bool IsValidFileType(string contentType, string fileName) =>
        AllowedContentTypes.Contains(contentType.ToLower());

    public bool IsWithinSizeLimit(long fileSizeBytes, long maxBytes = 10_485_760) =>
        fileSizeBytes <= maxBytes;
}
