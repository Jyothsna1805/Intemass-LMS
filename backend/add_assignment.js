const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./lms.db');

const generateId = () => crypto.randomUUID();

const addTestAssignment = () => {
    const assignmentId = generateId();
    const questionId = '582c3de7-2300-4f9d-aa56-d726bfc5138a'; // The question we just added

    // Get teacher id
    db.get("SELECT id FROM users WHERE role = 'teacher' LIMIT 1", (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        const teacherId = row.id;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        db.run("INSERT INTO assignments(id, teacher_id, title, instructions, due_date) VALUES(?, ?, ?, ?, ?)",
            [assignmentId, teacherId, 'Economics Assignment', 'Please explain the effects of tariffs.', tomorrow.toISOString()],
            function(err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Test assignment added with ID:', assignmentId);

                    // Add to assignment_questions
                    db.run("INSERT INTO assignment_questions(assignment_id, question_id, max_points) VALUES(?, ?, ?)",
                        [assignmentId, questionId, 5],
                        function(err) {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log('Question linked to assignment');
                            }
                            db.close();
                        });
                }
            });
    });
};

addTestAssignment();