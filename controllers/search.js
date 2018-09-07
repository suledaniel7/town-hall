function search(req, res){
    let type = req.params.type;
    let term = req.params.term;

    if(type == 'j'){
        res.render('j-render');
    }
    else if(type == 'o'){
        res.render('o-render');
    }
    else if(type == 'l'){
        res.render('l-render');
    }
    else {
        res.render('search-res');
    }
}
//next complete page render with info
//evening search
module.exports = search;