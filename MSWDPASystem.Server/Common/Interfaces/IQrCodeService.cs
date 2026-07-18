namespace MSWDPASystem.Server.Common.Interfaces;

public interface IQrCodeService
{
    byte[] GenerateQrCode(string data);
    string GenerateQrCodeBase64(string data);
}
