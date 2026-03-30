const http = require('http');
const app = require('./app');
const connectDb = require('./config/db');
const { port, nodeEnv } = require('./config/env');
const { setupSocket } = require('./sockets');

const startServer = async () => {
  try {
    await connectDb();
    const server = http.createServer(app);
    setupSocket(server);

    server.listen(port, () => {
      console.log(`API listening on port ${port} (${nodeEnv})`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

startServer();
