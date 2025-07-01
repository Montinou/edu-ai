// ================================================
// CREATE MIGRATION - EduCard AI Migration System
// ================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MigrationGenerator {
    constructor() {
        this.migrationsDir = path.join(process.cwd(), 'migrations');
        this.ensureMigrationsDirectory();
    }

    ensureMigrationsDirectory() {
        if (!fs.existsSync(this.migrationsDir)) {
            fs.mkdirSync(this.migrationsDir, { recursive: true });
            console.log('✅ Created migrations directory');
        }
    }

    generateTimestamp() {
        return new Date().toISOString()
            .replace(/[-:T]/g, '')
            .replace(/\..+/, '')
            .slice(0, 14);
    }

    generateMigrationName(description) {
        const timestamp = this.generateTimestamp();
        const sanitizedName = description
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
        
        return `${timestamp}_${sanitizedName}`;
    }

    generateMigrationTemplate(name, description, type = 'general') {
        const templates = {
            table: this.getTableTemplate(name, description),
            column: this.getColumnTemplate(name, description),
            index: this.getIndexTemplate(name, description),
            function: this.getFunctionTemplate(name, description),
            security: this.getSecurityTemplate(name, description),
            data: this.getDataTemplate(name, description),
            general: this.getGeneralTemplate(name, description)
        };

        return templates[type] || templates.general;
    }

    getGeneralTemplate(name, description) {
        return `-- ================================================
-- Migration: ${name}
-- ================================================
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Type: General Migration
-- ================================================

-- =====================================================
-- MIGRATION UP
-- =====================================================

-- Add your SQL here
-- Example:
-- CREATE TABLE example_table (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- =====================================================
-- MIGRATION DOWN (ROLLBACK)
-- =====================================================

-- Add rollback SQL here
-- Example:
-- DROP TABLE IF EXISTS example_table;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify the migration was applied correctly
-- SELECT 'Migration ${name} completed successfully' as status;

-- ================================================
-- NOTES
-- ================================================

-- Add any important notes about this migration:
-- - Dependencies: List any dependent migrations
-- - Data Impact: Describe any data changes
-- - Performance: Note any performance considerations
-- - Rollback: Special rollback considerations
`;
    }

    getTableTemplate(name, description) {
        return `-- ================================================
-- Migration: ${name}
-- ================================================
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Type: Table Creation
-- ================================================

-- =====================================================
-- MIGRATION UP - CREATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS new_table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Add your columns here
    name TEXT NOT NULL,
    description TEXT,
    
    -- Standard audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Add constraints
    CONSTRAINT unique_name UNIQUE(name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table_name(name);
CREATE INDEX IF NOT EXISTS idx_new_table_created_at ON new_table_name(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE new_table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own records" ON new_table_name
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own records" ON new_table_name
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Grant permissions
GRANT ALL ON new_table_name TO authenticated;
GRANT USAGE ON SEQUENCE new_table_name_id_seq TO authenticated;

-- =====================================================
-- MIGRATION DOWN (ROLLBACK)
-- =====================================================

-- DROP POLICIES
-- DROP POLICY IF EXISTS "Users can view their own records" ON new_table_name;
-- DROP POLICY IF EXISTS "Users can insert their own records" ON new_table_name;

-- DROP TABLE
-- DROP TABLE IF EXISTS new_table_name;

-- ================================================
-- VERIFICATION
-- ================================================

-- Verify table exists and has correct structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'new_table_name'
ORDER BY ordinal_position;
`;
    }

    getColumnTemplate(name, description) {
        return `-- ================================================
-- Migration: ${name}
-- ================================================
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Type: Column Modification
-- ================================================

-- =====================================================
-- MIGRATION UP - ADD/MODIFY COLUMNS
-- =====================================================

-- Add new column
ALTER TABLE existing_table_name 
ADD COLUMN IF NOT EXISTS new_column_name TEXT;

-- Modify existing column (if needed)
-- ALTER TABLE existing_table_name 
-- ALTER COLUMN existing_column_name TYPE new_data_type;

-- Add constraints
-- ALTER TABLE existing_table_name 
-- ADD CONSTRAINT constraint_name CHECK (condition);

-- Create index for new column
CREATE INDEX IF NOT EXISTS idx_existing_table_new_column ON existing_table_name(new_column_name);

-- =====================================================
-- DATA MIGRATION (if needed)
-- =====================================================

-- Update existing records with default values
-- UPDATE existing_table_name 
-- SET new_column_name = 'default_value' 
-- WHERE new_column_name IS NULL;

-- =====================================================
-- MIGRATION DOWN (ROLLBACK)
-- =====================================================

-- Remove index
-- DROP INDEX IF EXISTS idx_existing_table_new_column;

-- Remove column
-- ALTER TABLE existing_table_name DROP COLUMN IF EXISTS new_column_name;

-- ================================================
-- VERIFICATION
-- ================================================

-- Verify column was added correctly
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'existing_table_name' 
AND column_name = 'new_column_name';
`;
    }

    getSecurityTemplate(name, description) {
        return `-- ================================================
-- Migration: ${name}
-- ================================================
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Type: Security Configuration
-- ================================================

-- =====================================================
-- MIGRATION UP - SECURITY POLICIES
-- =====================================================

-- Enable RLS on table
ALTER TABLE target_table_name ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "policy_name_select" ON target_table_name
    FOR SELECT USING (
        -- Add your security logic here
        auth.uid() = user_id OR
        is_admin()
    );

CREATE POLICY "policy_name_insert" ON target_table_name
    FOR INSERT WITH CHECK (
        -- Add your security logic here
        auth.uid() = user_id
    );

CREATE POLICY "policy_name_update" ON target_table_name
    FOR UPDATE USING (
        -- Add your security logic here
        auth.uid() = user_id
    );

CREATE POLICY "policy_name_delete" ON target_table_name
    FOR DELETE USING (
        -- Add your security logic here
        auth.uid() = user_id OR
        is_admin()
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON target_table_name TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- MIGRATION DOWN (ROLLBACK)
-- =====================================================

-- Remove policies
-- DROP POLICY IF EXISTS "policy_name_select" ON target_table_name;
-- DROP POLICY IF EXISTS "policy_name_insert" ON target_table_name;
-- DROP POLICY IF EXISTS "policy_name_update" ON target_table_name;
-- DROP POLICY IF EXISTS "policy_name_delete" ON target_table_name;

-- Disable RLS
-- ALTER TABLE target_table_name DISABLE ROW LEVEL SECURITY;

-- ================================================
-- VERIFICATION
-- ================================================

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'target_table_name';
`;
    }

    getFunctionTemplate(name, description) {
        return `-- ================================================
-- Migration: ${name}
-- ================================================
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Type: Function/Procedure
-- ================================================

-- =====================================================
-- MIGRATION UP - CREATE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION function_name(param1 TYPE, param2 TYPE)
RETURNS RETURN_TYPE AS $$
DECLARE
    -- Declare variables here
    result_var TYPE;
BEGIN
    -- Function logic here
    
    -- Example:
    -- SELECT column INTO result_var FROM table WHERE condition;
    -- RETURN result_var;
    
    RETURN NULL; -- Replace with actual return
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger if needed
-- CREATE TRIGGER trigger_name
--     BEFORE/AFTER INSERT/UPDATE/DELETE ON table_name
--     FOR EACH ROW EXECUTE FUNCTION function_name();

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION function_name TO authenticated;

-- =====================================================
-- MIGRATION DOWN (ROLLBACK)
-- =====================================================

-- Drop trigger first
-- DROP TRIGGER IF EXISTS trigger_name ON table_name;

-- Drop function
-- DROP FUNCTION IF EXISTS function_name;

-- ================================================
-- VERIFICATION
-- ================================================

-- Verify function was created
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'function_name';
`;
    }

    getDataTemplate(name, description) {
        return `-- ================================================
-- Migration: ${name}
-- ================================================
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Type: Data Migration
-- ================================================

-- =====================================================
-- MIGRATION UP - DATA CHANGES
-- =====================================================

-- Insert new data
INSERT INTO table_name (column1, column2, column3) VALUES
    ('value1', 'value2', 'value3'),
    ('value4', 'value5', 'value6')
ON CONFLICT (unique_column) DO NOTHING;

-- Update existing data
-- UPDATE table_name 
-- SET column1 = 'new_value'
-- WHERE condition;

-- Data transformation example
-- WITH updated_data AS (
--     SELECT id, transform_function(old_column) as new_value
--     FROM table_name
--     WHERE condition
-- )
-- UPDATE table_name 
-- SET new_column = updated_data.new_value
-- FROM updated_data
-- WHERE table_name.id = updated_data.id;

-- =====================================================
-- MIGRATION DOWN (ROLLBACK)
-- =====================================================

-- Remove inserted data
-- DELETE FROM table_name WHERE condition;

-- Revert updates
-- UPDATE table_name 
-- SET column1 = 'original_value'
-- WHERE condition;

-- ================================================
-- VERIFICATION
-- ================================================

-- Verify data changes
SELECT COUNT(*) as total_records, 
       COUNT(CASE WHEN column1 = 'expected_value' THEN 1 END) as updated_records
FROM table_name;

-- Verify data integrity
-- SELECT * FROM table_name WHERE condition LIMIT 5;
`;
    }

    getIndexTemplate(name, description) {
        return `-- ================================================
-- Migration: ${name}
-- ================================================
-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Type: Index Creation
-- ================================================

-- =====================================================
-- MIGRATION UP - CREATE INDEXES
-- =====================================================

-- Create standard index
CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);

-- Create composite index
CREATE INDEX IF NOT EXISTS idx_table_multi_column ON table_name(column1, column2);

-- Create partial index (with condition)
CREATE INDEX IF NOT EXISTS idx_table_conditional ON table_name(column_name) 
WHERE condition = 'value';

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_table_unique ON table_name(unique_column);

-- Create expression index
CREATE INDEX IF NOT EXISTS idx_table_expression ON table_name(LOWER(text_column));

-- =====================================================
-- MIGRATION DOWN (ROLLBACK)
-- =====================================================

-- Drop indexes
-- DROP INDEX IF EXISTS idx_table_column;
-- DROP INDEX IF EXISTS idx_table_multi_column;
-- DROP INDEX IF EXISTS idx_table_conditional;
-- DROP INDEX IF EXISTS idx_table_unique;
-- DROP INDEX IF EXISTS idx_table_expression;

-- ================================================
-- VERIFICATION
-- ================================================

-- Verify indexes were created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'table_name'
AND indexname LIKE 'idx_table_%';

-- Check index usage (run after some time)
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan,
--     idx_tup_read,
--     idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE tablename = 'table_name';
`;
    }

    createMigration(description, type = 'general') {
        if (!description) {
            console.error('❌ Migration description is required');
            console.log('Usage: npm run db:create "Description of migration" [type]');
            console.log('Types: table, column, index, function, security, data, general');
            return;
        }

        const migrationName = this.generateMigrationName(description);
        const filename = `${migrationName}.sql`;
        const filepath = path.join(this.migrationsDir, filename);

        // Check if migration already exists
        if (fs.existsSync(filepath)) {
            console.error(`❌ Migration ${filename} already exists`);
            return;
        }

        const template = this.generateMigrationTemplate(migrationName, description, type);
        
        try {
            fs.writeFileSync(filepath, template);
            console.log('🎉 Migration created successfully!');
            console.log(`📁 File: ${filepath}`);
            console.log(`📝 Name: ${migrationName}`);
            console.log(`🏷️  Type: ${type}`);
            console.log('');
            console.log('📋 Next steps:');
            console.log('1. Edit the migration file with your SQL');
            console.log('2. Run: npm run db:migrate');
            console.log('3. Verify with: npm run db:status');
            
            return migrationName;
        } catch (error) {
            console.error('❌ Error creating migration:', error.message);
            return null;
        }
    }
}

// CLI Interface
if (require.main === module) {
    const description = process.argv[2];
    const type = process.argv[3] || 'general';
    
    if (!description) {
        console.log('🔧 EduCard AI - Migration Generator');
        console.log('');
        console.log('Usage: npm run db:create "Description" [type]');
        console.log('');
        console.log('Types:');
        console.log('  table     - Create new table with RLS and policies');
        console.log('  column    - Add/modify table columns');
        console.log('  index     - Create database indexes');
        console.log('  function  - Create functions/triggers');
        console.log('  security  - RLS policies and permissions');
        console.log('  data      - Data migration and seeding');
        console.log('  general   - General purpose migration');
        console.log('');
        console.log('Examples:');
        console.log('  npm run db:create "Add user preferences table" table');
        console.log('  npm run db:create "Add avatar column to users" column');
        console.log('  npm run db:create "Index for performance optimization" index');
        process.exit(1);
    }

    const generator = new MigrationGenerator();
    generator.createMigration(description, type);
}

module.exports = MigrationGenerator; 