import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import { requireAuth, checkUser } from '../middleware/authMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express application
const app = express();

// Allow requests from both Netlify and Render
// const allowedOrigins = [
//     'https://seemetest.netlify.app',
//     'https://learnable-2024-group-8.onrender.com'
// ];

// Middleware setup
app.use(express.json()); // Parse JSON bodies
app.use(
	cors({
		origin: 'https://seemetest.netlify.app',
		// origin: 'http://localhost:3001',
		allowedHeaders: '*',
		allowMethods: '*',
	})
);

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

// Mount router at root path
app.use(router);

// Set port from environment variable, defaulting to 5000 if not provided
const port = process.env.PORT || 4000;

// Start server and listen on specified port
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
