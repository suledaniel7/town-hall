function render(req, res) {
    let isNotif = req.notifications.isNotif;
    let notifText = req.notifications.notif;

    if (notifText) {
        if (isNotif) {
            res.render('update_l', { notif: notifText });
        }
        else {
            res.render('update_l', { error: notifText });
        }
    }
    else {
        res.render('update_l');
    }
    clear();

    function clear() {
        req.notifications.notif = null;
    }
}

module.exports = render;