const fs = require('fs');

function determine_type(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                let arr = (new Uint8Array(data)).subarray(0, 4);
                let header = '';
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }

                //having obtained the file's magic numbers, we now check what sort of file it is
                let f_type = '';
                switch (header) {
                    case 'ffd8ffdb':
                    case 'ffd8ffe0':
                    case 'ffd8ffee':
                    case 'ffd8ffe1':
                    case 'ffd8ffe3':
                    case 'ffd8ffe8':
                        f_type = 'jpg';
                        break;

                    case '89504e47':
                        f_type = 'png';
                        break;

                    default:
                        f_type = null;
                        break;
                }
                resolve(f_type);
            }
        })
    });
}

module.exports = determine_type;