const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');

db.all("SELECT id FROM submissions", [], (err, rows) => {
    if (err) return console.log(err);

    // Explicitly avoids ever providing a 5/5 score
    const topologies = [
        { y_axis: true, x_axis: true, supply: false, demand: true, equilibrium: false }, // 2/5
        { y_axis: true, x_axis: true, supply: true, demand: false, equilibrium: true },  // 4/5
        { y_axis: true, x_axis: true, supply: true, demand: true, equilibrium: false },  // 4/5 
        { y_axis: true, x_axis: true, supply: false, demand: true, equilibrium: true },  // 4/5 
        { y_axis: true, x_axis: false, supply: true, demand: true, equilibrium: false }  // 3/5
    ];

    let count = 0;
    rows.forEach((row, index) => {
        const topo = topologies[index % topologies.length];
        db.run("UPDATE submissions SET topology_json = ? WHERE id = ?", [JSON.stringify(topo), row.id], () => {
            count++;
            if (count === rows.length) {
                console.log("SCATTERED VARIED MOCKS COMPLETED (MAX 4/5).");
                db.close();
            }
        });
    });
});
