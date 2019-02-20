const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const messages = require('../schemas/messages');
const districts = require('../schemas/districts');
const strip = require('./strip');

function recompile(u_type, username){
    return new Promise((resolve, reject)=>{
        if(u_type === 'u'){
            let item = {};
            users.findOne({username: username}, (err, ret_u)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_u){
                    resolve(null);
                }
                else {
                    legislators.findOne({code: ret_u.fed_const}, (err, rep)=>{
                        if (err) {
                            throw err;
                        }
                        else if (!rep) {
                            console.log("A significant error occured finding the rep,", ret_u.fed_const, "for user,", ret_u.username);
                            resolve(null);
                        }
                        else {
                            legislators.findOne({ code: ret_u.sen_dist }, (err, sen) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!sen) {
                                    console.log("A significant error occured finding the sen,", ret_u.sen_dist, "for user,", ret_u.username);
                                    resolve(null);
                                }
                                else {
                                    item.user = ret_u;
                                    item.rep = strip([rep], ['password', 'email', 'likes', 'dislikes'])[0];
                                    item.sen = strip([sen], ['password', 'email', 'likes', 'dislikes'])[0];
                                    resolve(item);
                                }
                            });
                        }
                    });
                }
            });
        }
        else if(u_type === 'j'){
            let item = {};
            journalists.findOne({username: username}, (err, ret_j)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_j){
                    resolve(null);
                }
                else {
                    item.user = ret_j;
                    resolve(item);
                }
            });
        }
        else if(u_type === 'l'){
            let item = {};
            legislators.findOne({code: username}, (err, ret_l)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_l){
                    resolve(null);
                }
                else {
                    districts.findOne({code: username}, (err, ret_d)=>{
                        if(err){
                            reject(err);
                        }
                        else if(!ret_d){
                            resolve(null);
                        }
                        else {
                            item.user = ret_l;
                            item.district = ret_d;
                            resolve(item);
                        }
                    });
                }
            });
        }
        else if(u_type === 'o'){
            let item = {};
            organisations.findOne({username: username}, (err, ret_o)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_o){
                    resolve(null);
                }
                else {
                    item.user = ret_o;
                    resolve(item);
                }
            });
        }
        else {
            resolve(null);
        }
    });
}

module.exports = recompile;