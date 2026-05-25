import crypto from "crypto";
import AppError from "../../errors/AppError";
import ApiToken from "../../models/ApiToken";

const FindByTokenService = async (token: string): Promise<ApiToken> => {
  const hmacSecret = process.env.ENCRYPTION_KEY;
  if (!hmacSecret) {
    throw new AppError("ENCRYPTION_KEY não configurada", 500);
  }
  const tokenHash = crypto
    .createHmac("sha256", hmacSecret)
    .update(token)
    .digest("hex");

  const apiToken = await ApiToken.findOne({
    where: { tokenHash }
  });

  if (!apiToken) {
    throw new AppError("ERR_TOKEN_NOT_FOUND", 404);
  }

  return apiToken;
};

export default FindByTokenService;
