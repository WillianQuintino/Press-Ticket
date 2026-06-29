// Sobe os dois serviços do Press Ticket num container só, via PM2.
// Use sempre com `pm2-runtime start ecosystem.config.js` (foreground),
// nunca `pm2 start` — em container o PM2 precisa rodar em primeiro plano.
module.exports = {
  apps: [
    {
      name: "press-ticket-backend",
      cwd: "./backend",
      script: "dist/server.js",
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
