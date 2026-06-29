// Sobe backend (8000) e frontend (3000) num container só, via PM2.
// Sempre com pm2-runtime (foreground) — nunca `pm2 start`.
// process.execPath = caminho absoluto do Node que executa este arquivo,
// garantindo que o PM2 use o MESMO Node para os processos filhos.
const NODE = process.execPath;

module.exports = {
  apps: [
    {
      name: "press-ticket-backend",
      cwd: "./backend",
      script: "dist/server.js",
      interpreter: NODE,
      node_args: "--no-deprecation",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: "8000",
      },
    },
    {
      name: "press-ticket-frontend",
      cwd: "./frontend",
      script: "server.js",
      interpreter: NODE,
      node_args: "--no-deprecation",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
