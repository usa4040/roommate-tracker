import db from './db';
import { hashPassword } from './auth';

/**
 * Add authentication fields to users table
 * This migration adds: email, password, role
 */
export const migrateAuthFields = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if email column exists
        db.all("PRAGMA table_info(users)", [], (err, columns?: any[]) => {
            if (err) {
                console.error('Error checking table structure:', err);
                reject(err);
                return;
            }

            if (!columns) {
                reject(new Error('Failed to get table info'));
                return;
            }

            const hasEmail = columns.some(col => col.name === 'email');

            if (!hasEmail) {
                console.log('Adding authentication fields to users table...');

                // SQLite doesn't support adding multiple columns at once
                // and doesn't support adding columns with NOT NULL and no default
                // So we'll add them as nullable first
                db.run("ALTER TABLE users ADD COLUMN email TEXT", [], (err) => {
                    if (err) {
                        console.error('Error adding email column:', err);
                        reject(err);
                        return;
                    }

                    db.run("ALTER TABLE users ADD COLUMN password TEXT", [], (err) => {
                        if (err) {
                            console.error('Error adding password column:', err);
                            reject(err);
                            return;
                        }

                        db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", [], async (err) => {
                            if (err) {
                                console.error('Error adding role column:', err);
                                reject(err);
                                return;
                            }

                            console.log('Authentication fields added successfully');

                            // Create a default admin user if no users have email
                            db.get("SELECT COUNT(*) as count FROM users WHERE email IS NOT NULL", [], async (err, row: any) => {
                                if (err) {
                                    console.error('Error checking for admin user:', err);
                                    reject(err);
                                    return;
                                }

                                if (row.count === 0) {
                                    console.log('Creating default admin user...');
                                    const defaultPassword = await hashPassword('admin123');

                                    db.run(
                                        "INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)",
                                        [
                                            'Admin',
                                            'admin@example.com',
                                            defaultPassword,
                                            'admin',
                                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
                                        ],
                                        (err) => {
                                            if (err) {
                                                console.error('Error creating admin user:', err);
                                                reject(err);
                                            } else {
                                                console.log('Default admin user created');
                                                console.log('Email: admin@example.com');
                                                console.log('Password: admin123');
                                                console.log('⚠️  Please change the admin password after first login!');
                                                resolve();
                                            }
                                        }
                                    );
                                } else {
                                    resolve();
                                }
                            });
                        });
                    });
                });
            } else {
                console.log('Authentication fields already exist');
                resolve();
            }
        });
    });
};
