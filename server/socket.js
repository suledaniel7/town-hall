const generals = require('../controllers/schemas/general');
const acquisition = require('../controllers/api/acquire_audience');
const messages = require('../controllers/schemas/messages');
// const users = require('../controllers/schemas/users');
// const journalists = require('../controllers/schemas/journalists');
// const legislators = require('../controllers/schemas/legislators');
// const organisations = require('../controllers/schemas/organisations');
// const findType = require('../controllers/findType');

function socketFn(socket) {
    socket.on('conn', (data) => {
        let username = data.username;
        let id = socket.id;

        generals.findOne({ username: username }, (err, ret_g) => {
            if (err) {
                throw err;
            }
            else if (ret_g) {
                ret_g.online = true;
                ret_g.socket_id = id;

                generals.findOneAndUpdate({ username: username }, ret_g, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        });

        // findType(username).then(u_type =>{
        //     if(u_type === 'user'){
        //         users.findOne({username: username}, (err, ret_u)=>{
        //             if(err){
        //                 throw err;
        //             }
        //             else if(ret_u){
        //                 ret_u.online = true;
        //                 ret_u.socket_id = id;
        //                 users.findOneAndUpdate({username: username}, ret_u, (err)=>{
        //                     if(err){
        //                         throw err;
        //                     }
        //                 });
        //             }
        //         });
        //     }
        //     else if(u_type === 'journalist'){
        //         journalists.findOne({username: username}, (err, ret_j)=>{
        //             if(err){
        //                 throw err;
        //             }
        //             else if(ret_j){
        //                 ret_j.online = true;
        //                 ret_j.socket_id = id;
        //                 journalists.findOneAndUpdate({username: username}, ret_j, (err)=>{
        //                     if(err){
        //                         throw err;
        //                     }
        //                 });
        //             }
        //         });
        //     }
        //     else if(u_type === 'legislator'){
        //         legislators.findOne({code: username}, (err, ret_l)=>{
        //             if(err){
        //                 throw err;
        //             }
        //             else if(ret_l){
        //                 ret_l.online = true;
        //                 ret_l.socket_id = id;
        //                 legislators.findOneAndUpdate({code: username}, ret_l, (err)=>{
        //                     if(err){
        //                         throw err;
        //                     }
        //                 });
        //             }
        //         });
        //     }
        //     else if(u_type === 'organisation'){
        //         organisations.findOne({username: username}, (err, ret_o)=>{
        //             if(err){
        //                 throw err;
        //             }
        //             else if(ret_o){
        //                 ret_o.online = true;
        //                 ret_o.socket_id = id;
        //                 organisations.findOneAndUpdate({username: username}, ret_o, (err)=>{
        //                     if(err){
        //                         throw err;
        //                     }
        //                 });
        //             }
        //         });
        //     }
        // }).catch(err =>{
        //     console.log("No user found for user with username: " + username);
        // });
    });

    socket.on('message_sent', (data) => {
        let id = socket.id;
        // let username = data.username;
        let timestamp = data.timestamp;
        let beats = data.beats;
        console.log(id);

        messages.findOne({ m_timestamp: timestamp }, (err, ret_m) => {
            if (err) {
                throw err;
            }
            else if (ret_m) {
                socket.to(id).emit('self_message', { message: ret_m })
                acquisition(id, timestamp, beats).then((audience) => {
                    console.log("Audience: ", audience);
                    if (audience) {
                        if (audience.length > 0) {
                            for (let i = 0; i < audience.length; i++) {
                                let person = audience[i];
                                socket.to(person.socket_id).emit('message', { page: person.pg, message: ret_m });
                            }
                        }
                    }
                }).catch(err => {
                    console.log("An error occured during acquistion. Socket.js in server. Error: " + err);
                });
            }
        });
    });

    socket.on('disconnect', () => {
        let socket_id = socket.id;
        generals.findOne({ socket_id: socket_id }, (err, ret_g) => {
            if (err) {
                throw err;
            }
            else if (ret_g) {
                ret_g.online = false;
                ret_g.socket_id = '';

                generals.findOneAndUpdate({ socket_id: socket_id }, ret_g, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    });
}

module.exports = socketFn;