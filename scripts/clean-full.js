#!/usr/bin/env node

/**
 * 🔥 EduCard AI - Full Cache & Dependencies Cleaner
 * 
 * This script performs a complete cleanup including node_modules.
 * Use this when you want a completely fresh installation.
 * WARNING: This will require running `npm install` afterwards.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the regular cache cleaner
const { cleanCache } = require('./clean-cache.js');

// ANSI color codes for terminal output
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

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function deleteDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        return true;
      }
    }
    return false;
  } catch (error) {
    logError(`Failed to delete ${dirPath}: ${error.message}`);
    return false;
  }
}

function getDirectorySize(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }
    
    return size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function executeCommand(command, description) {
  try {
    logStep('CMD', `${description}...`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    logSuccess(`${description} completed`);
    return true;
  } catch (error) {
    logWarning(`${description} failed: ${error.message}`);
    return false;
  }
}

async function fullCleanup() {
  log(`${colors.red}${colors.bright}
🔥 EduCard AI Full Cleanup
==========================
⚠️  WARNING: This will delete node_modules!
    You'll need to run 'npm install' after this.
${colors.reset}`);

  // Confirmation prompt
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question(`${colors.yellow}Continue with full cleanup? (y/N): ${colors.reset}`, resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    log(`${colors.blue}Cleanup cancelled. Use 'npm run clean' for regular cache cleanup.${colors.reset}`);
    return;
  }

  const startTime = Date.now();
  let totalFreed = 0;

  // Calculate initial sizes
  const nodeModulesSize = getDirectorySize('node_modules');
  const packageLockSize = fs.existsSync('package-lock.json') ? fs.statSync('package-lock.json').size : 0;

  log(`\n${colors.magenta}🚀 Starting full cleanup...${colors.reset}\n`);

  // Step 1: Run regular cache cleanup first
  logStep('STEP1', 'Running regular cache cleanup...');
  try {
    await cleanCache();
  } catch (error) {
    logWarning('Cache cleanup had issues, continuing...');
  }

  // Step 2: Remove node_modules
  logStep('STEP2', 'Removing node_modules...');
  log(`       ${colors.blue}This may take a while for large projects${colors.reset}`);
  
  if (nodeModulesSize > 0) {
    const success = deleteDirectory('node_modules');
    if (success) {
      totalFreed += nodeModulesSize;
      logSuccess(`node_modules removed (${formatBytes(nodeModulesSize)} freed)`);
    }
  } else {
    log(`       ${colors.yellow}node_modules not found${colors.reset}`);
  }

  // Step 3: Remove package-lock.json (optional, for clean dependency resolution)
  logStep('STEP3', 'Removing package-lock.json...');
  log(`       ${colors.blue}For fresh dependency resolution${colors.reset}`);
  
  if (packageLockSize > 0) {
    try {
      fs.unlinkSync('package-lock.json');
      totalFreed += packageLockSize;
      logSuccess(`package-lock.json removed (${formatBytes(packageLockSize)} freed)`);
    } catch (error) {
      logWarning('Could not remove package-lock.json');
    }
  } else {
    log(`       ${colors.yellow}package-lock.json not found${colors.reset}`);
  }

  // Step 4: Clear global npm cache
  logStep('STEP4', 'Clearing global npm cache...');
  executeCommand('npm cache clean --force', 'Global npm cache clean');

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(`\n${colors.green}${colors.bright}
🎉 Full Cleanup Complete!
==========================${colors.reset}`);
  log(`${colors.green}⏱️  Duration: ${duration}s${colors.reset}`);
  log(`${colors.green}💾 Total space freed: ${formatBytes(totalFreed)}${colors.reset}`);

  // Next steps
  log(`\n${colors.cyan}📋 Required Next Steps:${colors.reset}`);
  log(`${colors.yellow}   1. npm install${colors.reset}                # Reinstall dependencies`);
  log(`${colors.blue}   2. npm run dev${colors.reset}                 # Start development server`);
  
  log(`\n${colors.magenta}🔧 Optional (if issues persist):${colors.reset}`);
  log(`   3. npm update                    # Update to latest compatible versions`);
  log(`   4. npm audit fix                 # Fix security vulnerabilities`);
  
  log(`\n${colors.green}✨ Your project is now completely reset!${colors.reset}`);
}

// Run the full cleanup
if (require.main === module) {
  fullCleanup().catch(error => {
    logError(`Full cleanup failed: ${error.message}`);
    process.exit(1);
  });
} 