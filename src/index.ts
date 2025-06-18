import { HerculesMCPServer } from './mcp-server.js';

async function main() {
  try {
    const server = new HerculesMCPServer();
    await server.run();
  } catch (error) {
    console.error('Failed to start Hercules MCP Server:', error);
    process.exit(1);
  }
}

main(); 