if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET e JWT_REFRESH_SECRET são obrigatórios. Gere com: openssl rand -base64 32"
  );
}

export default {
  secret: process.env.JWT_SECRET,
  expiresIn: "8h",
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: "1d"
} as const;
