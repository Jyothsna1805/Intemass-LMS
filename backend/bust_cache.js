const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');

// Append a completely random cache-busting parameter to all existing URLs
db.run("UPDATE submissions SET extracted_diagram_url = extracted_diagram_url || '?rnd=' || hex(randomblob(4)) WHERE extracted_diagram_url IS NOT NULL", (err) => {
    if (err) console.log(err.message);
    else console.log("CACHE BUSTED OK");
    db.close();
});
