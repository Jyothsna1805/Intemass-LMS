const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite';
let dbInstance = null;

const initDb = async () => {
    if (dbType === 'postgres') {
        dbInstance = new Pool(
            process.env.DATABASE_URL 
                ? { connectionString: process.env.DATABASE_URL }
                : {
                    user: process.env.DB_USER,
                    host: process.env.DB_HOST,
                    database: process.env.DB_NAME,
                    password: process.env.DB_PASSWORD,
                    port: process.env.DB_PORT,
                }
        );

        // Create tables
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
        try {
            await dbInstance.query(schemaSql);
            console.log("Postgres database initialized");
        } catch (e) {
            console.error("Error initializing postgres DB:", e);
        }

    } else {
        // SQLite
        const dbFile = process.env.DB_FILE || './lms.db';
        dbInstance = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error('Error opening database', err.message);
            } else {
                console.log('Connected to the SQLite database.');
                const schemaSql = fs.readFileSync(path.join(__dirname, 'schema_sqlite.sql')).toString();
                dbInstance.exec(schemaSql, (err) => {
                    if (err) {
                        console.error("Error initializing sqlite DB:", err);
                    } else {
                        console.log("SQLite DB initialized");
                    }
                });
            }
        });
    }
};

const query = async (text, params) => {
    if (dbType === 'postgres') {
        const res = await dbInstance.query(text, params);
        return res.rows;
    } else {
        return new Promise((resolve, reject) => {
            dbInstance.all(text, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
};

const execute = async (text, params) => {
    if (dbType === 'postgres') {
        const res = await dbInstance.query(text, params);
        return res;
    } else {
        return new Promise((resolve, reject) => {
            dbInstance.run(text, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }
}

module.exports = {
    initDb,
    query,
    execute
};
