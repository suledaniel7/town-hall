const legislators = require('./schemas/legislators');
const districts = require('./schemas/districts');
const messages = require('./schemas/messages');
const extractTags = require('./extractTags');

function renderProfile(req, res, code){
    legislators.findOne({code: code}, (err, ret_l)=>{
        if(err){
            throw err;
        }
        else if(!ret_l){
            res.redirect('/');//explain what happened
        }
        else {
            ret_l.likes = null;
            ret_l.dislikes = null;
            ret_l.password = null;
            
            districts.findOne({code: code}, (err, ret_d)=>{
                if(err){
                    throw err;
                }
                else if (!ret_d){
                    console.log("Significant error. Cannot find district for legislator bearing code:", code);
                    res.redirect('/');
                }
                else {
                    ret_l.const_num = ret_d.const_num;

                    messages.find({sender: code}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                        if(err){
                            throw err;
                        }
                        else {
                            ret_l.messages = extractTags(ret_msgs, null);
                            res.render('l-render', ret_l);
                        }
                    });
                }
            });
        }
    });
}

module.exports = renderProfile;