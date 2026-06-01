/* ================================================================
   SDC HR Solutions — Simulated Field-Level PII Encryption
   Simulates AES-256-GCM obfuscation for high-risk PII fields.
   ================================================================ */

const DEMO_KEY = "SDC_SECRET_SALT_2026_PRODUCTION_SECURE";

/**
 * Encrypts a plaintext string using a simulated AES-256 (Base64 + Cipher transposition).
 * @param plaintext The sensitive data to encrypt.
 * @returns The encrypted string.
 */
export function encrypt(plaintext: string | number | undefined | null): string {
  if (plaintext === undefined || plaintext === null) return "";
  const str = String(plaintext);
  if (!str) return "";

  // Base64 encoding followed by a character rotation (transposition) to simulate AES-256 obfuscation
  const base64 = btoa(unescape(encodeURIComponent(str)));
  let cipherText = "";
  for (let i = 0; i < base64.length; i++) {
    const charCode = base64.charCodeAt(i);
    // Rotate character codes using a derivative of DEMO_KEY length
    const offset = (DEMO_KEY.charCodeAt(i % DEMO_KEY.length) % 13) + 1;
    cipherText += String.fromCharCode(charCode + offset);
  }
  return `SDC_ENCv1[${cipherText}]`;
}

/**
 * Decrypts a simulated AES-256 encrypted string.
 * @param ciphertext The encrypted string.
 * @returns The decrypted plaintext.
 */
export function decrypt(ciphertext: string | undefined | null): string {
  if (!ciphertext) return "";
  if (!ciphertext.startsWith("SDC_ENCv1[") || !ciphertext.endsWith("]")) {
    return ciphertext; // Return as-is if it's already decrypted or raw
  }

  const payload = ciphertext.substring(10, ciphertext.length - 1);
  let decryptedBase64 = "";
  for (let i = 0; i < payload.length; i++) {
    const charCode = payload.charCodeAt(i);
    const offset = (DEMO_KEY.charCodeAt(i % DEMO_KEY.length) % 13) + 1;
    decryptedBase64 += String.fromCharCode(charCode - offset);
  }

  try {
    return decodeURIComponent(escape(atob(decryptedBase64)));
  } catch (e) {
    console.error("PII Decryption error: Invalid cipher format", e);
    return "[DECRYPTION_ERROR]";
  }
}
