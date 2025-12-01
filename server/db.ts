import { Pool, QueryResult } from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production';

// Database interface to abstract SQLite and PostgreSQL
interface Database {
    all<T = any>(sql: string, params: any[], callback: (err: Error | null, rows?: T[]) => void): void;
    get<T = any>(sql: string, params: any[], callback: (err: Error | null, row?: T) => void): void;
    run(sql: string, params: any[], callback?: (this: { lastID: number; changes: number }, err: Error | null, result?: any) => void): void;
}

let db: Database;

if (isProduction) {
    // PostgreSQL for production
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Initialize tables
    const initDB = async (): Promise<void> => {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    avatar TEXT
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    payer_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    FOREIGN KEY(payer_id) REFERENCES users(id)
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS payments (
                    id SERIAL PRIMARY KEY,
                    from_user_id INTEGER NOT NULL,
                    to_user_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    description TEXT,
                    date TEXT NOT NULL,
                    FOREIGN KEY(from_user_id) REFERENCES users(id),
                    FOREIGN KEY(to_user_id) REFERENCES users(id)
                )
            `);

            // Check if users table is empty and seed if needed
            const result = await pool.query('SELECT COUNT(*) as count FROM users');
            if (parseInt(result.rows[0].count) === 0) {
                console.log('Seeding initial users...');
                await pool.query(
                    'INSERT INTO users (name, avatar) VALUES ($1, $2), ($3, $4)',
                    [
                        'User A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                        'User B', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'
                    ]
                );
            }

            console.log('Connected to PostgreSQL database.');
        } catch (err) {
            console.error('Error initializing database:', err);
        }
    };

    initDB();

    // Wrapper to make PostgreSQL work like SQLite
    db = {
        all: <T = any>(sql: string, params: any[], callback: (err: Error | null, rows?: T[]) => void): void => {
            // Convert ? to $1, $2, etc.
            let paramIndex = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

            pool.query(pgSql, params)
                .then((result: any) => callback(null, result.rows as T[]))
                .catch((err: Error) => callback(err));
        },
        get: <T = any>(sql: string, params: any[], callback: (err: Error | null, row?: T) => void): void => {
            // Convert ? to $1, $2, etc.
            let paramIndex = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

            pool.query(pgSql, params)
                .then((result: any) => callback(null, result.rows[0] as T))
                .catch((err: Error) => callback(err));
        },
        run: function (sql: string, params: any[], callback?: (this: { lastID: number; changes: number }, err: Error | null, result?: any) => void): void {
            // Convert ? to $1, $2, etc.
            let paramIndex = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

            // For INSERT queries, add RETURNING id
            let finalSql = pgSql;
            if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
                finalSql = pgSql + ' RETURNING id';
            }

            pool.query(finalSql, params)
                .then((result: QueryResult) => {
                    if (callback) {
                        const lastID = result.rows[0]?.id || null;
                        callback.call({
                            lastID: lastID,
                            changes: result.rowCount || 0
                        }, null, result);
                    }
                })
                .catch((err: Error) => {
                    if (callback) callback.call({ lastID: 0, changes: 0 }, err);
                });
        }
    };

} else {
    // SQLite for development
    const dbPath = path.resolve(__dirname, 'expenses.db');

    const sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database ' + dbPath + ': ' + err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    sqliteDb.serialize(() => {
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            avatar TEXT
        )`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payer_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(payer_id) REFERENCES users(id)
        )`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            FOREIGN KEY(from_user_id) REFERENCES users(id),
            FOREIGN KEY(to_user_id) REFERENCES users(id)
        )`);

        // Seed initial users if empty
        sqliteDb.get("SELECT count(*) as count FROM users", (_err, row: any) => {
            if (row && row.count === 0) {
                console.log("Seeding initial users...");
                const stmt = sqliteDb.prepare("INSERT INTO users (name, avatar) VALUES (?, ?)");
                stmt.run("User A", "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
                stmt.run("User B", "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka");
                stmt.finalize();
            }
        });
    });

    // Cast to Database interface
    db = sqliteDb as unknown as Database;
}

export default db;
