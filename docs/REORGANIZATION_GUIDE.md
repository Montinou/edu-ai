# Documentation Reorganization Guide

This guide will help you manually reorganize the documentation files into the new folder structure.

## Directory Structure

First, make sure you have the following directory structure in your `docs` folder:

```
docs/
├── architecture/
├── api/
├── deployment/
├── features/
├── game-systems/
├── getting-started/
├── vercel-ai/
└── mindcraft/
```

If any of these directories are missing, create them.

## File Organization Plan

Move the following files to their respective directories:

### architecture/
- DATABASE_SCHEMA.md
- DATABASE_STATUS_REPORT.md
- DATABASE_SUCCESS_GUIDE.md (can be deleted if empty)
- auth-database-requirements.md
- STORAGE_SETUP.md
- TECHNICAL_SPECS.md
- WIREFRAMES.md

### api/
- API.md
- API_CARDS_USAGE.md

### deployment/
- DEPLOYMENT.md
- DEPLOYMENT_STATUS.md
- DEVELOPMENT.md
- CACHE_CLEANUP_GUIDE.md

### features/
- CARD_DISPLAY_GUIDE.md
- CARD_GENERATION_GUIDE.md
- CARD_PROMT.md
- CARD_REVOLUTION_IMPLEMENTATION.md
- CARD_FRAME_SYSTEM.md
- DYNAMIC_CARD_GENERATION.md
- DYNAMIC_CARDS_REVOLUTION.md
- ImageGenTechDoc.md
- PROBLEM_TYPES_SYSTEM.md
- USER_COLLECTION_SYSTEM.md

### game-systems/
- BATTLE_2D_SYSTEM.md

### getting-started/
- SETUP_GUIDE.md

### vercel-ai/
- Vercel-AI-Executive-Summary.md
- Vercel-AI-Migration-Addendum.md
- Vercel-AI-SDK-Integration-Guide.md

### mindcraft/
- mindcraft_visual_guide.html
- mindcraft_mvp_landing.html

### Legacy Documents (Optional: Create a "legacy" folder for these)
- StartingIdea.md
- StartingIdeaTech.md

## Moving Files in Windows

You can move these files manually in Windows Explorer by:
1. Opening two Explorer windows side by side
2. In one window, navigate to `E:\Projects\IAEducation\docs`
3. In the other window, navigate to the target subdirectory (e.g., `E:\Projects\IAEducation\docs\architecture`)
4. Drag and drop the files from the main docs folder to the appropriate subfolders

## PowerShell Commands

Alternatively, you can use PowerShell commands to move the files. Here are example commands for each directory:

```powershell
# Architecture files
Move-Item E:\Projects\IAEducation\docs\DATABASE_*.md E:\Projects\IAEducation\docs\architecture\
Move-Item E:\Projects\IAEducation\docs\auth-database-requirements.md E:\Projects\IAEducation\docs\architecture\
Move-Item E:\Projects\IAEducation\docs\STORAGE_SETUP.md E:\Projects\IAEducation\docs\architecture\
Move-Item E:\Projects\IAEducation\docs\TECHNICAL_SPECS.md E:\Projects\IAEducation\docs\architecture\
Move-Item E:\Projects\IAEducation\docs\WIREFRAMES.md E:\Projects\IAEducation\docs\architecture\

# API files
Move-Item E:\Projects\IAEducation\docs\API.md E:\Projects\IAEducation\docs\api\
Move-Item E:\Projects\IAEducation\docs\API_CARDS_USAGE.md E:\Projects\IAEducation\docs\api\

# Deployment files
Move-Item E:\Projects\IAEducation\docs\DEPLOYMENT.md E:\Projects\IAEducation\docs\deployment\
Move-Item E:\Projects\IAEducation\docs\DEPLOYMENT_STATUS.md E:\Projects\IAEducation\docs\deployment\
Move-Item E:\Projects\IAEducation\docs\DEVELOPMENT.md E:\Projects\IAEducation\docs\deployment\
Move-Item E:\Projects\IAEducation\docs\CACHE_CLEANUP_GUIDE.md E:\Projects\IAEducation\docs\deployment\

# Features files
Move-Item E:\Projects\IAEducation\docs\CARD_*.md E:\Projects\IAEducation\docs\features\
Move-Item E:\Projects\IAEducation\docs\DYNAMIC_*.md E:\Projects\IAEducation\docs\features\
Move-Item E:\Projects\IAEducation\docs\USER_COLLECTION_SYSTEM.md E:\Projects\IAEducation\docs\features\
Move-Item E:\Projects\IAEducation\docs\PROBLEM_TYPES_SYSTEM.md E:\Projects\IAEducation\docs\features\
Move-Item E:\Projects\IAEducation\docs\ImageGenTechDoc.md E:\Projects\IAEducation\docs\features\

# Game systems files
Move-Item E:\Projects\IAEducation\docs\BATTLE_2D_SYSTEM.md E:\Projects\IAEducation\docs\game-systems\

# Getting started files
Move-Item E:\Projects\IAEducation\docs\SETUP_GUIDE.md E:\Projects\IAEducation\docs\getting-started\

# Vercel AI files
Move-Item E:\Projects\IAEducation\docs\Vercel-AI-*.md E:\Projects\IAEducation\docs\vercel-ai\

# Mindcraft files
Move-Item E:\Projects\IAEducation\docs\mindcraft_*.html E:\Projects\IAEducation\docs\mindcraft\
```

Execute each command separately to avoid any issues.

## After Reorganization

After reorganizing the files, verify that all files have been moved to their appropriate locations, and update any cross-references in the documentation files if needed.

## Cleaning Up

Once you've verified everything is working correctly, you may want to:

1. Delete empty or obsolete files like DATABASE_SUCCESS_GUIDE.md if it's empty
2. Consider creating a "legacy" folder for StartingIdea.md and StartingIdeaTech.md if you want to keep them for reference

The updated README.md file reflects this new organization structure and includes information about the upcoming Vercel AI SDK migration. 