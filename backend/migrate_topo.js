const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');

db.run("ALTER TABLE submissions ADD COLUMN topology_json TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("OK");
    db.close();
});
