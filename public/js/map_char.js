//a module to map and unmap characters that will affect the search parameters
function mapChar(char) {
    //chars are %#*()[]{}<>
    switch (char) {
        case '%':
            return '%25';
            break;
        case '#':
            return '%23';
            break;
        // case '*':
        //     return '%22';
        //     break;
        // case '(':
        //     return '%23';
        //     break;
        // case ')':
        //     return '%24';
        //     break;
        // case '[':
        //     return '%25';
        //     break;
        // case ']':
        //     return '%26';
        //     break;
        // case '{':
        //     return '%27';
        //     break;
        // case '}':
        //     return '%28';
        //     break;
        // case '<':
        //     return '%30';
        //     break;
        // case '>':
        //     return '%31';
        //     break;
        default:
            return char;
            break;
    }
}

function unmapChar(code){
    switch (code) {
        case '%25':
            return '%';
            break;
        case '%23':
            return '#';
            break;
        //*
        // case '%23':
        //     return '(';
        //     break;
        // case '%24':
        //     return ')';
        //     break;
        // case '%25':
        //     return '[';
        //     break;
        // case '%26':
        //     return ']';
        //     break;
        // case '%27':
        //     return '{';
        //     break;
        // case '%28':
        //     return '}';
        //     break;
        // case '%30':
        //     return '<';
        //     break;
        // case '%31':
        //     return '>';
        //     break;
        default:
            return code;
            break;
    }
}

function decodeStr(str) {
    let prev_seg = '';
    let index = str.indexOf('%');
    while(index !== -1){
        let end_index = index+3;
        prev_seg = str.slice(0, index);
        // if()
        let fin_seg = str.slice(end_index);
        let seg = str.slice(index, end_index);
        seg = unmapChar(seg);
        str = prev_seg + seg + fin_seg;
        index = str.indexOf('%');
    }
    return str;
}