import mongoose from 'mongoose';
import pkg from 'validator';
import bcrypt from 'bcrypt';

const { isEmail } = pkg;

const UserSchema = new mongoose.Schema(
	{
		fullname: {
			type: String,
			required: function () {
				return !this.unique_wallet; // fullname is required if unique_wallet is not present
			},
		},
		username: {
			type: String,
			unique: true,
			required: function () {
				return !this.unique_wallet; // username is required if unique_wallet is not present
			},
		},
		email: {
			type: String,
			required: function () {
				return !this.unique_wallet; // email is required if unique_wallet is not present
			},
			unique: true,
			sparse: true,
			lowercase: true,
			validate: [isEmail, 'Please enter a valid email'],
		},
		password: {
			type: String,
			required: function () {
				return !this.unique_wallet; // password is required if unique_wallet is not present
			},
			minlength: [6, 'Minimum password length is 6'],
		},
		profile_picture: {
			type: Buffer,
		},
		unique_wallet: {
			type: String,
			unique: true,
		},

		friends: [
			{
				_id: mongoose.Schema.Types.ObjectId,
				fullname: String,
				username: String,
				email: String,
				unique_wallet: String,
			},
		],
	},
	{
		timestamps: true,
	}
);

UserSchema.pre('save', async function (next) {
	if (this.password) {
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(this.password, salt);
	}
	next();
});

UserSchema.statics.login = async function (username, password) {
	const user = await this.findOne({ username });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error('incorrect password');
	}
	throw Error('incorrect username');
};

UserSchema.statics.forgot = async function (email) {
	const user = await this.findOne({ email });
	if (user) {
		return user;
	}
	throw Error('email not registered');
};

UserSchema.statics.reset = async function (
	retoken,
	userId,
	password,
	newpassword,
	retokenValue
) {
	const user = await this.findOne({ userId });
	const auth = await bcrypt.compare(password, user.password);
	if (retokenValue === retoken) {
		if (password === newpassword) {
			// Check if the password and new password are the same

			if (auth) {
				// return user;
				return res.status(400).json({
					message: 'New password must be different from the old password',
				});
			} else {
				// Update the password in the User table using the supplied userId
				const salt = await bcrypt.genSalt();
				const hashedPassword = await bcrypt.hash(password, salt);
				await User.updateOne({ _id: userId }, { password: hashedPassword });

				res.status(200).json({ message: 'Password reset successful' });
			}
		} else {
			res
				.status(409)
				.json({ message: 'Password does not match retype password' });
		}
	}
	// throw Error('Invalid reset token')
	return res.status(407).json({ message: 'Invalid reset token' });
};

const User = mongoose.model('User', UserSchema);

export default User;
