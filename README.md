# SOCIAL-BE-8
SeeMe Backend API

## Table of Contents
- [Description](#description)
- [Installation](#installation)
- [Usage Guide](#usage_guide)
- [Configuration](#configuration)
- [Authentication and Authorization](#authentication_authorization)
- [Error Handling](#error_handling)
- [Testing](#testing)
- [Contribution Guidelines](#contribution_guidelines)


## Description
SeeMe's backend API will follow a RESTful architecture, with endpoints organized logically to facilitate efficient data retrieval, manipulation, and communication between the client and server. The backend will be implemented using Node.js with Express.js as the web application framework.

## Installation
To get started with the backend API project, follow these steps:

1. Clone the repository to your local machine using the following command:

   git clone https://github.com/learnable-2023/SOCIAL-BE-8.git

2. Navigate to the project directory:

   cd <SOCIAL-BE-8>

3. Install the required dependencies by running the following command:

   yarn install

4. Set up the configuration file:

   - Open the `.env` file and update the necessary configuration variables such as database credentials or API keys.

5. Start the API server:

   yarn start

6. The API will now be running locally on `http://localhost:3000`. You can test the endpoints using a tool like Postman or by making HTTP requests directly.

That's it! You have successfully installed and set up the backend API project. You can now begin using the API and integrating it into your applications.



## Usage Guide
Endpoints, request formats, and response formats

POST /api/auth/signup
  ° Register a new user.
  ° Request Body: { "fullname": "fullname", "username": "example", "email": "example@example.com", "password": "examplepassword" } 
  ° Response: { user: user._id, token: token } 

POST /api/auth/login
  ° Login an existing user.
  ° Request Body: { "email": "example@example.com", "password": "examplepassword" } 
  ° Response: { user: user._id, token: token } 

GET /logout
  ° Logout an existing user.
  ° res.cookie('jwt', '', { maxAge: 1 })
  ° res.redirect('/');

POST /forgot-password
  ° Login an existing user.
  ° Request Body: { "email": "example@example.com" } 
  ° Response: { user: user._id, Token: retoken, Message: "Password reset email sent successfully!" } 

POST /api/auth/reset-password
  ° Login an existing user.
  ° Request Body: { "retoken": "retoken", "user": "userId", "password": "password", "newpassword": "newpassword" } 
  ° Response: { user: user._id } 


## Configuration
The project makes use of mongodb for storing data. A .env file already exist, but incase of creating yours, below are guideline 

1. Install MongoDB: If you haven't already, you'll need to install MongoDB on your machine. You can download it from the official MongoDB website and follow the installation instructions for your operating system.

2. Start MongoDB: Once MongoDB is installed, start the MongoDB server on your machine. The exact command may vary depending on your operating system. For example, on macOS, you can open a terminal window and run the command `mongod` to start the server.

3. Connect to MongoDB: Open another terminal window and run the command `mongo` to start the MongoDB shell. This will allow you to interact with the MongoDB server.

4. Create a Database: In the MongoDB shell, you can create a new database by running the following command:

   use your-database-name
   Replace `your-database-name` with the desired name for your database.

5. Create a Collection: A collection is a group of documents within a database. You can create a collection by running the following command in the MongoDB shell:

   db.createCollection("your-collection-name")
   Replace `your-collection-name` with the desired name for your collection.

6. Generate Connection String: To store the connection details in the `.env` file, you'll need to generate a connection string. The connection string should include the MongoDB server address, the database name, and any required authentication credentials. Here's an example of a connection string:

   MONGODB_URI=mongodb://username:password@localhost:27017/your-database-name
   Replace `username`, `password`, and `your-database-name` with your actual values.

7. Store Connection Details in .env: Create a new file named `.env` in the root directory of your project. Open the file and add the connection string from the previous step:

   MONGODB_URI=mongodb://username:password@localhost:27017/your-database-name

8. Access Connection Details: In your project code, you can access the connection details stored in the `.env` file using a library like `dotenv`. This allows you to retrieve the connection string and establish a connection to the MongoDB database.

That's it! You have now created a database in MongoDB and stored the connection details in the `.env` file.



## Authentication and Authorization
1. Authentication:
When a user wants to access the Signup API, they would first need to register an account by providing a fullname, unique username, unique email and password. Let's say our user, John, has already registered and wants to authenticate himself.

John would send a Login POST request to the Login API's authentication endpoint, providing his username and password in the request body. The API server would then verify the provided credentials against the stored user data.

If the credentials are valid, the server would generate an authentication token, such as a JWT, and send it back to John as a response. This token serves as proof of John's successful authentication.

2. Authorization:
Now that John has obtained an authentication token, he can include it in the `Authorization` header of subsequent requests to access protected resources.

Let's say John wants to create a new post. He would send a POST request to the API's post creation endpoint, including his authentication token in the `Authorization` header.

The API server would then validate the token to ensure it is still valid and has not expired. If the token is valid, the server would check John's assigned permissions to determine if he has the authorization to create a post.

If John has the necessary permissions, the server would allow the creation of the post and return a success response. Otherwise, if John lacks the required permissions, the server would return an error response indicating that he is not authorized to perform the action.

In this example, the process of authentication and authorization ensures that only registered users like John can access the API and perform actions based on their assigned permissions.



## Error Handling
We ensure a seamless experience for users navigating the SeeMe platform, where every interaction, even when things go awry, is met with clarity and guidance. Error responses will be designed for consistency across all endpoints, leveraging the power of JSON for clear communication.

signup API failed
res.status(400).json({ errors });

login API failed
res.status(400).json({ errors });

forgot password API failed
res.status(500).json({ errors });

reset password API failed
res.status(501).json({ errors });

handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { fullname: '', username: '', email: '', password: '' }
    
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
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}



## Testing
After cloning the project, run 

yarn install

yarn start

Then, open the browser and run it locally using 

localhost:3000/

depending on your port number (assuming 3000 is declared the port number)

Also make sure the .env file and database is created successfully, open Insommia (or any other application preffered for testing our api endpoint)

Test case: POST localhost:3000/api/auth/signup
   Description: Test if the API returns the correct information for a valid signup input.
   Steps:
   - Input a valid json data
    {
	    "fullname": "fullname",
        "username": "username",
        "email": "tsnsamdova@gmail.com",
        "password": "password"
    }

   - Retrieve the information returned by the API
    {
	    "user": "6640b693905949c5a0a470sdfd",
	    "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRzbnNhbWRvdmFAZ21haWwuY29tIiwiaWF0IjoxNzE1NTI4ODY0LCJleHAiOjE3MTU1MzI0NjR9.dSt8-JHT_1eXGjP4zFIRvGPf72kKBFBPg1EeNtyKO64sdfd"
    }
   - If the response is the same with the above, then its successful.

Likewise for the Login Endpoint


## Contribution Guidelines
Thank you for your interest in contributing to our project! We welcome contributions from the community to help make our project even better. Here are some guidelines on how you can contribute:

1. Reporting Bugs:
   - If you come across any bugs or issues while using our project, please submit a detailed bug report.
   - Include steps to reproduce the bug, expected behavior, and actual behavior.
   - If possible, provide screenshots or code snippets that can help us understand the issue better.
   - You can submit bug reports through our issue tracker on GitHub.

2. Requesting Features:
   - If you have a feature request or an idea to enhance our project, we would love to hear it!
   - Describe the feature or enhancement you would like to see, and explain why it would be valuable.
   - Provide any relevant details or specifications that can help us understand your request.
   - You can submit feature requests through our issue tracker on GitHub.

3. Making Code Contributions:
   - If you are interested in contributing code to our project, we encourage you to do so!
   - Fork the project repository on GitHub and create a new branch for your contribution.
   - Make your changes, ensuring they follow our coding conventions and best practices.
   - Submit a pull request with a clear description of your changes and the problem they solve.
   - Our team will review your pull request and provide feedback or merge it if it meets our criteria.

Please note that all contributions are subject to review and approval by our team. We appreciate your understanding and patience throughout the process.

By contributing to our project, you agree to abide by our code of conduct and licensing terms.

Thank you for considering contributing to our project! We value the efforts and ideas of our community members. Together, we can make our project even more successful.
