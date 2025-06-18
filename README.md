# Hercules MCP Server 

A Model Context Protocol (MCP) server and VS Code extension that provides seamless integration with Hercules test automation framework. This project enables developers to write, trigger, and view Hercules test cases directly from VS Code.

## 🚀 Features

### MCP Server
- **Create Test Cases**: Register new Hercules test cases with Gherkin content
- **Run Tests**: Trigger Hercules test execution with AI-powered automation
- **View Results**: Access structured results including logs, screenshots, and reports
- **Resource Management**: Browse and manage test cases as MCP resources


## 📁 Project Structure

├── hercules-mcp-server/           # MCP Server implementation
│   ├── src/
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── hercules-client.ts  # Hercules integration client
│   │   ├── mcp-server.ts # MCP server implementation
│   │   └── index.ts      # Server entry point
│   ├── package.json      # Server dependencies
│   └── tsconfig.json     # TypeScript configuration




## 🛠️ Installation & Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **Hercules Framework** (installed in `../../testzeus-hercules`)

### Setup MCP Server

1. Navigate to the MCP server directory:
   ```bash
   git clone git@github.com:akshay619-dev/hercules-mcp-server.git
   cd hercules-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the server:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```


## 🔧 Configuration

### MCP Server Configuration

The MCP server can be configured by modifying the `HerculesClient` constructor in `hercules-mcp-server/src/hercules-client.ts`:

```typescript
constructor(herculesPath: string = '../your_path/testzeus-hercules') {
  this.herculesPath = herculesPath;
  // ...
}
```


## 🧪 Testing

### Test the MCP Server

1. Start the MCP server
2. Use an MCP client to test the tools:

```bash
# List available tools
curl -X POST http://localhost:3000/tools/list

# Create a test case
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "create_test_case",
    "arguments": {
      "name": "Test Login",
      "gherkinContent": "Feature: Login\nScenario: Login\nGiven I am on login page"
    }
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **MCP Server Connection Failed**
   - Ensure the Hercules framework is installed and accessible
   - Check that the server path is correct
   - Verify Python environment and dependencies


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Hercules Framework](https://github.com/test-zeus-ai/testzeus-hercules) - The underlying test automation framework
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [VS Code Extension API](https://code.visualstudio.com/api) - The extension development framework  