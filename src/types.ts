export interface HerculesTestResult {
  id: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  executionTime: number;
  costMetrics?: Record<string, any>;
  screenshots: string[];
  videos: string[];
  logs: string[];
  networkLogs: string[];
  junitXml: string;
  htmlReport: string;
  error?: string;
  timestamp: string;
  junitXmlUrl?: string;
  htmlReportUrl?: string;
}

export interface HerculesTestCase {
  id: string;
  name: string;
  gherkinContent: string;
  testDataPath?: string;
  outputPath?: string;
  llmModel?: string;
  llmApiKey?: string;
  status: 'draft' | 'ready' | 'running' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseRequest {
  name: string;
  gherkinContent: string;
  testDataPath?: string;
  outputPath?: string;
  llmModel?: string;
  llmApiKey?: string;
}

export interface RunTestCaseRequest {
  testCaseId: string;
  llmModel?: string;
  llmApiKey?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
} 