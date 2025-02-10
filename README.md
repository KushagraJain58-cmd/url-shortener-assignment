# URL Shortener API with Analytics

## Deployed URL

https://url-shortener-assignment.vercel.app/

### Backend deployed on Render

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

- User Authentication: Authentication is handled via Google Sign-In. Users can register and log in using their Google account.
Short URL Creation:

- Endpoint /api/shorten: Allows users to shorten long URLs with optional custom aliases and topics.
URL shortening supports rate limiting to prevent abuse.

- Redirect to Long URL: Redirect users to the original long URL based on a short URL alias.

- URL Analytics:
Endpoint /api/analytics/:alias: Provides detailed analytics for a specific URL including click count, unique users, OS usage, and device type.

- Topic-based Analytics:
Endpoint /api/topicAnalytics/:topic: Get analytics for all URLs grouped under a specific topic (e.g., acquisition, retention).

- Overall Analytics:
Endpoint /api/overallAnalytics: Get a comprehensive view of the user’s total clicks, unique users, and performance across all URLs created.

- Rate Limiting:
Implemented rate limiting middleware to prevent abuse of URL shortening and analytics APIs.

### Instructions to Run the Project

1. Clone the repository
```sh
git clone <repository-url>
cd <repository-directory>
```
2. Install Dependencies
Make sure you have Node.js and npm installed. If not, install them from nodejs.org.
For both frontend and backend
```
npm install 
```
4. Setup Environment Variables
Create a .env file in the root of the project with the following environment variables:

.env
```.env
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
CLIENT_URL=<your-client-url>
BASE_URL=<your-base-url>
REDIS_URL=<your-redis-url>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```
4. Run the Application
   
- For backend
```
npm start
```
- For frontend
```
npm run dev
```
The server will start running on the port specified in your .env file (default is 5000).

# Challenges Faced and Solutions Implemented

1. User Authentication with Google
Challenge: Setting up Google OAuth with Passport.js was challenging due to redirect URL mismatches and authentication flow issues.
Solution: The issue was resolved by correctly setting the Google OAuth credentials in the Google Developer Console and ensuring the correct redirect URI was used.
2. Rate Limiting
Challenge: Implementing rate limiting to ensure users could not spam the URL shortening feature was tricky.
Solution: Used the express-rate-limit package to throttle requests to the /api/shorten and /api/analytics endpoints, limiting the number of requests a user can make in a specific time window (e.g., 10 requests per minute).
3. Handling URL Redirection and Analytics
Challenge: Collecting detailed analytics (like OS, device, geolocation) without affecting performance was a major concern.
Solution: Used the ua-parser-js library for parsing user agent data and geoip-lite for geolocation based on IP. Analytics were stored in MongoDB, but caching was implemented using Redis to speed up access to frequently accessed URLs.
4. Database Scalability
Challenge: Ensuring the MongoDB database could scale as the number of users and URLs increased.
Solution: Implemented MongoDB indexes on frequently queried fields like userId, short, and customAlias to improve query performance and scalability.
