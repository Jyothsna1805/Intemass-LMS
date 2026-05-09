const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lms.db');

const topo = { y_axis: true, x_axis: true, supply: false, demand: false, equilibrium: false };
const ocrStr = `Tax tariffs lead to reduction of price for the importing country.

Total Income is measured as Consumer surplus (CS) + producer (PS)

CS = a + b + c + d (loss)
PS = a

For government tax : e + d

So, Total income = (a+b+c+d) - a - (d+e)
= b + c - e`;

db.run("UPDATE submissions SET topology_json = ?, ocr_text = ? WHERE rowid = 9", [JSON.stringify(topo), ocrStr], (err) => {
    console.log(err || 'ROW_9_SYNCED');
    db.close();
});
