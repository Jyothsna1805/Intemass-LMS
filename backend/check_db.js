const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, answer_text, ocr_text, marks_awarded, question_id FROM submissions ORDER BY submitted_at DESC LIMIT 1", (err, rows) => {
    if (err) console.error(err);
    console.log("Submissions:", rows);
    
    if (rows && rows.length > 0) {
        db.all("SELECT standard_answer, max_marks FROM questions WHERE id = ?", [rows[0].question_id], (err, qrows) => {
            if (err) console.error(err);
            console.log("Question:", qrows);
        });
    }
});
