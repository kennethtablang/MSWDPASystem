using MSWDPASystem.Server.Common.Interfaces;
using QRCoder;

namespace MSWDPASystem.Server.Infrastructure.Services;

public class QrCodeService : IQrCodeService
{
    public byte[] GenerateQrCode(string data)
    {
        using var generator = new QRCodeGenerator();
        using var qrData = generator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrData);
        return qrCode.GetGraphic(10);
    }

    public string GenerateQrCodeBase64(string data)
    {
        var bytes = GenerateQrCode(data);
        return $"data:image/png;base64,{Convert.ToBase64String(bytes)}";
    }
}
