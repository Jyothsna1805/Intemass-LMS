const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');
const topo = { y_axis: true, x_axis: true, supply: true, demand: true, equilibrium: false };
const topoStr = JSON.stringify(topo);
db.run("UPDATE submissions SET topology_json = ? WHERE topology_json IS NULL", [topoStr], (err) => {
    console.log(err || 'OK_BACKFILL_COMPLETE');
    db.close();
});
