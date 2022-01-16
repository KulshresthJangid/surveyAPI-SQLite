// const questions = require('../../Rampwin Internship Files/vechileChatBot2/models/questions');
const db = require('./db/db')
const sqlite3 = require('sqlite3').verbose();

let sql = `SELECT * FROM surveys`;

function findSurvey (survey_name, cb) {
    return db.all(`SELECT * FROM surveys WHERE survey_name = ?`, [survey_name], (err, row) => {
        cb(err, row)
    } )
}

// findSurvey('somethings', (err, row) => {
//     if(err) {
//         console.log(err)
//     }
//     console.log(row)
// })

// db.all(sql, [], (err, rows) => {
//     if(err) {
//         throw err;
//     }
//     let arr = []

//     console.log(rows)
// });

// db.run(`UPDATE surveys SET yes = yes + 1 WHERE questions = ?`, ['what is your name?'], (err) => {
//     if(err) {
//         console.log(err)
//     }
//     console.log(`Row(s) updated: ${this.changes}`)
// })

let arr1 = [1, 2, 3]
let arr2 = [4, 5, 6]
let i

for(i=0;i<arr1.length;i++) {
    console.log(arr1[i], arr2[i])
}