const districts = require('../schemas/districts');

function serve(req, res) {
    districts.find().sort({state: 1, name: 1}).exec((err, ret_ds) => {
        if (err) {
            res.send(JSON.stringify({ success: false, reason: "An error occured in retrieving districts. Please try again later" }));
            throw err;
        }
        else {
            let st_arr = [];
            ret_ds.forEach(ret_d => {
                let input_index = st_arr.length;
                for (let i = 0; i < st_arr.length; i++) {
                    let st = st_arr[i];
                    if (st.name == ret_d.state) {
                        input_index = i;
                    }
                }
                let d_type = ret_d.type;
                
                if (st_arr[input_index]) {
                    if(d_type === 'sen'){
                        st_arr[input_index].sen_dists.push({ name: ret_d.name, code: ret_d.code });
                    }
                    else {
                        st_arr[input_index].fed_consts.push({ name: ret_d.name, code: ret_d.code });
                    }
                }
                else {
                    if(d_type === 'sen'){
                        st_arr[input_index] = {
                            name: ret_d.state,
                            sen_dists: [{ name: ret_d.name, code: ret_d.code }],
                            fed_consts: []
                        }
                    }
                    else {
                        st_arr[input_index] = {
                            name: ret_d.state,
                            fed_consts: [{ name: ret_d.name, code: ret_d.code }],
                            sen_dists: []
                        }
                    }
                }
            });
            res.send({ success: true, states: st_arr });
        }
    });
}

module.exports = serve;