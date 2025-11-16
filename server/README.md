# My Shiurim Project

## Overview
This project is a web application designed to manage and serve Jewish educational content, specifically shiurim (lectures). It allows users to sign up, log in, manage their favorites, and receive personalized RSS feeds based on their interests.

## Project Structure
The project is organized into several directories and files, each serving a specific purpose:

- **src/**: Contains the main application code.
  - **controllers/**: Contains the logic for handling requests and responses.
    - `authController.js`: User authentication functions (signup, login, password reset).
    - `rssController.js`: Logic for generating and serving user-specific RSS feeds.
    - `shiurController.js`: Manages operations related to shiurim.
    - `userController.js`: Handles user-related functionalities.
    - `adminController.js`: Admin-specific operations.
  - **models/**: Defines Mongoose schemas and models.
    - `Rabbi.js`: Schema for Rabbi entity.
    - `Shiur.js`: Schema for Shiur entity.
    - `User.js`: Schema for User entity.
  - **routes/**: Sets up the application routes.
    - `admin.js`: Admin-related routes.
    - `auth.js`: Authentication routes.
    - `rss.js`: Routes for serving RSS feeds.
    - `shiur.js`: Shiur-related routes.
    - `user.js`: User-related routes.
  - **middleware/**: Contains middleware functions for authentication.
    - `auth.js`: JWT authentication middleware.
  - **utils/**: Utility functions for various purposes.
    - `mockData.js`: Mock data functions for testing.
    - `rssUtils.js`: Utility functions for generating RSS feeds.
  - `app.js`: Main entry point of the application.

- **uploads/**: Directory for storing uploaded files, such as CSVs.

- **.env**: Environment variables for configuration.

- **package.json**: Configuration file for npm, listing dependencies and scripts.

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd myshiurim
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory and add the necessary environment variables, such as:
   ```
   PORT=5002
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   FTP_HOST=<your-ftp-host>
   FTP_USER=<your-ftp-user>
   FTP_PASSWORD=<your-ftp-password>
   ```

4. **Run the application**:
   ```
   npm start
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:5002`.

## Usage
- **User Authentication**: Users can sign up, log in, and manage their profiles.
- **Shiur Management**: Users can browse, favorite, and manage shiurim.
- **RSS Feeds**: Users can access personalized RSS feeds at `/rss/:username`.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.