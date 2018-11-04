const instants = require('../schemas/instants');

function autofill(req, res) {
    let partTerm = req.body.term;
    partTerm = RegExp(partTerm);

    instants.find({ name: partTerm }).sort({ mentions: -1 }).exec((err, ret_is) => {
        if (err) {
            throw err;
        }
        else {
            let sent_is = [];
            if (ret_is.length > 5) {
                for (let i = 0; i < 5; i++) {
                    sent_is.push(ret_is[i]);
                }
            }
            else {
                sent_is = ret_is;
            }

            res.send({ data: sent_is });
        }
    });
}

module.exports = autofill;