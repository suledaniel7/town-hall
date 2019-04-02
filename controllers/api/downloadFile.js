const convertPath = require('./uploadFilePathConversion');
const path = require('path');
const fs = require('fs');
const f_type = require('./file_type');

function download(req, res) {
    if (req.file) {
        let fPath = convertPath(req.file);
        let file = req.file;
        file.uri = fPath;
        let tmp_path = path.join('../../public/', fPath);
        tmp_path = path.resolve(__dirname, tmp_path);
        f_type(tmp_path).then((valid) => {
            if (!valid) {
                res.send({ success: false, reason: "Please select a PNG or JPEG image" });
                removeFile(tmp_path);
            }
            else {
                res.send({ success: true, file: file });
            }
        }).catch(() => {
            res.send({ success: false, reason: "Please select a PNG or JPEG image" });
            removeFile(tmp_path);
        });
    }
    else {
        res.end({ success: false, reason: "No file received" });
    }

    function removeFile(f_path){
        fs.exists(f_path, (exists) => {
            if (exists) {
                fs.unlink(f_path, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    }
}

module.exports = download;