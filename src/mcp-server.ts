import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HerculesClient } from './hercules-client.js';
import { MCPTool, MCPResource } from './types.js';

export class HerculesMCPServer {
  private server: Server;
  private herculesClient: HerculesClient;

  constructor() {
    this.server = new Server(
      {
        name: 'hercules-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.herculesClient = new HerculesClient();

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_test_case',
            description: 'Create a new Hercules test case with Gherkin content',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the test case'
                },
                gherkinContent: {
                  type: 'string',
                  description: 'Gherkin feature file content'
                },
                testDataPath: {
                  type: 'string',
                  description: 'Optional path to test data file'
                },
                llmModel: {
                  type: 'string',
                  description: 'LLM model to use (default: gpt-4o)'
                },
                llmApiKey: {
                  type: 'string',
                  description: 'LLM API key'
                }
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
                testCaseId: {
                  type: 'string',
                  description: 'ID of the test case to run'
                },
                llmModel: {
                  type: 'string',
                  description: 'LLM model to use (overrides test case setting)'
                },
                llmApiKey: {
                  type: 'string',
                  description: 'LLM API key (overrides test case setting)'
                }
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
                testCaseId: {
                  type: 'string',
                  description: 'ID of the test case'
                }
              },
              required: ['testCaseId']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_test_case':
            if (!args || typeof args !== 'object') {
              throw new Error('Invalid arguments for create_test_case');
            }
            const testCase = await this.herculesClient.createTestCase({
              name: String(args.name || ''),
              gherkinContent: String(args.gherkinContent || ''),
              testDataPath: args.testDataPath ? String(args.testDataPath) : undefined,
              llmModel: args.llmModel ? String(args.llmModel) : undefined,
              llmApiKey: args.llmApiKey ? String(args.llmApiKey) : undefined
            });
            return {
              content: [
                {
                  type: 'text',
                  text: `Test case "${testCase.name}" created successfully with ID: ${testCase.id}`
                }
              ]
            };

          case 'run_test_case':
            if (!args || typeof args !== 'object') {
              throw new Error('Invalid arguments for run_test_case');
            }
            const result = await this.herculesClient.runTestCase(
              String(args.testCaseId || ''),
              args.llmModel ? String(args.llmModel) : undefined,
              args.llmApiKey ? String(args.llmApiKey) : undefined
            );
            return {
              content: [
                {
                  type: 'text',
                  text: `Test case execution completed with status: ${result.status}. Execution time: ${result.executionTime}ms`
                }
              ]
            };

          case 'list_test_cases':
            const testCases = await this.herculesClient.listTestCases();
            const testCaseList = testCases.map(tc => 
              `- ${tc.name} (ID: ${tc.id}, Status: ${tc.status})`
            ).join('\n');
            return {
              content: [
                {
                  type: 'text',
                  text: testCaseList || 'No test cases found'
                }
              ]
            };

          case 'get_test_case':
            if (!args || typeof args !== 'object') {
              throw new Error('Invalid arguments for get_test_case');
            }
            const testCaseDetails = await this.herculesClient.getTestCase(String(args.testCaseId || ''));
            if (!testCaseDetails) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `Test case with ID ${args.testCaseId} not found`
                  }
                ]
              };
            }
            return {
              content: [
                {
                  type: 'text',
                  text: `Test Case: ${testCaseDetails.name}\nID: ${testCaseDetails.id}\nStatus: ${testCaseDetails.status}\nCreated: ${testCaseDetails.createdAt}`
                }
              ]
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private setupResourceHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const testCases = await this.herculesClient.listTestCases();
      
      const resources: MCPResource[] = testCases.map(testCase => ({
        uri: `hercules://test-case/${testCase.id}`,
        name: testCase.name,
        description: `Hercules test case: ${testCase.name}`,
        mimeType: 'application/json'
      }));

      return { resources };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (typeof uri !== 'string') {
        throw new Error('Invalid URI parameter');
      }

      if (uri.startsWith('hercules://test-case/')) {
        const testCaseId = uri.replace('hercules://test-case/', '');
        const testCase = await this.herculesClient.getTestCase(testCaseId);
        
        if (!testCase) {
          throw new Error(`Test case not found: ${testCaseId}`);
        }

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(testCase, null, 2)
            }
          ]
        };
      }

      throw new Error(`Unknown resource URI: ${uri}`);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Hercules MCP Server started');
  }
} 