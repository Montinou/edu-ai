// ================================================
// DATABASE CONNECTION - EduCard AI Migration System
// ================================================
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.initializeConnection();
    }

    initializeConnection() {
        // Cargar variables de entorno
        require('dotenv').config();
        
        // Configurar conexión con Supabase
        const connectionString = process.env.DATABASE_URL || 
            `postgresql://postgres.iyezdyycisbakuozpcym:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
        
        this.pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('✅ Database connection initialized');
    }

    async query(text, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } catch (error) {
            console.error('❌ Database query error:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async transaction(queries) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const results = [];
            
            for (const query of queries) {
                const result = await client.query(query.text, query.params);
                results.push(result);
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Transaction rolled back:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    async ensureMigrationsTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT NOW(),
                rollback_sql TEXT,
                migration_hash VARCHAR(64),
                batch_id INTEGER DEFAULT 1
            );
            
            -- Índice para búsquedas rápidas
            CREATE INDEX IF NOT EXISTS idx_migrations_name ON schema_migrations(migration_name);
            CREATE INDEX IF NOT EXISTS idx_migrations_batch ON schema_migrations(batch_id);
        `;
        
        try {
            await this.query(createTableQuery);
            console.log('✅ Migrations table ensured');
        } catch (error) {
            console.error('❌ Error creating migrations table:', error.message);
            throw error;
        }
    }

    async getAppliedMigrations() {
        try {
            const result = await this.query(
                'SELECT migration_name, applied_at FROM schema_migrations ORDER BY applied_at ASC'
            );
            return result.rows;
        } catch (error) {
            console.error('❌ Error fetching applied migrations:', error.message);
            return [];
        }
    }

    async recordMigration(migrationName, rollbackSql, migrationHash) {
        const query = `
            INSERT INTO schema_migrations (migration_name, rollback_sql, migration_hash)
            VALUES ($1, $2, $3)
        `;
        
        try {
            await this.query(query, [migrationName, rollbackSql, migrationHash]);
            console.log(`✅ Recorded migration: ${migrationName}`);
        } catch (error) {
            console.error(`❌ Error recording migration ${migrationName}:`, error.message);
            throw error;
        }
    }

    async removeMigration(migrationName) {
        const query = 'DELETE FROM schema_migrations WHERE migration_name = $1';
        
        try {
            await this.query(query, [migrationName]);
            console.log(`✅ Removed migration record: ${migrationName}`);
        } catch (error) {
            console.error(`❌ Error removing migration ${migrationName}:`, error.message);
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('✅ Database connection closed');
        }
    }

    // Utilidad para verificar conectividad
    async testConnection() {
        try {
            const result = await this.query('SELECT NOW() as current_time, version() as postgres_version');
            console.log('✅ Database connection successful');
            console.log(`📅 Server time: ${result.rows[0].current_time}`);
            console.log(`🐘 PostgreSQL: ${result.rows[0].postgres_version.split(' ')[1]}`);
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }
}

module.exports = DatabaseConnection; 