const unmapChar = require('./unMapChar');

function decodeStr(str, destroy) {
    if (destroy) {
        let prev_seg = '';
        let index = str.indexOf('%');
        while (index !== -1) {
            let end_index = index + 3;
            prev_seg = str.slice(0, index);
            let fin_seg = str.slice(end_index);
            let seg = '';
            str = prev_seg + seg + fin_seg;
            index = str.indexOf('%');
        }
        return str;
    }
    else {
        let prev_seg = '';
        let index = str.indexOf('%');
        while (index !== -1) {
            let end_index = index + 3;
            prev_seg = str.slice(0, index);
            let fin_seg = str.slice(end_index);
            let seg = str.slice(index, end_index);
            seg = unmapChar(seg);
            str = prev_seg + seg + fin_seg;
            index = str.indexOf('%');
        }
        return str;
    }
}

module.exports = decodeStr;