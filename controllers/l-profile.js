const legis = require('./schemas/legislators');
const districts = require('./schemas/districts');
const messages = require('./schemas/messages');

function profileRender(req, res){
    let email = req.legislator.user.email;
    if(!email){
        req.legislator.user = null;
        res.redirect('/');
    }
    else {
        legis.findOne({email: email}, (err, ret_l)=>{
            if(err){
                req.legislator.user = null;
                res.redirect('/');
                throw err;
            }
            else {
                if(!ret_l){
                    req.legislator.user = null;
                    res.redirect('/');
                }
                else if(ret_l.password !== req.legislator.user.password){
                    req.legislator.user = null;
                    res.redirect('/');
                }
                else {
                    let code = ret_l.code;
                    districts.findOne({code: code}, (err, ret_dist)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_dist){
                            req.legislator.user = null;
                            res.redirect('/');
                        }
                        else {
                            let const_num = ret_dist.const_num;
                            ret_l.const_num = const_num;
                            ret_l.password = null;

                            messages.find({sender: email}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    ret_msgs.forEach(ret_m =>{
                                        ret_m.originator = true;
                                        //identify tags and messily give 'em html
                                        let mText = ret_m.message;
                                        let mTextArr = mText.split(/\s/);
                                        let finalTextArr = [];
                                        mTextArr.forEach(element => {
                                            if(element[0] == '#' && element.slice(1).search(/\W/) != 0){
                                                let hold_elem = element[0];
                                                let part_elem = element.slice(1);
                                                let end = part_elem.search(/\W/);
                                                if(end == -1){
                                                    hold_elem = '#'+part_elem;
                                                }
                                                else {
                                                    hold_elem += part_elem.slice(0, end);
                                                }
                                                
                                                hold_elem = `<span><a href="/search/tag/${part_elem}" class="tag">${hold_elem}</a></span>`;
                                                element = hold_elem;
                                            }
                                            finalTextArr.push(element);
                                        });
                                        
                                        ret_m.message = finalTextArr.join(' ');
                                    });
                                    ret_l.messages = ret_msgs;
                                    res.render('l-profile', ret_l);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}

module.exports = profileRender;