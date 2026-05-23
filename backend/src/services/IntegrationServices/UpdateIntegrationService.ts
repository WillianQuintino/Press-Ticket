import AppError from "../../errors/AppError";
import Integration from "../../models/Integration";
import { encryptValue } from "../../helpers/EncryptionHelper";

const SENSITIVE_INTEGRATION_KEYS = new Set(["hubToken", "apiMaps"]);

interface Request {
  key: string;
  value: string;
}

const UpdateIntegrationService = async ({
  key,
  value
}: Request): Promise<Integration | undefined> => {
  const integration = await Integration.findOne({
    where: { key }
  });

  if (!integration) {
    throw new AppError("ERR_NO_INTEGRATION_FOUND", 404);
  }

  const storedValue = SENSITIVE_INTEGRATION_KEYS.has(key)
    ? encryptValue(value)
    : value;

  await integration.update({ value: storedValue });

  return integration;
};

export default UpdateIntegrationService;
