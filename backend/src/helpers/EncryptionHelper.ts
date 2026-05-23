import crypto from "crypto";
import { logger } from "../utils/logger";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENC_PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    logger.warn(
      "ENCRYPTION_KEY não definida — secrets serão armazenados em plain text. " +
        "Gere com: openssl rand -hex 32"
    );
    return null;
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    logger.error(
      "ENCRYPTION_KEY inválida: esperado 32 bytes hex (64 caracteres). Secrets em plain text."
    );
    return null;
  }
  return key;
}

export function encryptValue(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return (
    ENC_PREFIX +
    iv.toString("hex") +
    ":" +
    authTag.toString("hex") +
    ":" +
    encrypted.toString("hex")
  );
}

export function decryptValue(value: string): string {
  if (!value.startsWith(ENC_PREFIX)) {
    // Valor plain text (pré-migração ou ENCRYPTION_KEY ausente) — retorna como está
    return value;
  }

  const key = getKey();
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY ausente mas valor está criptografado. " +
        "Defina ENCRYPTION_KEY no .env para descriptografar."
    );
  }

  const parts = value.slice(ENC_PREFIX.length).split(":");
  if (parts.length !== 3) {
    throw new Error("Formato de valor criptografado inválido.");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  decipher.setAuthTag(authTag);

  return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
}
