import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export interface ServerConfig {
  port: number;
  host: string;
  herculesPath: string;
  testCasesDir: string;
  resultsDir: string;
  defaultLlmModel: string;
  defaultLlmApiKey?: string;
  logLevel: string;
  enableDebugLogging: boolean;
  testExecutionTimeout: number;
  healthCheckTimeout: number;
}

export function loadConfig(): ServerConfig {
  // Validate required environment variables
  const herculesPath = process.env.HERCULES_PATH;
  if (!herculesPath) {
    throw new Error('HERCULES_PATH environment variable is required. Please set it in your .env file.');
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    herculesPath: herculesPath,
    testCasesDir: process.env.TEST_CASES_DIR || 'test-cases',
    resultsDir: process.env.RESULTS_DIR || 'results',
    defaultLlmModel: process.env.DEFAULT_LLM_MODEL || 'gpt-4o',
    defaultLlmApiKey: process.env.DEFAULT_LLM_API_KEY,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableDebugLogging: process.env.ENABLE_DEBUG_LOGGING === 'true',
    testExecutionTimeout: parseInt(process.env.TEST_EXECUTION_TIMEOUT || '60000', 10),
    healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10)
  };
}

export function validateConfig(config: ServerConfig): void {
  const errors: string[] = [];

  // Check if Hercules path exists
  try {
    const fs = require('fs');
    if (!fs.existsSync(config.herculesPath)) {
      errors.push(`Hercules path does not exist: ${config.herculesPath}`);
    }
    
    // Check if virtual environment exists
    const venvPath = path.join(config.herculesPath, 'venv', 'bin', 'python');
    if (!fs.existsSync(venvPath)) {
      errors.push(`Virtual environment not found at: ${venvPath}`);
    }
  } catch (error) {
    errors.push(`Error checking Hercules path: ${error}`);
  }

  // Validate port
  if (config.port < 1 || config.port > 65535) {
    errors.push(`Invalid port number: ${config.port}`);
  }

  // Validate timeouts
  if (config.testExecutionTimeout < 1000) {
    errors.push(`Test execution timeout too low: ${config.testExecutionTimeout}ms`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Export a singleton config instance
export const config = loadConfig();

// Validate on load
try {
  validateConfig(config);
  console.log('✅ Configuration loaded successfully');
  console.log(`📁 Hercules Path: ${config.herculesPath}`);
  console.log(`🌐 Server: ${config.host}:${config.port}`);
  console.log(`📊 Log Level: ${config.logLevel}`);
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  process.exit(1);
} 