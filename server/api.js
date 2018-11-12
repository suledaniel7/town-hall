const express = require('express');
const bodyParser = require('body-parser');
const sessions = require('client-sessions');
// const multer = require('multer');

const home = require('../controllers/api/home');
const org_signup = require('../controllers/api/org-signup');
const org_signin = require('../controllers/api/org-signin');
const render_u_signup = require('../controllers/api/u-signup-render');
const render_u_dists = require('../controllers/api/u-district-render');
const check_username = require('../controllers/api/check-username');
const check_email = require('../controllers/api/check-email');
const check_corr_email = require('../controllers/api/check-corr-email');
const u_signup = require('../controllers/api/u-signup');
const u_signin = require('../controllers/api/u-signin');
const j_signup = require('../controllers/api/j-signup');
const j_signin = require('../controllers/api/j-signin');
const select_f_beat = require('../controllers/api/select-f-beat');
const select_org = require('../controllers/api/select-org');
const handleJReq = require('../controllers/api/org-j-requests');
const assignOrgBeat = require('../controllers/api/org-assign-beat');
const l_signin = require('../controllers/api/l-signin');
const m_handler = require('../controllers/api/message');
const follow = require('../controllers/api/follow');
const unfollow = require('../controllers/api/unfollow');
const logout = require('../controllers/api/logout');
const search = require('../controllers/api/search');
const profile = require('../controllers/api/profile');
const autofill = require('../controllers/api/autofill');
const serve_trends = require('../controllers/api/serve_trends');
const post_comment = require('../controllers/api/comments_post');
const serve_comments = require('../controllers/api/comments_serve');
const edit = require('../controllers/api/edit');
const deleteFn = require('../controllers/api/delete');
const reportFn = require('../controllers/api/report');
const signin = require('../controllers/api/signin');
const signedIn = require('../controllers/api/signed_in');

const router = express.Router();
// const logos = multer({dest: 'public/logos/'});
// const u_avatars = multer({dest: 'public/u_avatars/'});
// const j_avatars = multer({dest: 'public/j_avatars/'});

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

router.post('/signin', signin);

router.get('/signed-in', signedIn);

router.post('/organisations/signup', org_signup);

router.post('/organisations/signin', org_signin);

router.post('/journalists/signin', j_signin);

router.post('/journalists/signup', j_signup);

router.post('/legislators/signin', l_signin);

router.get('/users/signup', render_u_signup);

router.get('/users/check/:username', check_username);

router.get('/users/checkEmail/:email', check_email);

router.get('/users/checkCorrEmail/:email', check_corr_email);

router.get('/users/signup/districts/:key', render_u_dists);

router.post('/users/signup', u_signup);

router.post('/users/signin', u_signin);

router.get('/select-beat/:username/:beat', select_f_beat);

router.get('/organisations/request/:organisation/:username', select_org);

router.get('/organisations/j-requests/:type/:username/:j_username', handleJReq);

router.get('/organisations/select-beat/:o_username/:j_username/:code', assignOrgBeat);

router.post('/messages/:type', m_handler);

router.post('/follow/:username', follow);

router.post('/unfollow/:username', unfollow);

router.get('/search/:type/:term', search);

router.get('/profile/:username', profile);

router.post('/autofill', autofill);

router.post('/request-trends', serve_trends);

router.post('/comments/post', post_comment);

router.post('/request-comments', serve_comments);

router.post('/edit/:m_type/:timestamp', edit);

router.post('/delete/:m_type/:timestamp', deleteFn);

router.post('/report/:m_type/:timestamp', reportFn);

router.get('/logout/:type', logout);

router.all('*', (req, res)=>{
    res.send(JSON.stringify({server_response: 'Invalid API Route'}));
});

module.exports = router;