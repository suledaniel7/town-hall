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

module.exports = unmapChar;