const express = require('express');
const bodyParser = require('body-parser');
const sessions = require('client-sessions');
const multer = require('multer');

const auth = require('../controllers/api/authenticate');
const home = require('../controllers/api/home');
const org_signup = require('../controllers/api/org-signup');
const org_signin = require('../controllers/api/org-signin');
const render_u_signup = require('../controllers/api/u-signup-render');
const render_u_dists = require('../controllers/api/u-district-render');
const check_username = require('../controllers/api/check-username');
const check_email = require('../controllers/api/check-email');
const check_corr_email = require('../controllers/api/check-corr-email');
const check_v_id = require('../controllers/api/check-v-id');
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
const sel_org_render = require('../controllers/api/select-org-render');
const sel_beat_render = require('../controllers/api/select-beat-render');
const load_images = require('../controllers/api/load-images');
const msg_req = require('../controllers/api/message_req');
const send_type = require('../controllers/api/send_type');
const settings = require('../controllers/api/settings');
const update = require('../controllers/api/update');
const orgReassignBeat = require('../controllers/api/org-reassign-beat');
const orgReassignBeatRender = require('../controllers/api/org-reassign-beat-render');
const removeJ = require('../controllers/api/remove_journo');
const reqJs = require('../controllers/api/req_js');
const followers = require('../controllers/api/followers');
const findMention = require('../controllers/api/findMention');
const downloadFile = require('../controllers/api/downloadFile');
const finalizeUpload = require('../controllers/api/finalizeUpload');
const serve_dists = require('../controllers/api/serve_dists');
const set_bio = require('../controllers/api/set_bio');
const j_status = require('../controllers/api/j_status');
const rejection = require('../controllers/api/rejection');
const authorized = require('../controllers/api/authorized');
const dm = require('../controllers/api/dm');
const dms = require('../controllers/api/dms');
const conversation = require('../controllers/api/conversation');
const block = require('../controllers/api/block');
const log_err = require('../controllers/api/error_logging');
const serve_legs = require('../controllers/api/serve_legislators');
const create_legis = require('../controllers/api/create_legislation');
const serve_legislation = require('../controllers/api/serve_legislation');
const l_leg_info = require('../controllers/api/l_leg_info');
const edit_leg = require('../controllers/api/edit_legislation');
const edit_leg_stat = require('../controllers/api/edit_legis_status');
const edit_legis_render = require('../controllers/api/edit_legis_render');
const serve_convo = require('../controllers/api/serve_conversation');
const post_convo = require('../controllers/api/post_convo');

const router = express.Router();
// const logos = multer({dest: 'public/logos/'});
// const u_avatars = multer({dest: 'public/u_avatars/'});
const avs = multer({dest: 'public/tmp_avatars/'});
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

router.get('/', auth, home);

router.post('/signin', signin);

router.get('/signed-in', auth, signedIn);

router.post('/organisations/signup', org_signup);

router.post('/organisations/signin', org_signin);

router.post('/journalists/signin', j_signin);

router.post('/journalists/signup', j_signup);

router.get('/journalists/orgs/', auth, sel_org_render);

router.get('/journalists/beats/', auth, sel_beat_render);

router.post('/legislators/signin', l_signin);

router.get('/users/signup', render_u_signup);

router.get('/users/check/:username', check_username);

router.get('/users/checkEmail/:email', check_email);

router.get('/users/checkCorrEmail/:email', check_corr_email);

router.get('/users/checkVId/:v_id', check_v_id);

router.get('/users/signup/districts/:key', render_u_dists);

router.post('/users/signup', u_signup);

router.post('/users/signin', u_signin);

router.post('/select-beat/', auth, select_f_beat);

router.post('/organisations/request/', auth, select_org);

router.get('/organisations/j-requests/:type/:username/:j_username', auth, handleJReq);

router.get('/organisations/select-beat/:o_username/:j_username/:code', auth, assignOrgBeat);

router.post('/messages/:type', auth, m_handler);

router.post('/follow/:username', auth, follow);

router.post('/unfollow/:username', auth, unfollow);

router.get('/search/:type/:term', auth, search);

router.get('/profile/:username', auth, profile);

router.post('/autofill', autofill);

router.post('/request-trends', serve_trends);

router.post('/comments/post', auth, post_comment);

router.post('/request-comments', auth, serve_comments);

router.post('/edit/:m_type/:timestamp', auth, edit);

router.post('/delete/:m_type/:timestamp', auth, deleteFn);

router.post('/report/:m_type/:timestamp', auth, reportFn);

router.get('/img-load', auth, load_images);

router.get('/req-msg/:m_type/:timestamp', auth, msg_req);

router.get('/req-type/:username', auth, send_type);

router.get('/settings', auth, settings);

router.post('/update/:u_type', auth, update);

router.get('/organisations/reassign/:j_username', auth, orgReassignBeatRender);

router.post('/organisations/req-js/:r_type', auth, reqJs);

router.get('/organisations/reassign-beat/:o_username/:j_username/:code', auth, orgReassignBeat);

router.get('/organisations/remove_j/:username', auth, removeJ);

router.get('/followers/:username', auth, followers);

router.post('/isUser', auth, findMention);

router.post('/upload_img', auth, avs.single('avatar'), downloadFile);

router.post('/upload_conf', auth, finalizeUpload);

router.get('/serve-districts', serve_dists);

router.post('/set-bio', auth, set_bio);

router.get('/j-stat', auth, j_status);

router.post('/rejection', auth, rejection);

router.post('/authorized', authorized);

router.post('/dm', auth, dm);

router.post('/dms', auth, dms);

router.post('/conversation', auth, conversation);

router.post('/block/:b_type', auth, block);

router.post('/trans-err', log_err);

router.get('/serve-legislators', serve_legs);

router.post('/create-legislation', auth, create_legis);

router.get('/serve-legislation', auth, serve_legislation);

router.get('/l-leg-info/:code', auth, l_leg_info);

router.post('/edit-legislation', auth, edit_leg);

router.post('/edit-leg-stat', auth, edit_leg_stat);

router.post('/edit-leg-render', edit_legis_render);

router.get('/serve-conversations/:code', auth, serve_convo);

router.post('/post-convo', auth, post_convo);

router.get('/logout', auth, logout);

router.all('*', (req, res)=>{
    res.send(JSON.stringify({success: false, reason: 'Invalid API Route', route: `${req.url}`, server_response: 'Invalid API Route'}));
    console.log("Invalid API Route:", req.url);
});

module.exports = router;