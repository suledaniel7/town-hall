function e_log(req, res){
    let err = req.body.err;
    console.log(`Error from user: ${req.ip}: ${err}`);
}

module.exports = e_log;