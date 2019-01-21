function logout(req, res){
    let ac_type = req.params.type;
    
    function bluff(){
        res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
    }
    function redirect(){
        res.send(JSON.stringify({success: true}));
    }

    if(!ac_type){
        bluff();
    }
    else if(ac_type == 'j'){
        //logout journo
        if(!req.journalist.user){
            bluff();
        }
        else {
            req.journalist.user = null;
            redirect();
        }
    }
    else if(ac_type == 'u'){
        //logout user
        if(!req.user.user){
            bluff();
        }
        else {
            req.user.user = null;
            redirect();
        }
    }
    else if(ac_type == 'o'){
        //logout org
        if(!req.organisation.user){
            bluff();
        }
        else {
            req.organisation.user = null;
            redirect();
        }
    }
    else if(ac_type == 'l'){
        //logout leg
        if(!req.legislator.user){
            bluff();
        }
        else {
            req.legislator.user = null;
            redirect();
        }
    }
    else {
        bluff();
    }
}

module.exports = logout;