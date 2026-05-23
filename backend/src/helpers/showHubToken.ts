import Setting from "../models/Integration";
import { decryptValue } from "./EncryptionHelper";

export const showHubToken = async (): Promise<string> => {
  const notificameHubToken = await Setting.findOne({
    where: {
      key: "hubToken"
    }
  });

  if (!notificameHubToken) {
    throw new Error("Notificame Hub token not found");
  }

  const raw = notificameHubToken.value.trim().replace(/[\r\n]/g, "");
  return decryptValue(raw);
};
