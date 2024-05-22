import express from 'express';
import userController from '../Controllers/userController.js';
import requireAuth from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', (req, res) => {
	res.send('Welcome to SeeMe App');
});
router.get('/about', (req, res) => {
	res.send('Welcome to SeeMe App About');
});
router.get('/signup', userController.signup_get);
router.get('/login', userController.login_get);
router.get('/logout', userController.logout_get);
router.post('/api/auth/signup', userController.signup_post);
router.post('/api/auth/login', userController.login_post);
// Login With Metamask
router.post('/signup-with-metamask', userController.SignUpWithMeta_post);
router.post('/login-with-metamask', userController.loginWithMeta_post);

// Forgot password route
router.post('/forgot-password', userController.forgot_password_post);
router.post('/api/auth/reset-password', userController.reset_password_post);
router.get(`/nonce`, userController.getNonce_get);
router.get('/dashboard', requireAuth, (req, res) => {
	res.send('Welcome to SeeMe App Dashboard');
});
// Friend Function Route
router.post('/find-friend', userController.Search_byTerm);
router.post('/fetch-friends', userController.retrieve_friends_post);
router.post('/add-friend', userController.add_friend_post);

export default router;
