function findActive(req, res){
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
    return null;
}

module.exports = findActive;