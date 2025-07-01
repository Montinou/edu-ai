# 🧹 EduCard AI - Cache Cleanup Guide

## Overview

This guide explains the cache cleaning system for the EduCard AI project. The system provides automated scripts to clean various development caches and ensure optimal performance.

## 🎯 Why Clean Cache?

Cleaning caches helps with:
- **Build Issues**: Resolves stale compilation artifacts
- **Performance**: Frees up disk space and improves build times
- **Dependencies**: Ensures fresh package installations
- **Development**: Eliminates cached state conflicts

## 📋 Available Commands

### Regular Cache Cleanup
```bash
npm run clean
# or
npm run clean:cache
```

**What it cleans:**
- ✅ Next.js build cache (`.next/`)
- ✅ TypeScript build info (`tsconfig.tsbuildinfo`)
- ✅ Local npm cache (`E/npm-cache/`)
- ✅ Vercel deployment cache (`.vercel/`)
- ✅ Global npm cache

**Safe to use:** ✅ No dependency reinstallation needed

### Full Cleanup (Nuclear Option)
```bash
npm run clean:full
```

**What it cleans:**
- ✅ Everything from regular cleanup
- ⚠️ Node modules (`node_modules/`)
- ⚠️ Package lock file (`package-lock.json`)

**Requires:** `npm install` after completion

## 🔧 When to Use Each Command

### Use `npm run clean` when:
- Experiencing build errors
- Next.js hot reload issues
- TypeScript compilation problems
- General development hiccups
- Before deploying to production

### Use `npm run clean:full` when:
- Dependency conflicts persist
- Major package version updates
- Corrupted node_modules
- Starting completely fresh
- Troubleshooting complex issues

## 🚀 Example Workflows

### Quick Development Reset
```bash
# Clean caches and restart
npm run clean
npm run dev
```

### Complete Project Reset
```bash
# Full cleanup (with confirmation prompt)
npm run clean:full
# Reinstall dependencies
npm install
# Start development
npm run dev
```

### Pre-deployment Cleanup
```bash
# Clean caches before building
npm run clean
npm run build
```

## 📊 What Gets Cleaned

| Cache Type | Regular Clean | Full Clean | Size Impact |
|------------|---------------|------------|-------------|
| Next.js Build | ✅ | ✅ | ~10-100MB |
| TypeScript Info | ✅ | ✅ | ~100-500KB |
| npm Cache | ✅ | ✅ | ~50-200MB |
| Node Modules | ❌ | ✅ | ~200-500MB |
| Package Lock | ❌ | ✅ | ~10-50KB |

## 🛠️ Technical Details

### Script Locations
- `scripts/clean-cache.js` - Regular cache cleaner
- `scripts/clean-full.js` - Full cleanup with confirmation

### Features
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Size reporting**: Shows space freed after cleanup
- **Error handling**: Graceful failure with useful messages
- **Progress tracking**: Color-coded status updates
- **Safety checks**: Confirmation prompts for destructive operations

### Windows-Specific Optimizations
- Multiple deletion strategies for stubborn directories
- Command-line fallbacks for locked files
- Manual recursive deletion as last resort

## 🔍 Troubleshooting

### "Directory not empty" errors
- Some files may be locked by running processes
- Stop development server (`Ctrl+C`) before cleaning
- Close VS Code or other editors temporarily

### Permission errors
- Run terminal as administrator on Windows
- Check file permissions on Unix systems
- Ensure no processes are using the files

### Cache cleaning fails
- Try closing all applications using the project
- Restart your computer if issues persist
- Use `clean:full` for stubborn problems

## 📝 Adding Custom Cache Locations

To add new cache directories to clean, edit `scripts/clean-cache.js`:

```javascript
const cachesToClean = [
  // ... existing caches
  {
    name: 'Your Custom Cache',
    path: 'path/to/cache',
    type: 'directory',
    description: 'Description of what this cache contains'
  }
];
```

## 🎉 Best Practices

1. **Regular Cleaning**: Run `npm run clean` weekly or when issues arise
2. **Before Updates**: Clean before major dependency updates
3. **Production Builds**: Always clean before building for production
4. **Team Sync**: Clean when switching between major feature branches
5. **Size Monitoring**: Check freed space to monitor project health

## 🚨 Safety Notes

- **Full cleanup requires reinstallation** - Budget time for `npm install`
- **Backup important changes** before major cleanups
- **Close editors and servers** before running scripts
- **Check disk space** before and after cleaning

---

*Last updated: January 2025*
*EduCard AI Development Team* 