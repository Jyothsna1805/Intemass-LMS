const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');

db.run("ALTER TABLE questions ADD COLUMN max_marks INTEGER DEFAULT 5", (err) => {
    if (err) console.log(err.message);
    else console.log("OK");
    db.close();
});
