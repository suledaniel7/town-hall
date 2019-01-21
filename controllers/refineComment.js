function refine(comment){
    //extract tags
    let tags = [];
    let unRefTags = [];
    let cTextArr = comment.split(/\s/);
    //extract based on hashes
    cTextArr.forEach(element => {
        if(element[0] == '#' && element.slice(1).search(/\W/) != 0){
            unRefTags.push(element);
        }
    });
    //extract invalid characters
    unRefTags.forEach(tag => {
        let partTag = tag.slice(1);
        let end = partTag.search(/\W/);
        if (end == -1) {
            tags.push(partTag.toLowerCase());
        }
        else {
            let fin_tag = partTag.slice(0, end);
            tags.push(fin_tag.toLowerCase());
        }
    });

    let wsp = /^\s*$/;
    if(!wsp.test(comment)){
        return {
            comment: comment,
            tags: tags
        }
    }
    else {
        return null;
    }
}

module.exports = refine;