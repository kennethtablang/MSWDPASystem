namespace MSWDPASystem.Server.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string subDirectory = "");
    Task DeleteFileAsync(string filePath);

    /// <summary>
    /// Reads a stored file's bytes. Returns null when the file is missing.
    /// Stored files are never served by static-file middleware — they contain
    /// beneficiary personal data and must only be returned through an
    /// authorized endpoint (RA 10173 / NFR-7.2, NFR-7.4).
    /// </summary>
    Task<byte[]?> ReadFileAsync(string filePath);
    bool IsValidFileType(string contentType, string fileName);
    bool IsWithinSizeLimit(long fileSizeBytes, long maxBytes = 10_485_760);
}
