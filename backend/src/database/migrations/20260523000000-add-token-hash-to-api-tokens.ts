import { DataTypes, QueryInterface } from "sequelize";
import crypto from "crypto";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("ApiTokens", "tokenHash", {
      type: DataTypes.STRING(64),
      allowNull: true
    });

    // Popula tokenHash para todos os tokens existentes
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id, token FROM ApiTokens WHERE tokenHash IS NULL"
    ) as [Array<{ id: number; token: string }>, unknown];

    for (const row of rows) {
      const hash = crypto.createHash("sha256").update(row.token).digest("hex");
      await queryInterface.sequelize.query(
        "UPDATE ApiTokens SET tokenHash = ? WHERE id = ?",
        { replacements: [hash, row.id] }
      );
    }

    await queryInterface.changeColumn("ApiTokens", "tokenHash", {
      type: DataTypes.STRING(64),
      allowNull: false
    });

    await queryInterface.addIndex("ApiTokens", ["tokenHash"], {
      unique: true,
      name: "api_tokens_token_hash_unique"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("ApiTokens", "api_tokens_token_hash_unique");
    await queryInterface.removeColumn("ApiTokens", "tokenHash");
  }
};
