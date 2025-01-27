# Movie App API Documentation

## Overview

This backend is a RESTful API for managing users and movies in the movie-app. It provides authentication functionality using JWT, allowing users to securely interact with their data. The app allows users to add, view, and manage their favorite movies.

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express**: Web framework for Node.js.
- **MongoDB**: Database for storing user and movie data.
- **JWT**: JSON Web Token for authentication and security.
- **Mongoose**: ODM for MongoDB.
- **dotenv**: For managing environment variables.
- **morgan**: HTTP request logger middleware for Node.js.
- **helmet**: Helps secure Express apps by setting various HTTP headers.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing (CORS).

## Environment Variables

Make sure to define the following environment variables in the `.env` file:

PORT=5000 MONGO_URI=your_mongo_connection_string JWT_SECRET=your_jwt_secret_key

## API Endpoints

### 1. **User Authentication**

#### **POST /api/auth/register**

Register a new user.

**Request Body**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
Response:

201 Created: Successfully registered the user.
400 Bad Request: Invalid user data.
POST /api/auth/login
Login an existing user and receive a JWT token.

Request Body:
{
  "email": "string",
  "password": "string"
}
Response:

200 OK: Successfully logged in, returns a JWT token.
400 Bad Request: Invalid credentials.
2. Movies
GET /api/movies
Retrieve all movies added by the authenticated user.

Request Header:
{
  "Authorization": "Bearer <JWT>"
}
Response:

200 OK: A list of all movies associated with the user.
401 Unauthorized: No token provided or invalid token.
POST /api/movies
Add a new movie to the authenticated user's list.

Request Body:
{
  "title": "string",
  "year": "number",
  "poster": "string"
}
Request Header:

json
Copy
Edit
{
  "Authorization": "Bearer <JWT>"
}
Response:

201 Created: Successfully added the movie.
400 Bad Request: Invalid movie data.
401 Unauthorized: No token provided or invalid token.
GET /api/movies/:id
Retrieve a single movie by ID.

Request Header:

{
  "Authorization": "Bearer <JWT>"
}
Response:

200 OK: A single movie object.
404 Not Found: Movie not found.
401 Unauthorized: No token provided or invalid token.
PUT /api/movies/:id
Update movie details.

Request Body:

{
  "title": "string",
  "year": "number",
  "poster": "string"
}
Request Header:

{
  "Authorization": "Bearer <JWT>"
}
Response:

200 OK: Successfully updated the movie.
400 Bad Request: Invalid data.
401 Unauthorized: No token provided or invalid token.
404 Not Found: Movie not found.
DELETE /api/movies/:id
Delete a movie by ID.

Request Header:

{
  "Authorization": "Bearer <JWT>"
}
Response:

200 OK: Successfully deleted the movie.
404 Not Found: Movie not found.
401 Unauthorized: No token provided or invalid token.
Middleware
protect
The protect middleware checks for a valid JWT token in the request headers and ensures that the user is authenticated. If the token is valid, the request is allowed to proceed. If not, the middleware returns a 401 Unauthorized error.

Example Request Headers
To interact with the secured routes, you must include the Authorization header with a valid JWT token:

{
  "Authorization": "Bearer <JWT>"
}
Error Handling
The API returns appropriate error messages for common issues such as invalid data, missing JWT tokens, or unauthorized access. Errors are returned with standard HTTP status codes.
```
