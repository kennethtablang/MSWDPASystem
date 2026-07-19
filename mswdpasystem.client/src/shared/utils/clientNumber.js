/**
 * Beneficiary QR codes encode the bare client number (see GetQrCodeQueryHandler),
 * but this parses tolerantly so a code re-issued later as a URL or JSON payload
 * still resolves rather than failing at the claim table.
 */
const CLIENT_NUMBER_PATTERN = /\b([A-Z]{2,10}-\d{4}-\d{3,6})\b/i;

export function parseClientNumber(raw) {
  if (!raw) return null;
  const text = String(raw).trim();

  // Plain client number — the format the system currently issues. Also matches
  // one embedded in a URL, e.g. https://…/verify?cn=CABA-2026-0001
  const direct = text.match(CLIENT_NUMBER_PATTERN);
  if (direct) return direct[1].toUpperCase();

  // JSON payload, e.g. {"clientNumber":"CABA-2026-0001"}
  try {
    const parsed = JSON.parse(text);
    const candidate = parsed?.clientNumber ?? parsed?.client_number ?? parsed?.cn;
    if (candidate) return String(candidate).trim().toUpperCase();
  } catch {
    // not JSON — fall through
  }

  return null;
}
