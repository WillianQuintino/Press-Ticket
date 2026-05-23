import { QueryInterface } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const password = crypto.randomBytes(12).toString("base64");
    const passwordHash = await bcrypt.hash(password, 8);

    // eslint-disable-next-line no-console
    console.log("\n=================================================");
    // eslint-disable-next-line no-console
    console.log("  Usuário masteradmin criado com senha temporária:");
    // eslint-disable-next-line no-console
    console.log(`  Email: masteradmin@pressticket.com.br`);
    // eslint-disable-next-line no-console
    console.log(`  Senha: ${password}`);
    // eslint-disable-next-line no-console
    console.log("  ALTERE ESTA SENHA IMEDIATAMENTE APÓS O LOGIN!");
    // eslint-disable-next-line no-console
    console.log("=================================================\n");

    return queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "MasterAdmin",
          email: "masteradmin@pressticket.com.br",
          passwordHash,
          profile: "masteradmin",
          tokenVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
