const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'backend', 'lms.db'));

db.run("ALTER TABLE submissions ADD COLUMN ocr_text TEXT", (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) console.log("Already exists");
        else console.error(err);
    } else {
        console.log("SUCCESS");
    }
    db.close();
});
