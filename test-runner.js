#!/usr/bin/env node

/**
 * Test runner script for the Solar System Visualization project
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests(testPattern = '', options = {}) {
  try {
    console.log('🚀 Running tests...\n');
    
    // Build the test command
    let command = 'npm test';
    
    if (testPattern) {
      command += ` -- ${testPattern}`;
    }
    
    if (options.ui) {
      command = 'npm run test:ui';
    }
    
    if (options.coverage) {
      command += ' -- --coverage';
    }
    
    if (options.watch) {
      command += ' -- --watch';
    }
    
    // Run the tests
    const { stdout, stderr } = await execAsync(command, {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    if (stderr) {
      console.error(stderr);
    }
    
    console.log('\n✅ Tests completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Tests failed!');
    console.error(error.message);
    return false;
  }
}

async function runLinting() {
  try {
    console.log('🔍 Running linting...\n');
    
    const { stdout, stderr } = await execAsync('npm run lint', {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    if (stderr) {
      console.error(stderr);
    }
    
    console.log('\n✅ Linting completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Linting failed!');
    console.error(error.message);
    return false;
  }
}

async function runFormattingCheck() {
  try {
    console.log('📝 Checking formatting...\n');
    
    const { stdout, stderr } = await execAsync('npm run format:check', {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    if (stderr) {
      console.error(stderr);
    }
    
    console.log('\n✅ Formatting check completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Formatting check failed!');
    console.error('Run "npm run format" to fix formatting issues.');
    return false;
  }
}

async function runAllChecks() {
  console.log('🔧 Running all checks (tests, linting, formatting)...\n');
  
  const results = {
    tests: await runTests('', { coverage: true }),
    linting: await runLinting(),
    formatting: await runFormattingCheck()
  };
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All checks passed!');
  } else {
    console.log('\n💥 Some checks failed!');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  testPattern: '',
  ui: false,
  coverage: false,
  watch: false,
  lint: false,
  format: false,
  all: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--ui') {
    options.ui = true;
  } else if (arg === '--coverage') {
    options.coverage = true;
  } else if (arg === '--watch') {
    options.watch = true;
  } else if (arg === '--lint') {
    options.lint = true;
  } else if (arg === '--format') {
    options.format = true;
  } else if (arg === '--all') {
    options.all = true;
  } else if (!arg.startsWith('--')) {
    options.testPattern = arg;
  }
}

// Run the appropriate checks
if (options.all) {
  runAllChecks();
} else if (options.lint) {
  runLinting();
} else if (options.format) {
  runFormattingCheck();
} else {
  runTests(options.testPattern, options);
}