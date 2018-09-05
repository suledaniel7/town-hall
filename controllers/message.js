const messages = require('./schemas/messages');
const districts = require('./schemas/districts');
const journalists = require('./schemas/journalists');
const organisations = require('./schemas/organisations');
const legislators = require('./schemas/legislators');
const dateFn = require('./dateFn');
const timeFn = require('./timeFn');

function messageHandler(req, res){
    let m_type = req.params.type;
    let mText = req.body.mBody;
    let today = new Date();
    let comments_no = 0;
    let timestamp = today.getTime();
    let wsp = /^\s*$/;
    if(!wsp.test(mText)){
        //message not-empty. Clear trailing and leading whitespace
        let tsp = /\s+$/;
        let lsp = /^\s+/;
        
        if(tsp.test(mText)){
            mText = mText.replace(tsp, '');
        }
        if(lsp.test(mText)){
            mText = mText.replace(lsp, '');
        }
        //create message
        //find type
        if(m_type == 'j'){
            //journo
            if(!req.journalist){
                res.sendStatus(403);//forbidden
            }
            else if(!req.journalist.user){
                res.sendStatus(403);//forbidden
            }
            else {
                let username = req.journalist.user.username;
                let message = new messages({
                    sender: username,
                    message: mText,
                    ac_type: m_type,
                    comments_no: comments_no,
                    timestamp: timestamp,
                    date_created: dateFn(new Date(), true),
                    time_created: timeFn(new Date())
                });
                
                journalists.findOne({username: username}, (err, ret_j)=>{
                    if(err){
                        throw err;
                    }
                    else if(!ret_j){
                        res.sendStatus(403);
                    }
                    else {
                        //j exists, send message finally
                        message.verified = ret_j.verified;
                        message.sender_name = ret_j.f_name + ' ' + ret_j.l_name;
                        if(ret_j.account.type == 'formal'){
                            message.sender_position = ret_j.orgName + ' Journalist';
                        }
                        else {
                            message.sender_position = null;
                        }
                        message.sender_avatar = ret_j.avatar;
                        message.beat = ret_j.beat;
                        message.save((err)=>{
                            if(err){
                                res.sendStatus(403);
                            }
                            else {
                                res.send({message: message, originator: true});
                            }
                        });
                    }
                });
            }
        }
        else if(m_type == 'o'){
            let recepients = req.body.recepients;
            if(!req.organisation){
                res.sendStatus(403);
            }
            else if(!req.organisation.user){
                res.sendStatus(403);
            }
            else {
                //user exists
                let username = req.organisation.user.username;
                let message = new messages({
                    sender: username,
                    message: mText,
                    ac_type: m_type,
                    comments_no: comments_no,
                    timestamp: timestamp,
                    date_created: dateFn(new Date(), true),
                    time_created: timeFn(new Date())
                });

                organisations.findOne({username: username}, (err, ret_o)=>{
                    if(err){
                        throw err;
                    }
                    else if(!ret_o){
                        res.sendStatus(403);
                    }
                    else {
                        //org exists
                        message.verified = ret_o.verification.verified;
                        message.sender_name = ret_o.name;
                        message.sender_avatar = ret_o.logo;

                        if(recepients == 'all'){
                            //normal
                            message.beat = 'all';
                            message.save((err)=>{
                                if(err){
                                    res.sendStatus(403);
                                }
                                else {
                                    res.send({message: message, originator: true});
                                }
                            });
                        }
                        else {
                            districts.findOne({code: recepients}, (err, ret_d)=>{
                                if(err){
                                    throw err;
                                }
                                else if(!ret_d){
                                    res.redirect('/');
                                }
                                else {
                                    message.beat = ret_d.code;
                                    message.save((err)=>{
                                        if(err){
                                            res.sendStatus(403);
                                        }
                                        else {
                                            res.send({message: message});
                                        }
                                    });
                                }
                            })
                        }
                    }
                });
            }
        }
        else if(m_type == 'l'){
            if(!req.legislator){
                res.sendStatus(403);
            }
            else if(!req.legislator.user){
                res.sendStatus(403);
            }
            else {
                //user exists
                let email = req.legislator.user.email;
                let message = new messages({
                    sender: email,
                    message: mText,
                    ac_type: m_type,
                    comments_no: comments_no,
                    timestamp: timestamp,
                    date_created: dateFn(new Date(), true),
                    time_created: timeFn(new Date())
                });

                legislators.findOne({email: email}, (err, ret_l)=>{
                    if(err){
                        throw err;
                    }
                    else if(!ret_l){
                        res.sendStatus(403);
                    }
                    else {
                        //leg exists
                        message.verified = true;
                        message.beat = ret_l.code;
                        message.sender_name = ret_l.type_exp + ' ' + ret_l.full_name;
                        message.sender_position = 'Representative of ' + ret_l.district + ' | ' + ret_l.state + ' State';
                        message.sender_avatar = ret_l.avatar;
                        message.save((err)=>{
                            if(err){
                                res.sendStatus(403);
                            }
                            else {
                                res.send({message: message, originator: true});
                            }
                        });
                    }
                });
            }
        }
        else {
            res.sendStatus(403);
        }
    }
}

module.exports = messageHandler;

/* 
    A number of factors have to be considered in sending messages
    First of all, the message should be able to detect links and stuff. This happens client-side
    Second, messages cannot be empty. This validation happens both server and client-side
    Also, the message should be classed under something, somehow, so we can categorise well
    Trailing whitespace should be cleared. We'll figure out the rest as it goes on

    As a failsafe, if AJAXification fails, it should start a full request (basically submit form) with the message
    after notifying the user duly
*/

// Create distinctions between user types
// Two things: sort out how messages are sent out, then enable following and unfollowing of sources
// One last thing: AJAXify the message receipt procedure, and send procedure too