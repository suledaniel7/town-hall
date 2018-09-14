const fs = require('fs');
const os = require('os');

let f_path = 'C://Users/suled/Downloads/Code/Projects/town_hall/server/logs.txt';

function log_entry(text, entry, d1, d2) {
    let today = new Date();
    if (entry) {
        let log_data = `${today.toString()}: ${text} ${os.EOL}`;
        fs.appendFile(f_path, log_data, (err) => {
            if (err) {
                console.log("Error appending log to log file");
                throw err;
            }
        });
    }
    else {
        let diff = d2-d1
        diff = diff/1000;
        let log_data = `${today.toString()}: ${text} query took ${diff} seconds ${os.EOL}`;
        fs.appendFile(f_path, log_data, (err) => {
            if (err) {
                console.log("Error appending log to log file");
                throw err;
            }
        });
    }
}

module.exports = log_entry;