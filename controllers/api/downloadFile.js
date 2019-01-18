const convertPath = require('./uploadFilePathConversion');

function download(req, res) {
    if(req.file){
        let fPath = convertPath(req.file);
        let file = req.file;
        file.uri = fPath;
        res.send({success: true, file: file});
    }
    else {
        res.end({success: false, reason: "No file received"});
    }
}

module.exports = download;