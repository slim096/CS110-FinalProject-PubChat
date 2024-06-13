# PubChat Web-Application (Extended Lab 7)

PubChat is a real-time chat application where users can sign up, log in, and join chat rooms to communicate with each other.

## Features

- User Authentication (Sign up, Log in, Log out)
- Real-time Messaging
- Create and Join Chat Rooms
- Google OAuth Authentication
- Edit and Delete Messages
- Message Search

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)

## Installation

### 1. Clone the repository

You can either manually download the zip file or clone the repository using the following command:

```bash
git clone <repository-link>
cd <repository-directory>
```

### 2. Install dependencies

Install the necessary dependencies using npm:

```bash
npm install
```

### 3. Configure environment variables

Create a '.env' file in the root directory of the project and add the following environment variables. Replace the placeholder values with your own details:

```bash
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### 4. Run the application

```bash
npm start
```

### 5. Access the web-application

Open your web browser and navigate to http://localhost:3000

### 6. Using the Web-application

- **Sign Up**: Create a new account
- **Log In**: Log in with your credentials
- **Chat**: Join or create chat rooms, send messages, and interact with other users.

## Contribution

- Noel Kim
- Solomon Lim

We worked on the code together and implemented the features based on the Extended Lab 7
