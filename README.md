# URL Shortener API with Analytics
## Overview
This project implements a scalable URL shortener API with advanced features such as detailed analytics, user authentication using Google Sign-In, and rate limiting. The system allows users to generate short URLs for long URLs, track user interactions (clicks, OS, device type), and analyze performance both individually and across topics.

### Key features of this project include:

- Google Authentication: Users can log in via Google Sign-In.
- Custom Short URL Creation: Users can create short URLs with optional custom aliases and group them under specific topics.
- URL Analytics: Provides detailed analytics for each short URL, including total clicks, unique users, OS statistics, and device usage.
- Topic-based Analytics: Users can view analytics for all URLs under a specific topic.
- Overall Analytics: Comprehensive view of user’s short URLs performance.
- Rate Limiting: Limits the number of URLs a user can shorten within a specific timeframe.
- Caching with Redis: Optimizes URL redirection and analytics data retrieval for improved performance.
  
### Features Implemented

- User Authentication:

Authentication is handled via Google Sign-In. Users can register and log in using their Google account.
Short URL Creation:

- Endpoint /api/shorten: Allows users to shorten long URLs with optional custom aliases and topics.
URL shortening supports rate limiting to prevent abuse.

- Redirect to Long URL:
Redirect users to the original long URL based on a short URL alias.

-URL Analytics:
Endpoint /api/analytics/:alias: Provides detailed analytics for a specific URL including click count, unique users, OS usage, and device type.

-Topic-based Analytics:
Endpoint /api/topicAnalytics/:topic: Get analytics for all URLs grouped under a specific topic (e.g., acquisition, retention).

-Overall Analytics:
Endpoint /api/overallAnalytics: Get a comprehensive view of the user’s total clicks, unique users, and performance across all URLs created.

- Rate Limiting:
Implemented rate limiting middleware to prevent abuse of URL shortening and analytics APIs.

### Instructions to Run the Project

1. Clone the repository
bash
Copy
Edit
git clone <repository-url>
cd <repository-directory>

2. Install Dependencies
Make sure you have Node.js and npm installed. If not, install them from nodejs.org.
npm install for both frontend and backend

3. Setup Environment Variables
Create a .env file in the root of the project with the following environment variables:

env
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
CLIENT_URL=<your-client-url>
BASE_URL=<your-base-url>
REDIS_URL=<your-redis-url>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

4. Run the Application
bash
Copy
Edit
npm start for backend and npm run dev for frontend
The server will start running on the port specified in your .env file (default is 5000).
