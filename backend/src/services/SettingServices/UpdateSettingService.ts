import Setting from "../../models/Setting";
import { encryptValue } from "../../helpers/EncryptionHelper";

const SENSITIVE_SETTING_KEYS = new Set(["emailPass"]);

interface Request {
  key: string;
  value: string;
}

const UpdateSettingService = async ({
  key,
  value
}: Request): Promise<Setting | undefined> => {
  const storedValue = SENSITIVE_SETTING_KEYS.has(key)
    ? encryptValue(value)
    : value;

  const setting = await Setting.findOne({ where: { key } });

  if (setting) {
    await setting.update({ value: storedValue });
    return setting;
  }

  const newSetting = await Setting.create({ key, value: storedValue });
  return newSetting;
};

export default UpdateSettingService;
