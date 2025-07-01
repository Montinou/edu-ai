# EduCard AI - Documentation

## Overview

Welcome to the EduCard AI documentation. This repository contains comprehensive documentation for the EduCard AI platform, an educational card game system that helps children learn math and AI concepts through interactive gameplay.

## Documentation Structure

The documentation is organized into the following sections:

```
docs/
├── architecture/            # System architecture and database information
│   ├── DATABASE_SCHEMA.md
│   ├── DATABASE_STATUS_REPORT.md
│   ├── auth-database-requirements.md
│   ├── STORAGE_SETUP.md
│   ├── TECHNICAL_SPECS.md
│   └── WIREFRAMES.md
│
├── api/                     # API documentation and usage
│   ├── API.md
│   └── API_CARDS_USAGE.md
│
├── deployment/              # Deployment and development guides
│   ├── DEPLOYMENT.md
│   ├── DEPLOYMENT_STATUS.md
│   ├── DEVELOPMENT.md
│   └── CACHE_CLEANUP_GUIDE.md
│
├── features/                # Feature-specific documentation
│   ├── CARD_DISPLAY_GUIDE.md
│   ├── CARD_GENERATION_GUIDE.md
│   ├── CARD_FRAME_SYSTEM.md
│   ├── CARD_REVOLUTION_IMPLEMENTATION.md
│   ├── DYNAMIC_CARD_GENERATION.md
│   ├── DYNAMIC_CARDS_REVOLUTION.md
│   ├── ImageGenTechDoc.md
│   ├── PROBLEM_TYPES_SYSTEM.md
│   └── USER_COLLECTION_SYSTEM.md
│
├── game-systems/            # Game mechanics documentation
│   └── BATTLE_2D_SYSTEM.md
│
├── getting-started/         # Setup and onboarding guides
│   └── SETUP_GUIDE.md
│
├── vercel-ai/               # Vercel AI SDK integration
│   ├── Vercel-AI-Executive-Summary.md
│   ├── Vercel-AI-Migration-Addendum.md
│   └── Vercel-AI-SDK-Integration-Guide.md
│
└── mindcraft/               # MindCraft module documentation
    ├── mindcraft_visual_guide.html
    └── mindcraft_mvp_landing.html
```

## Key Documentation

- **[Getting Started](./getting-started/SETUP_GUIDE.md)**: Setup instructions for developers
- **[Architecture](./architecture/TECHNICAL_SPECS.md)**: System design and architecture
- **[API Documentation](./api/API.md)**: API endpoints and usage
- **[Deployment](./deployment/DEPLOYMENT.md)**: Deployment procedures

## Vercel AI SDK Migration

We are in the process of migrating to the Vercel AI SDK for a more unified AI implementation. Key resources:

- **[Executive Summary](./vercel-ai/Vercel-AI-Executive-Summary.md)**: Business case for migration
- **[Migration Guide](./vercel-ai/Vercel-AI-Migration-Addendum.md)**: Technical migration plan
- **[Integration Guide](./vercel-ai/Vercel-AI-SDK-Integration-Guide.md)**: Detailed implementation steps

## Outdated Documentation

The following documents are being phased out but are kept for reference:
- StartingIdea.md
- StartingIdeaTech.md
- DATABASE_SUCCESS_GUIDE.md (empty file to be removed)

## Contributing to Documentation

When adding or updating documentation:

1. Use Markdown for all documentation except when HTML is specifically needed
2. Place documentation in the appropriate category folder
3. Update this README if adding new major sections
4. Follow the naming convention of existing files

## Development Roadmap

For the project roadmap and feature development status, please refer to the main [README.md](../README.md) in the project root. 