namespace MSWDPASystem.Server.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string subDirectory = "");
    Task DeleteFileAsync(string filePath);
    string GetFileUrl(string filePath);
    bool IsValidFileType(string contentType, string fileName);
    bool IsWithinSizeLimit(long fileSizeBytes, long maxBytes = 10_485_760);
}
