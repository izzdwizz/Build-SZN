import User from '../models/User.js';
import Friend from '../models/Friend.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { verifyMessage } from 'ethers';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Import uuid library

// handle errors

const SECRET_KEY = process.env.SECRET_KEY;
const handleErrors = (err) => {
	console.log(err.message, err.code);
	let errors = { fullname: '', username: '', email: '', password: '' };

	// incorrect email
	if (err.message === 'email not registered') {
		errors.email = 'Email does not exist';
	}

	// incorrect email
	if (err.message === 'incorrect email') {
		errors.email = 'that email is not registered';
	}

	// incorrect password
	if (err.message === 'incorrect password') {
		errors.password = 'that password is incorrect';
	}

	//duplicate error code
	if (err.code === 11000) {
		errors.email = 'Email already registered';
		return errors;
	}

	// validation errors
	if (err.message.includes('user validation failed')) {
		Object.values(err.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
	}

	return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
	return jwt.sign({ id }, 'secret', {
		expiresIn: maxAge,
	});
};

// token for mail
function generateToken(email) {
	const retoken = jwt.sign({ email }, 'recovery-token-group8', {
		expiresIn: '1h',
	});
	return retoken;
}

// Send password reset email
async function sendPasswordResetEmail(email, retoken, userId) {
	// Create a transporter object using Gmail SMTP
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'tsnsamdova@gmail.com',
			pass: 'yeuencpbmirbvyrj',
		},
	});

	// Email options
	const mailOptions = {
		from: 'SeeMe',
		to: email,
		subject: 'Password Reset Request', // Update the subject
		text: `Click the link to reset your password: https://seemetest.netlify.app/reset-password?token=${retoken}&userId=${userId}`,
	};

	// Send the email
	await transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Error:', error.message);
		} else {
			console.log('Email sent:', info.response);
		}
	});
}

// Function to generate a random unique wallet ID
function generateUniqueWalletID() {
	const characters =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const length = 10;
	let uniqueWalletID = '';
	for (let i = 0; i < length; i++) {
		uniqueWalletID += characters.charAt(
			Math.floor(Math.random() * characters.length)
		);
	}
	return uniqueWalletID;
}

// Define your controller functions within the userController object
const userController = {
	signup_get: (req, res) => {
		res.send('signup pages');
	},
	login_get: (req, res) => {
		res.send('login page');
	},
	signup_post: async (req, res) => {
		const { fullname, username, email, password } = req.body;
		const unique_wallet = generateUniqueWalletID();
		try {
			const user = await User.create({
				fullname,
				username,
				email,
				password,
				unique_wallet,
			});
			const token = createToken(user._id);
			res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
			res.status(201).json({ user, token });
		} catch (err) {
			const errors = handleErrors(err);
			res.status(400).json({ errors });
		}
	},
	// LOGIN
	login_post: async (req, res) => {
		const { username, password } = req.body;

		try {
			const user = await User.login(username, password);
			const token = createToken(user._id);
			res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
			res.status(201).json({ user, token });
			// console.log('user login successful')
		} catch (err) {
			const errors = handleErrors(err);
			res.status(400).json({ errors });
		}
	},
	logout_get: (req, res) => {
		res.cookie('jwt', '', { maxAge: 1 });
		res.redirect('/');
	},
	forgot_password_post: async (req, res) => {
		const { email } = req.body;
		const maxAge = 60 * 60; // 1 hour in seconds
		const tokenExpiration = maxAge * 1000; // Convert to milliseconds

		try {
			const user = await User.forgot(email);
			const userId = user._id;
			const retoken = generateToken(email);
			res.cookie('jwtt', retoken, { httpOnly: true, maxAge: tokenExpiration });
			sendPasswordResetEmail(email, retoken, userId);
			res.status(201).json({ user: user._id, Token: retoken });
			console.log('Password reset email sent successfully!');
		} catch (err) {
			const errors = handleErrors(err);
			res.status(500).json({ errors });
			console.log(err.message);
		}
	},
	reset_password_post: async (req, res) => {
		const { retoken, userId, password, newpassword } = req.body;

		try {
			const retokenValue = req.cookies.jwtt;
			const user = await User.reset(
				retoken,
				userId,
				password,
				newpassword,
				retokenValue
			);
			res.status(206).json({ user: user._id, token: token });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: 'Failed to reset password' });
		}
	},
	// METAMASK LOGIN
	getNonce_get: async (req, res) => {
		const nonce = crypto.randomBytes(32).toString('hex');
		res.json({ nonce });
	},
	loginWithMeta_post: async (req, res) => {
		const { signedMessage, message, address } = req.body;

		// Verify the signature
		const recoveredAddress = verifyMessage(message, signedMessage);
		if (recoveredAddress !== address) {
			return res.status(401).json({ error: 'Invalid Signature' });
		}

		// Check if the address exists in the database
		try {
			const user = await User.findOne({ unique_wallet: address });
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			// Create a JWT token
			const metaPayload = { address };
			const token = jwt.sign(metaPayload, SECRET_KEY, { expiresIn: '1h' });

			// Respond with the token
			return res.json({ user, token });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Server error' });
		}
	},
	SignUpWithMeta_post: async (req, res) => {
		const { signedMessage, message, address } = req.body;
		const recoveredAddress = verifyMessage(message, signedMessage);
		if (recoveredAddress != address) {
			return res.status(401).json({ error: 'Invalid Signature' });
		}

		if (!address) {
			res.status(401).json({ error: 'Install Metamask and login with it' });
		} else {
			console.log('god abeg');
		}

		const metaPayload = { address };
		const token = jwt.sign(metaPayload, SECRET_KEY, { expiresIn: '1h' });
		const user = await User.create({
			unique_wallet: address,
		});
		res.json({ user, token });
	},
	Search_byTerm: async (req, res) => {
		const { searchTerm } = req.body;

		try {
			let user;

			// Check if the searchTerm is a valid MongoDB ObjectID
			if (mongoose.Types.ObjectId.isValid(searchTerm)) {
				// Search by ID
				user = await User.findById(searchTerm);
			} else {
				// Search by unique wallet address
				user = await User.findOne({ unique_wallet: searchTerm });
			}

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			return res.json(user);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Server error' });
		}
	},

	// ALTERNATIVE METHOD
	// add_friend_post: async (req, res) => {
	// 	try {
	// 		const { userId, searchTerm } = req.body;
	// 		// let user;
	// 		// let friend;
	// 		console.log(userId, searchTerm);
	// 		const user = await User.findById(userId);
	// 		// Search by ID
	// 		// const user = await User.findOne({ unique_wallet: userId });
	// 		const friend = await User.findById(searchTerm);

	// 		console.log(user, friend);
	// 		if (!user || !friend) {
	// 			return res
	// 				.status(404)
	// 				.json({ error: 'Create an account and find your Friend' });
	// 		}

	// 		// Check if the friend is already added
	// 		const existingFriend = user.friends.find((f) => f._id.equals(friend._id));
	// 		if (existingFriend) {
	// 			return res.status(400).json({ error: 'Friend already added' });
	// 		}

	// 		user.friends.push(friend);
	// 		await user.save();

	// 		res.json(user.friends);
	// 	} catch (error) {
	// 		res.status(500).json({ error: 'Internal Server Error' });
	// 		console.log(error);
	// 	}
	// },

	add_friend_post: async (req, res) => {
		try {
			const { userId, searchTerm } = req.body;

			console.log(userId, searchTerm);

			const user = await User.findById(userId);
			const friend = await User.findById(searchTerm);

			console.log(user, friend);

			if (!user || !friend) {
				return res
					.status(404)
					.json({ error: 'Create an account and find your Friend' });
			}

			// Check if the friend is already added
			const existingFriend = user.friends.find((f) => f._id == friend._id);
			if (existingFriend) {
				return res.status(400).json({ error: 'Friend already added' });
			}

			// Push the entire friend object
			user.friends.push({
				_id: friend._id,
				fullname: friend.fullname,
				username: friend.username,
				email: friend.email,
				unique_wallet: friend.unique_wallet,
			});

			friend.friends.push({
				_id: user._id,
				fullname: user.fullname,
				username: user.username,
				email: user.email,
				unique_wallet: user.unique_wallet,
			});

			await user.save();
			await friend.save();

			res.json(user.friends);
		} catch (error) {
			res.status(500).json({ error: 'Internal Server Error' });
			console.log(error);
		}
	},

	retrieve_friends_post: async (req, res) => {
		try {
			const { userId } = req.body;
			const user = await User.findById(userId);

			console.log(user);
			if (!user) {
				res.json({ error: 'User not found' });
			}
			let friendList = user.friends;
			res.json(friendList);
			console.log(user.friends);
		} catch (error) {
			console.log(error);
		}
	},

	// add_friend_post: async (req, res) => {
	// 	try {
	// 		const { userId, friendId, friends_unique_wallet } = req.body;
	// 		console.log(`Received userId: ${userId}, friendId: ${friendId}`);

	// 		// Find the user by their ID
	// 		const user = await User.findById(userId);
	// 		if (!user) {
	// 			console.log('User not found');
	// 			return res.status(404).json({ message: 'User not found' });
	// 		}

	// 		// Find the friend by their ID
	// 		const friend = await User.findById(friendId);
	// 		if (!friend) {
	// 			console.log('Friend not found');
	// 			return res.status(404).json({ message: 'Friend not found' });
	// 		}

	// 		// Find or create the user's Friend document
	// 		let userFriends = await Friend.findOne({ userId: user._id });
	// 		if (!userFriends) {
	// 			userFriends = new Friend({
	// 				userId: user._id,
	// 				username: user.username,
	// 				friends: [],
	// 			});
	// 		}

	// 		// Find or create the friend's Friend document
	// 		let friendFriends = await Friend.findOne({ userId: friend._id });
	// 		if (!friendFriends) {
	// 			friendFriends = new Friend({
	// 				userId: friend._id,
	// 				username: friend.username,
	// 				friends: [],
	// 			});
	// 		}

	// 		// Initialize friends arrays if undefined
	// 		if (!Array.isArray(userFriends.friends)) {
	// 			userFriends.friends = [];
	// 		}
	// 		if (!Array.isArray(friendFriends.friends)) {
	// 			friendFriends.friends = [];
	// 		}

	// 		// Check if the friend is already added to the user's list
	// 		if (
	// 			userFriends.friends.some(
	// 				(f) => f.friendId.toString() === friend._id.toString()
	// 			)
	// 		) {
	// 			console.log("Friend already added to the user's list");
	// 			return res
	// 				.status(400)
	// 				.json({ message: "Friend already added to the user's list" });
	// 		}

	// 		// Check if the user is already added to the friend's list
	// 		if (
	// 			friendFriends.friends.some(
	// 				(f) => f.friendId.toString() === user._id.toString()
	// 			)
	// 		) {
	// 			console.log("User already added to the friend's list");
	// 			return res
	// 				.status(400)
	// 				.json({ message: "User already added to the friend's list" });
	// 		}

	// 		// Add the friend to the user's friends list
	// 		userFriends.friends.push({
	// 			friendId: friend._id.toString(),
	// 			friendName: friend.fullname,
	// 			friendUsername: friend.username,
	// 			friendEmail: friend.email,
	// 			friendunique_wallet: friends_unique_wallet, // Generating a new unique wallet if not present
	// 		});

	// 		// Add the user to the friend's friends list
	// 		friendFriends.friends.push({
	// 			friendId: user._id.toString(),
	// 			friendName: user.fullname,
	// 			friendUsername: user.username,
	// 			friendEmail: user.email,
	// 			friendunique_wallet: user.unique_wallet, // Generating a new unique wallet if not present
	// 		});

	// 		// Save both Friend documents
	// 		await userFriends.save();
	// 		await friendFriends.save();

	// 		console.log('Friends added successfully');
	// 		return res.status(200).json({ message: 'Friends added successfully' });
	// 	} catch (error) {
	// 		console.error(error);
	// 		return res.status(500).json({ error });
	// 	}
	// },
};
export default userController;
