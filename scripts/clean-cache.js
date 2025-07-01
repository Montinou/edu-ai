#!/usr/bin/env node

/**
 * 🧹 EduCard AI - Cache Cleaning Script
 * 
 * This script cleans all development caches to ensure a fresh start.
 * Useful when experiencing build issues, outdated dependencies, or general cleanup.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
        // Windows-specific: Try multiple approaches
        try {
          // First attempt: Standard recursive delete
          fs.rmSync(dirPath, { recursive: true, force: true });
          return true;
        } catch (firstError) {
          // Second attempt: Use command line for stubborn directories
          try {
            if (process.platform === 'win32') {
              execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'pipe' });
            } else {
              execSync(`rm -rf "${dirPath}"`, { stdio: 'pipe' });
            }
            return true;
          } catch (secondError) {
            // Third attempt: Manual recursive deletion
            try {
              const deleteRecursive = (currentPath) => {
                if (fs.existsSync(currentPath)) {
                  const files = fs.readdirSync(currentPath);
                  files.forEach(file => {
                    const filePath = path.join(currentPath, file);
                    const fileStat = fs.statSync(filePath);
                    if (fileStat.isDirectory()) {
                      deleteRecursive(filePath);
                    } else {
                      fs.unlinkSync(filePath);
                    }
                  });
                  fs.rmdirSync(currentPath);
                }
              };
              deleteRecursive(dirPath);
              return true;
            } catch (thirdError) {
              logWarning(`Could not fully delete ${dirPath}. Some files may be in use.`);
              return false;
            }
          }
        }
      }
    }
    return false;
  } catch (error) {
    logError(`Failed to delete ${dirPath}: ${error.message}`);
    return false;
  }
}

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    logError(`Failed to delete ${filePath}: ${error.message}`);
    return false;
  }
}

function executeCommand(command, description) {
  try {
    logStep('CMD', `${description}...`);
    execSync(command, { stdio: 'pipe', cwd: process.cwd() });
    logSuccess(`${description} completed`);
    return true;
  } catch (error) {
    logWarning(`${description} failed: ${error.message}`);
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

async function cleanCache() {
  log(`${colors.magenta}${colors.bright}
🧹 EduCard AI Cache Cleaner
============================${colors.reset}
`);

  const startTime = Date.now();
  let totalFreed = 0;

  // Calculate initial sizes
  const initialSizes = {
    nextjs: getDirectorySize('.next'),
    nodeModules: getDirectorySize('node_modules'),
    npmCache: getDirectorySize('E/npm-cache') + getDirectorySize(path.join(process.env.APPDATA || '', 'npm-cache')),
    tsBuild: fs.existsSync('tsconfig.tsbuildinfo') ? fs.statSync('tsconfig.tsbuildinfo').size : 0
  };

  // Define cache directories and files to clean
  const cachesToClean = [
    {
      name: 'Next.js Build Cache',
      path: '.next',
      type: 'directory',
      description: 'Next.js compiled pages, static assets, and build cache'
    },
    {
      name: 'TypeScript Build Info',
      path: 'tsconfig.tsbuildinfo',
      type: 'file',
      description: 'TypeScript incremental compilation info'
    },
    {
      name: 'Local npm Cache',
      path: 'E/npm-cache',
      type: 'directory',
      description: 'Project-specific npm cache directory'
    },
    {
      name: 'Vercel Cache',
      path: '.vercel',
      type: 'directory',
      description: 'Vercel deployment cache and configuration'
    }
  ];

  // Clean each cache
  for (const cache of cachesToClean) {
    logStep('CLEAN', `Cleaning ${cache.name}...`);
    log(`       ${colors.blue}${cache.description}${colors.reset}`);
    
    const sizeBefore = cache.type === 'directory' ? getDirectorySize(cache.path) : 
                      (fs.existsSync(cache.path) ? fs.statSync(cache.path).size : 0);
    
    let success = false;
    if (cache.type === 'directory') {
      success = deleteDirectory(cache.path);
    } else {
      success = deleteFile(cache.path);
    }
    
    if (success && sizeBefore > 0) {
      totalFreed += sizeBefore;
      logSuccess(`${cache.name} cleared (${formatBytes(sizeBefore)} freed)`);
    } else if (sizeBefore === 0) {
      log(`       ${colors.yellow}Already clean${colors.reset}`);
    }
  }

  // Clean npm cache
  logStep('NPM', 'Cleaning npm cache...');
  executeCommand('npm cache clean --force', 'npm cache clean');

  // Optional: Clean node_modules (commented out for safety)
  log(`\n${colors.yellow}💡 Optional cleanup:${colors.reset}`);
  log(`   To also clean node_modules (requires reinstall): npm run clean:full`);

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(`\n${colors.green}${colors.bright}
🎉 Cache Cleaning Complete!
============================${colors.reset}`);
  log(`${colors.green}⏱️  Duration: ${duration}s${colors.reset}`);
  log(`${colors.green}💾 Space freed: ${formatBytes(totalFreed)}${colors.reset}`);
  
  if (totalFreed > 0) {
    log(`\n${colors.cyan}📊 Before/After Sizes:${colors.reset}`);
    log(`   Next.js: ${formatBytes(initialSizes.nextjs)} → 0 KB`);
    if (initialSizes.tsBuild > 0) {
      log(`   TypeScript: ${formatBytes(initialSizes.tsBuild)} → 0 KB`);
    }
  }

  log(`\n${colors.blue}🚀 Next steps:${colors.reset}`);
  log(`   1. Run: npm run dev`);
  log(`   2. Your app will rebuild fresh caches`);
  log(`   3. Enjoy improved performance! ✨`);
}

// Run the cache cleaner
if (require.main === module) {
  cleanCache().catch(error => {
    logError(`Cache cleaning failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { cleanCache }; 