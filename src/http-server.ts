import express from 'express';
import cors from 'cors';
import { HerculesClient } from './hercules-client.js';
import { CreateTestCaseRequest, RunTestCaseRequest } from './types.js';

export class HerculesHTTPServer {
  private app: express.Application;
  private herculesClient: HerculesClient;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.herculesClient = new HerculesClient();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // List available tools
    this.app.get('/tools', (req, res) => {
      res.json({
        tools: [
          {
            name: 'create_test_case',
            description: 'Create a new Hercules test case with Gherkin content',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Name of the test case' },
                gherkinContent: { type: 'string', description: 'Gherkin feature file content' },
                testDataPath: { type: 'string', description: 'Optional path to test data file' },
                llmModel: { type: 'string', description: 'LLM model to use (default: gpt-4o)' },
                llmApiKey: { type: 'string', description: 'LLM API key' }
              },
              required: ['name', 'gherkinContent']
            }
          },
          {
            name: 'run_test_case',
            description: 'Run a Hercules test case and get results',
            inputSchema: {
              type: 'object',
              properties: {
                testCaseId: { type: 'string', description: 'ID of the test case to run' },
                llmModel: { type: 'string', description: 'LLM model to use (overrides test case setting)' },
                llmApiKey: { type: 'string', description: 'LLM API key (overrides test case setting)' }
              },
              required: ['testCaseId']
            }
          },
          {
            name: 'list_test_cases',
            description: 'List all available test cases',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'get_test_case',
            description: 'Get details of a specific test case',
            inputSchema: {
              type: 'object',
              properties: {
                testCaseId: { type: 'string', description: 'ID of the test case' }
              },
              required: ['testCaseId']
            }
          }
        ]
      });
    });

    // Create test case
    this.app.post('/tools/create_test_case', async (req, res) => {
      try {
        const request: CreateTestCaseRequest = req.body;
        
        if (!request.name || !request.gherkinContent) {
          return res.status(400).json({
            error: 'Missing required fields: name and gherkinContent'
          });
        }

        const testCase = await this.herculesClient.createTestCase(request);
        res.json({
          success: true,
          testCase,
          message: `Test case "${testCase.name}" created successfully with ID: ${testCase.id}`
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    });

    // Run test case
    this.app.post('/tools/run_test_case', async (req, res) => {
      try {
        const request: RunTestCaseRequest = req.body;
        
        if (!request.testCaseId) {
          return res.status(400).json({
            error: 'Missing required field: testCaseId'
          });
        }

        const result = await this.herculesClient.runTestCase(
          request.testCaseId,
          request.llmModel,
          request.llmApiKey
        );

        res.json({
          success: true,
          result,
          message: `Test case execution completed with status: ${result.status}. Execution time: ${result.executionTime}ms`
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    });

    // List test cases
    this.app.get('/tools/list_test_cases', async (req, res) => {
      try {
        const testCases = await this.herculesClient.listTestCases();
        const testCaseList = testCases.map(tc => 
          `- ${tc.name} (ID: ${tc.id}, Status: ${tc.status})`
        ).join('\n');

        res.json({
          success: true,
          testCases,
          testCaseList: testCaseList || 'No test cases found'
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    });

    // Get test case details
    this.app.get('/tools/get_test_case/:testCaseId', async (req, res) => {
      try {
        const { testCaseId } = req.params;
        const testCase = await this.herculesClient.getTestCase(testCaseId);
        
        if (!testCase) {
          return res.status(404).json({
            error: `Test case with ID ${testCaseId} not found`,
            success: false
          });
        }

        res.json({
          success: true,
          testCase
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    });

    // Get execution results
    this.app.get('/tools/get_execution_results/:testCaseId', async (req, res) => {
      try {
        const { testCaseId } = req.params;
        const executionResult = await this.herculesClient.getExecutionResults(testCaseId);
        
        if (!executionResult) {
          return res.status(404).json({
            error: `Execution results for test case ${testCaseId} not found`,
            success: false
          });
        }

        res.json({
          success: true,
          result: executionResult
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    });

    // List resources
    this.app.get('/resources', async (req, res) => {
      try {
        const testCases = await this.herculesClient.listTestCases();
        const resources = testCases.map(testCase => ({
          uri: `hercules://test-case/${testCase.id}`,
          name: testCase.name,
          description: `Hercules test case: ${testCase.name}`,
          mimeType: 'application/json'
        }));

        res.json({
          success: true,
          resources
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    });

    // Read resource
    this.app.get('/resources/read', async (req, res) => {
      try {
        const { uri } = req.query;
        
        if (!uri || typeof uri !== 'string') {
          return res.status(400).json({
            error: 'Missing or invalid uri parameter',
            success: false
          });
        }

        if (uri.startsWith('hercules://test-case/')) {
          const testCaseId = uri.replace('hercules://test-case/', '');
          const testCase = await this.herculesClient.getTestCase(testCaseId);
          
          if (!testCase) {
            return res.status(404).json({
              error: `Test case not found: ${testCaseId}`,
              success: false
            });
          }

          res.json({
            success: true,
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(testCase, null, 2)
              }
            ]
          });
        } else {
          res.status(400).json({
            error: `Unknown resource URI: ${uri}`,
            success: false
          });
        }
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`Hercules HTTP Server running on port ${this.port}`);
        console.log(`Health check: http://localhost:${this.port}/health`);
        console.log(`Tools: http://localhost:${this.port}/tools`);
        console.log(`Resources: http://localhost:${this.port}/resources`);
        resolve();
      });
    });
  }
} 