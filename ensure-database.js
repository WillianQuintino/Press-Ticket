// ensure-database.js
// Cria o database (DB_NAME) caso ele ainda não exista.
// Conecta SEM especificar database, roda um CREATE DATABASE IF NOT EXISTS e sai.
// Usa o driver mysql2, que já é dependência do backend do Press-Ticket.
// Lê as mesmas variáveis de ambiente que o resto da aplicação usa.

const mysql = require("mysql2/promise");

async function main() {
  const {
    DB_HOST,
    DB_PORT = "3306",
    DB_USER,
    DB_PASS,
    DB_NAME,
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error("[ensure-db] Variáveis DB_HOST/DB_USER/DB_NAME ausentes; abortando.");
    process.exit(1);
  }

  // Conecta sem 'database' — porque a base pode ainda não existir.
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASS,
  });

  // Identificador não pode ir como placeholder "?", então escapamos o nome.
  const dbId = mysql.escapeId(DB_NAME);
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${dbId} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
  );

  console.log(`[ensure-db] Database ${DB_NAME} garantido (criado se não existia).`);
  await connection.end();
}

main().catch((err) => {
  console.error("[ensure-db] Falhou ao garantir o database:", err.message);
  process.exit(1);
});
