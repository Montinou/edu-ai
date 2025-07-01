# EduCard AI - Database Setup Scripts Execution Order

**🔍 ESTADO ACTUAL VERIFICADO** (Última verificación: enero 2024)

✅ **BASE DE DATOS MAYORMENTE CONFIGURADA**
- ✅ Todas las tablas existen (13/13)
- ⚠️ **CRÍTICO**: `cards_problem_types` vacía (0 tipos) - **Bloquea funcionalidad dinámica**  
- ⚠️ Cartas existentes (7) en estructura legacy - **Necesita migración**
- 🚨 **ERRORES DE LINTER DETECTADOS**: 3 vistas con SECURITY DEFINER (vulnerabilidad)

**🚨 SCRIPTS CRÍTICOS A EJECUTAR INMEDIATAMENTE:**

1. **`fix-security-definer-views.sql`** - Corregir errores del linter de Supabase
2. **`setup-dynamic-cards-database.sql`** - Poblar tipos de problemas  
3. **`migrate-to-dynamic-cards.sql`** - Migrar cartas a estructura dinámica
4. **`fix-security-issues.sql`** - Configurar seguridad completa

**📊 Ver reporte detallado**: [DATABASE_STATUS_REPORT.md](./DATABASE_STATUS_REPORT.md)

---

This README provides the correct order to execute all SQL scripts for the EduCard AI platform. Follow this order to avoid dependency issues and ensure proper database setup.

## ⚠️ Important Notes

- **Always backup your database** before running these scripts
- Run these scripts in **Supabase SQL Editor** with the **service role key**
- Some scripts are optional depending on your setup phase
- Scripts marked with `[CONDITIONAL]` should only be run if needed

## 📋 Execution Order

### 🚨 Phase 0: IMMEDIATE SECURITY FIX
Execute this script first if you have security linter errors:

0. **`fix-security-definer-views.sql`** 🚨 **IMMEDIATE**
   - Fixes 3 specific Supabase linter errors about SECURITY DEFINER views
   - Recreates analytics_learning_progress, cards_with_problem_info, analytics_user_performance
   - **Purpose**: Eliminate critical security vulnerabilities
   - **Dependencies**: Views must exist (they do in current DB)

### Phase 1: Base Database Setup
Execute these scripts first to create the foundational structure:

1. **`complete-database-setup.sql`** ✅ **REQUIRED**
   - Creates all base tables (users, cards, achievements, etc.)
   - Sets up indexes and basic structure
   - **Purpose**: Foundation of the entire system
   - **Dependencies**: None (clean start)
   - **CURRENT STATUS**: ✅ Already executed

2. **`database-migration.sql`** 🔄 **ALTERNATIVE TO #1**
   - Alternative complete setup script
   - **Use this INSTEAD of #1 if you prefer the alternative structure**
   - **Purpose**: Alternative foundation setup
   - **Dependencies**: None (clean start)

### Phase 2: Dynamic Cards System
Execute these scripts to upgrade to the dynamic cards system:

3. **`setup-dynamic-cards-database.sql`** ✅ **REQUIRED**
   - Adds dynamic columns to existing cards table
   - Creates cards_problem_types table with 21 problem types
   - Sets up synchronization functions and triggers
   - **Purpose**: Upgrades cards system to dynamic generation
   - **Dependencies**: Requires cards table from Phase 1
   - **CURRENT STATUS**: ⚠️ Partially executed - cards_problem_types table empty

4. **`create-cards-problem-types.sql`** 🔄 **ALTERNATIVE TO #3**
   - Alternative way to create problem types table
   - **Use this INSTEAD of #3 if the above fails**
   - **Purpose**: Alternative problem types setup
   - **Dependencies**: Requires cards table from Phase 1

### Phase 3: Data Migration and Transformations
Execute these scripts to migrate existing data to new format:

5. **`migrate-to-dynamic-cards.sql`** ✅ **RECOMMENDED**
   - Migrates existing cards to new dynamic format
   - Creates backup tables
   - Updates card names, descriptions, and properties
   - Creates learning profile and battle session tables
   - **Purpose**: Transform static cards to dynamic system
   - **Dependencies**: Requires Phase 2 completion
   - **CURRENT STATUS**: ❌ Not executed - cards still in legacy format

6. **`update-type-to-spanish.sql`** 🌐 **OPTIONAL**
   - Updates problem type names to Spanish
   - **Purpose**: Localization support
   - **Dependencies**: Requires cards_problem_types table

### Phase 4: Security Configuration
Execute these scripts to properly configure Row Level Security:

7. **`fix-security-issues.sql`** 🔒 **REQUIRED**
   - Enables RLS on all tables
   - Creates proper security policies
   - Fixes SECURITY DEFINER issues (includes cards_with_problem_info)
   - **Purpose**: Secure the database properly
   - **Dependencies**: Requires all tables created
   - **CURRENT STATUS**: ❌ Not executed - RLS disabled, security vulnerabilities

8. **`fix-rls-for-setup.sql`** 🔒 **CONDITIONAL**
   - Additional RLS fixes for specific setup issues
   - **Purpose**: Fix specific RLS problems
   - **Dependencies**: Requires Phase 4 #7

9. **`FINAL_SECURITY_FIX.sql`** 🔒 **REQUIRED**
   - Final security configurations
   - Removes SECURITY DEFINER from views (analytics views)
   - Enables RLS on remaining tables
   - **Purpose**: Complete security setup
   - **Dependencies**: Requires Phase 4 #7

### Phase 5: Storage and Analytics Setup
Execute these scripts for additional features:

10. **`setup-supabase-storage.sql`** 💾 **REQUIRED**
    - Creates storage buckets for images
    - Sets up storage policies
    - Creates image cache table
    - **Purpose**: Enable file storage for card images
    - **Dependencies**: None (independent)

11. **`fix-views-security-definer.sql`** 📊 **CONDITIONAL**
    - Fixes analytics views security issues
    - **Purpose**: Secure analytics views
    - **Dependencies**: Requires analytics views

12. **`fix-analytics-view-security.sql`** 📊 **CONDITIONAL**
    - Additional analytics security fixes
    - **Purpose**: Additional analytics security
    - **Dependencies**: Requires analytics views

### Phase 6: Function Security
Execute these scripts to secure database functions:

13. **`fix-function-security.sql`** ⚙️ **CONDITIONAL**
    - Fixes security issues with database functions
    - **Purpose**: Secure database functions
    - **Dependencies**: Requires functions to be created

### Phase 7: Specific Fixes and Migrations
Execute these scripts only if you encounter specific issues:

14. **`fix-missing-problem-type-column.sql`** 🔧 **CONDITIONAL**
    - Adds missing problem_type column
    - **Use only if**: You get errors about missing problem_type column
    - **Dependencies**: Requires cards table

15. **`fix-migration-error.sql`** 🔧 **CONDITIONAL**
    - Fixes specific migration errors
    - **Use only if**: You encounter migration errors
    - **Dependencies**: Context-dependent

## 📚 Reference and Example Scripts

These scripts are for reference and examples only - **DO NOT execute**:

- `example-problem-types-usage.sql` - Examples of how to use problem types
- `example-catalog-queries.sql` - Example queries for catalogs
- `create-cards-type-catalog.sql` - Creates type catalog (deprecated)

## 🚀 Quick Start Sequence

### For CURRENT database status (with detected errors):

```sql
-- 0. IMMEDIATE: Fix security linter errors
fix-security-definer-views.sql

-- 1. Populate problem types (CRITICAL)
setup-dynamic-cards-database.sql

-- 2. Migrate existing cards to dynamic format
migrate-to-dynamic-cards.sql

-- 3. Complete security configuration  
fix-security-issues.sql
FINAL_SECURITY_FIX.sql

-- 4. Setup storage
setup-supabase-storage.sql
```

### For a **fresh installation**, execute in this order:

```sql
-- 1. Base setup
complete-database-setup.sql

-- 2. Dynamic cards
setup-dynamic-cards-database.sql

-- 3. Data migration
migrate-to-dynamic-cards.sql

-- 4. Security
fix-security-issues.sql
FINAL_SECURITY_FIX.sql

-- 5. Storage
setup-supabase-storage.sql
```

## ⚠️ Troubleshooting

### If you get permission errors:
1. Ensure you're using the **service role key** in Supabase
2. Run `fix-security-issues.sql` before other scripts

### If you get missing table errors:
1. Ensure you ran `complete-database-setup.sql` first
2. Check the dependencies listed above

### If you get constraint errors:
1. Check if you have existing data that conflicts
2. Consider running the appropriate fix script

### If you get Supabase linter errors:
1. Run `fix-security-definer-views.sql` for SECURITY DEFINER issues
2. Run `fix-security-issues.sql` for RLS issues
3. Check the specific error and use the corresponding fix script

## 📝 Version Notes

- **Scripts are designed to be idempotent** - safe to run multiple times
- **Always check the script contents** before execution
- **Test in a development environment** first

## 🆘 Support

If you encounter issues not covered here:
1. Check the script comments for specific instructions
2. Verify all dependencies are met
3. Run scripts one at a time and check for errors
4. Use Supabase logs to debug issues

---
*Last updated: January 2024*
*EduCard AI Platform v2.0 - Dynamic Cards Revolution* 