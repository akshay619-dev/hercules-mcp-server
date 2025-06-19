import 'dotenv/config';
import { HerculesHTTPServer } from './http-server.js';

async function main() {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const server = new HerculesHTTPServer(port);
    await server.start();
  } catch (error) {
    console.error('Failed to start Hercules HTTP Server:', error);
    process.exit(1);
  }
}

main(); 