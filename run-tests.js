#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.cyan}${description}${colors.reset}`);
  log(`${colors.yellow}Running: ${command}${colors.reset}\n`);
  
  try {
    execSync(command, { stdio: 'inherit' });
    log(`\n${colors.green}✓ ${description} completed successfully${colors.reset}`);
  } catch (error) {
    log(`\n${colors.red}✗ ${description} failed${colors.reset}`);
    process.exit(1);
  }
}

function showHelp() {
  log(`${colors.bright}Web Application Test Suite Runner${colors.reset}\n`, 'cyan');
  
  log(`${colors.bright}Usage:${colors.reset}`, 'yellow');
  log('  node run-tests.js [command]\n');
  
  log(`${colors.bright}Commands:${colors.reset}`, 'yellow');
  log('  all              Run all tests');
  log('  ui               Run UI tests only');
  log('  api              Run API tests only');
  log('  auth             Run authentication tests only');
  log('  mobile           Run mobile navigation tests only');
  log('  design           Run design system tests only');
  log('  payment          Run payment gateway tests only');
  log('  docs             Run API documentation tests only');
  log('  headed           Run all tests in headed mode');
  log('  debug            Run tests in debug mode');
  log('  report           Show test report');
  log('  install          Install Playwright browsers');
  log('  help             Show this help message\n');
  
  log(`${colors.bright}Examples:${colors.reset}`, 'yellow');
  log('  node run-tests.js all');
  log('  node run-tests.js ui --headed');
  log('  node run-tests.js mobile --project="Mobile Chrome"');
}

function checkPlaywrightInstallation() {
  try {
    require('@playwright/test');
    return true;
  } catch (error) {
    log('Playwright is not installed. Please run: npm install', 'red');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  if (!checkPlaywrightInstallation()) {
    return;
  }
  
  const additionalArgs = args.slice(1).join(' ');
  
  switch (command) {
    case 'all':
      runCommand(`npx playwright test ${additionalArgs}`, 'Running all tests');
      break;
      
    case 'ui':
      runCommand(`npx playwright test cardsTags.spec.js ${additionalArgs}`, 'Running UI tests');
      break;
      
    case 'api':
      runCommand(`npx playwright test apiTests.spec.js ${additionalArgs}`, 'Running API tests');
      break;
      
    case 'auth':
      runCommand(`npx playwright test webAppSuite.spec.js --grep "User Authentication" ${additionalArgs}`, 'Running authentication tests');
      break;
      
    case 'mobile':
      runCommand(`npx playwright test webAppSuite.spec.js --grep "Navigation - Mobile Menu" ${additionalArgs}`, 'Running mobile navigation tests');
      break;
      
    case 'design':
      runCommand(`npx playwright test webAppSuite.spec.js --grep "Design System" ${additionalArgs}`, 'Running design system tests');
      break;
      
    case 'payment':
      runCommand(`npx playwright test webAppSuite.spec.js --grep "API Integration - Payment Gateway" ${additionalArgs}`, 'Running payment gateway tests');
      break;
      
    case 'docs':
      runCommand(`npx playwright test webAppSuite.spec.js --grep "Documentation - API Endpoints" ${additionalArgs}`, 'Running API documentation tests');
      break;
      
    case 'headed':
      runCommand(`npx playwright test --headed ${additionalArgs}`, 'Running all tests in headed mode');
      break;
      
    case 'debug':
      runCommand(`npx playwright test --debug ${additionalArgs}`, 'Running tests in debug mode');
      break;
      
    case 'report':
      runCommand('npx playwright show-report', 'Opening test report');
      break;
      
    case 'install':
      runCommand('npx playwright install', 'Installing Playwright browsers');
      break;
      
    default:
      log(`Unknown command: ${command}`, 'red');
      log('Run "node run-tests.js help" for available commands', 'yellow');
      process.exit(1);
  }
}

process.on('SIGINT', () => {
  log('\n\nTest execution interrupted by user', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\nTest execution terminated', 'yellow');
  process.exit(0);
});

main(); 