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

module.exports = mapChar;