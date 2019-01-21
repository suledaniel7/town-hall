const path = require('path');

function convert(file) {
    var dest = file.destination;
    var fName = file.filename;
    var fPath = path.join(__dirname, '../', dest, fName);
    var thisPath = path.join(__dirname, '../', '/public/');
    fPath = path.relative(thisPath, fPath);
    fPath = fPath.replace(/\\/g, '/');
    
    return fPath;
}

module.exports = convert;