const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');
const topo = { y_axis: true, x_axis: true, equilibrium: true, supply_demand_intersect: false };
const topoStr = JSON.stringify(topo);
db.run("UPDATE submissions SET topology_json = ?", [topoStr], (err) => {
    console.log(err || 'OK_BACKFILL_4PART_COMPLETE');
    db.close();
});
