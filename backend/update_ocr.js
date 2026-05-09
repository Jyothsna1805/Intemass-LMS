const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');

const text = fs.readFileSync('uploads/extracted_1777125136872-871181030_text.txt', 'utf8');

db.run(`UPDATE submissions SET ocr_text = ? WHERE file_url LIKE '%1777125136872-871181030.png%'`, [text], (err) => {
    if (err) console.error(err);
    else console.log("DONE");
    db.close();
});
