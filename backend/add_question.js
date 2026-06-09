const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./lms.db');

const generateId = () => crypto.randomUUID();

const addTestQuestion = () => {
    const qId = generateId();
    const masterId = 'some-master-id'; // Need to get actual master id

    // First get a master user id
    db.get("SELECT id FROM users WHERE role = 'master' LIMIT 1", (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        const masterId = row.id;

        const standardAnswer = `price before tariff = pT

price after tariff = (pT-t)+tariffs

price and quantity at world equilibrium

price and quantity after imposing tariffs

tariffs increases the government revenue and protects the local producers but it costs the consumer. They have to pay high prices for the goods and overall it affect the economy as a whole.`;

        db.run("INSERT INTO questions(id, created_by, question_text, standard_answer, type, max_marks) VALUES(?, ?, ?, ?, ?, ?)",
            [qId, masterId, 'Explain the effects of tariffs on international trade.', standardAnswer, 'essay', 5],
            function(err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Test question added with ID:', qId);
                }
                db.close();
            });
    });
};

addTestQuestion();