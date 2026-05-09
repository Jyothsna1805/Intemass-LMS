const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

console.log("Running migration on lms.db...");

db.serialize(() => {
    db.run("ALTER TABLE questions ADD COLUMN subject TEXT DEFAULT 'Uncategorized'", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column 'subject' already exists. Skipping.");
            } else {
                console.error("Migration Error:", err.message);
            }
        } else {
            console.log("Successfully added 'subject' column to questions table.");
        }
    });
});

db.close();
