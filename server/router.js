const express = require('express');
const bodyParser = require('body-parser');
const sessions = require('client-sessions');
const multer = require('multer');

const home = require('../controllers/home');
const admin = require('../controllers/admin');
const admin_render = require('../controllers/admin-render');
const org_signup = require('../controllers/org-signup');
const org_signin = require('../controllers/org-signin');
const render_u_signup = require('../controllers/u-signup-render');
const render_u_dists = require('../controllers/u-district-render');
const check_username = require('../controllers/check-username');
const check_email = require('../controllers/check-email');
const check_corr_email = require('../controllers/check-corr-email');
const u_signup = require('../controllers/u-signup');
const u_signin = require('../controllers/u-signin');
const j_signup = require('../controllers/j-signup');
const j_signin = require('../controllers/j-signin');
const select_f_beat = require('../controllers/select-f-beat');
const select_org = require('../controllers/select-org');
const handleJReq = require('../controllers/org-j-requests');
const assignOrgBeat = require('../controllers/org-assign-beat');
const l_signin = require('../controllers/l-signin');
const m_handler = require('../controllers/message');
const follow = require('../controllers/follow');
const logout = require('../controllers/logout');

const router = express.Router();
const logos = multer({dest: 'public/logos/'});
const u_avatars = multer({dest: 'public/u_avatars/'});
const j_avatars = multer({dest: 'public/j_avatars/'});

router.use(sessions({
    cookieName: 'notifications',
    secret: 'some random alphanumeric 123456 string with some special characters /**\\kl^%/'
}));

router.use(sessions({
    cookieName: 'organisation',
    duration: 30*24*60*60*1000,
    secret: '\\l;868798$#@^*\\'
}));

router.use(sessions({
    cookieName: 'legislator',
    duration: 30*24*60*60*1000,
    secret: '\\l;8687+-98$#@^*\\'
}));

router.use(sessions({
    cookieName: 'journalist',
    duration: 30*24*60*60*1000,
    secret: '\\l:()8687+-98$#@^*\\'
}));

router.use(sessions({
    cookieName: 'user',
    duration: 30*24*60*60*1000,
    secret: '\\l;868798!#@$%$^%$#@^*\\'
}));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

router.get('/', home);

router.get('/admin', admin_render);

router.post('/admin', admin);

router.get('/organisations', (req, res)=>{
    res.render('organisations');
});

router.get('/organisations/signup', (req, res)=>{
    res.render('org-signup');
});

router.post('/organisations/signup', logos.single('logo'), org_signup);

router.get('/organisations/signin', (req, res)=>{
    res.render('org-signin');
});

router.post('/organisations/signin', org_signin);

router.get('/journalists', (req, res)=>{
    res.render('journalists');
});

router.get('/journalists/signin', (req, res)=>{
    res.render('j-signin');
});

router.post('/journalists/signin', j_signin);

router.post('/journalists/signup', j_avatars.single('avatar'), j_signup);

router.get('/legislators', (req, res)=>{
    res.render('l-signin');
});

router.post('/legislators/signin', l_signin);

router.get('/users/signup', render_u_signup);

router.get('/users/signin', (req, res)=>{
    res.render('u-signin');
});

router.get('/users/check/:username', check_username);

router.get('/users/checkEmail/:email', check_email);

router.get('/users/checkCorrEmail/:email', check_corr_email);

router.get('/users/signup/districts/:key', render_u_dists);

router.post('/users/signup', u_avatars.single('avatar'), u_signup);

router.post('/users/signin', u_signin);

router.get('/select-beat/:username/:beat', select_f_beat);

router.get('/organisations/request/:organisation/:username', select_org);

router.get('/organisations/j-requests/:type/:username/:j_username', handleJReq);

router.get('/organisations/select-beat/:o_username/:j_username/:code', assignOrgBeat);

router.post('/messages/:type', m_handler);

router.post('/follow/:type/:org_type/:username', follow);

router.get('/logout/:type', logout);

module.exports = router;

/*
    Change AJAXed messages to new format
    Eliminate annoying, you have no prior posts post AJAX entry
    
*/