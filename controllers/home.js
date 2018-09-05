const orgProfile = require('./org-profile');
const jProfile = require('./j-profile');
const lProfile = require('./l-profile');
const uProfile = require('./u-profile');
//as a rule, all rendering controllers check the db to ensure the account still exists, and that the passwords are the same

function home(req, res){
    //first, find the session that has a current user, tag it as active
    //second, reroute to the active function call
    //so, first of all, create functions for all user classes
    function user(){
        uProfile(req, res);
    }
    function journo(){
        jProfile(req, res);
    }
    function legis(){
        lProfile(req, res);
    }
    function org(){
        orgProfile(req, res);
    }
    function homeFn(){
        res.render('home');
    }

    //finding active session
    function findActive(){
        if(req.user){
            if(req.user.user){
                return 'user';
            }
        }
        if(req.organisation){
            if(req.organisation.user){
                return 'organisation';
            }
        }
        if(req.journalist){
            if(req.journalist.user){
                return 'journalist';
            }
        }
        if(req.legislator){
            if(req.legislator.user){
                return 'legislator';
            }
        }
        return 'home';
    }

    //handling active session
    let active = findActive();
    if(active != 'home'){
        //check for various use cases
        if(active == 'user'){
            user();
        }
        else if(active == 'organisation'){
            org();
        }
        else if(active == 'journalist'){
            journo();
        }
        else if(active == 'legislator'){
            legis();
        }
        else {
            homeFn();
        }
    }
    else {
        homeFn();
    }
}

module.exports = home;