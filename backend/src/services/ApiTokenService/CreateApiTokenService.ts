import crypto from "crypto";
import AppError from "../../errors/AppError";
import ApiToken from "../../models/ApiToken";

interface TokenData {
  name: string;
  permissions: string;
}

interface CreatedToken {
  id: number;
  name: string;
  token: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CreateApiTokenService = async ({
  name,
  permissions
}: TokenData): Promise<CreatedToken> => {
  const plainToken = crypto.randomUUID();
  const hmacSecret = process.env.ENCRYPTION_KEY;
  if (!hmacSecret) {
    throw new AppError("ENCRYPTION_KEY não configurada", 500);
  }
  const tokenHash = crypto
    .createHmac("sha256", hmacSecret)
    .update(plainToken)
    .digest("hex");

  const apiToken = await ApiToken.create({
    name,
    token: "",
    tokenHash,
    permissions
  });

  // Retorna o plain token apenas neste momento — não é armazenado
  return {
    id: apiToken.id,
    name: apiToken.name,
    token: plainToken,
    permissions: apiToken.permissions as unknown as string[],
    createdAt: apiToken.createdAt,
    updatedAt: apiToken.updatedAt
  };
};

export default CreateApiTokenService;
