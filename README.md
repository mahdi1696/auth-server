
# Express Authentication Server

This project is a simple authentication server built using Express.js. It provides endpoints for user login, token generation, and session management, utilizing JWT (JSON Web Tokens) for secure authentication.

## Features

- User login with cookies
- Token generation using refresh tokens
- Token validation
- User session management
- Secure handling of authentication tokens

## API Endpoints

### 1. User Login

- **POST** `/loginCookie`
  
  Request Body:

  ```json
  {
    "userName": "string",
    "password": "string"
  }
  ```

  Response:
  - Sets a cookie with the user's session and returns the token.

### 2. Generate Access Token by Refresh Token

- **POST** `/refreshToken`
  
  Request Body:

  ```json
  {
    "refreshToken": "string"
  }
  ```

  Response:
  - Returns a new access token and refresh token.

### 3. Check Access Token

- **POST** `/checkAccessToken`
  
  Request Body:

  ```json
  {
    "token": "string"
  }
  ```

  Response:
  - Returns whether the token is valid or not.

### 4. Get Session with Refresh Token

- **GET** `/getSessionWithRefreshToken`
  
  Response:
  - Returns the user's session information if the refresh token is valid.

### 5. Get User Info

- **GET** `/getUserInfo`
  
  Response:
  - Returns user information excluding the password.

## Middleware

The project uses middleware for authentication and authorization. The `authenticationAndAuthorization` function checks if the user has the required roles and permissions.

## Error Handling

The server handles various error scenarios, returning appropriate HTTP status codes and messages for invalid requests, unauthorized access, and internal server errors.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.
