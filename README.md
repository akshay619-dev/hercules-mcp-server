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
   npm run start:http
   ```


## 🧪 Testing and 📬 API Usage & Postman Collection

A Postman collection is provided to help you explore and test all available API endpoints of the Hercules MCP Server.

### Import the Collection

1. Open Postman.
2. Click **Import** and select `hercules-mcp-server.postman_collection.json` from the project root.
3. Set the base URL to `http://localhost:3000` (or your configured port).

### Available Endpoints

- `GET    /health` — Health check
- `GET    /tools` — List available tools
- `POST   /tools/create_test_case` — Create a new test case
- `POST   /tools/run_test_case` — Run a test case
- `GET    /tools/list_test_cases` — List all test cases
- `GET    /tools/get_test_case/:testCaseId` — Get details of a test case
- `GET    /tools/get_execution_results/:testCaseId` — Get execution results
- `GET    /resources` — List resources
- `GET    /resources/read?uri=hercules://test-case/<testCaseId>` — Read resource content
- `GET    /results/:testCaseId/:filename` — Download result files (e.g., reports)

### Example: Create a Test Case

```
POST /tools/create_test_case
Content-Type: application/json
{
  "name": "Sample Test Case",
  "gherkinContent": "Feature: Example\n  Scenario: Test\n    Given something\n    When something happens\n    Then expect something",
  "testDataPath": "optional/path/to/data.json",
  "llmModel": "gpt-4o",
  "llmApiKey": "your-api-key"
}
```

### Example: Run a Test Case

```
POST /tools/run_test_case
Content-Type: application/json
{
  "testCaseId": "<testCaseId>",
  "llmModel": "gpt-4o",
  "llmApiKey": "your-api-key"
}
```

### Example: Get Test Case Details

```
GET /tools/get_test_case/<testCaseId>
```

For more, see the imported Postman collection in your workspace



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