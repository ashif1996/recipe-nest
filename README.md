# Recipe Nest  

**Recipe Nest** is a Node.js web application built with **Express.js** and **MongoDB** that allows users to browse, search, and view recipes. Users can also add new categories and recipes, edit their profiles, and save their favorite recipes for easy access.  

## 🚀 Features  

- **Browse Recipes**: View a collection of recipes categorized for easy navigation.  
- **Search Functionality**: Find recipes quickly by searching by keywords.  
- **Add New Recipes and Categories**: Users can contribute by adding new recipes and categories.  
- **Favorite Recipes**: Save recipes to a personal favorites list for later access.  
- **User Authentication**: Secure user signup, login, and profile management.  
- **Responsive Design**: Optimized for desktop and mobile devices.  
- **Error Handling**: Custom 404 and server error pages for a seamless user experience.  

## 🛠️ Tech Stack  

### Backend  
- **Node.js**: Backend server and application logic.  
- **Express.js**: Framework for building APIs and handling routes.  
- **MongoDB**: Database for storing user, recipe, and category information.  

### Frontend  
- **EJS**: Template engine for rendering dynamic views.  
- **CSS**: For responsive and attractive styling.  
- **JavaScript**: For interactive client-side functionality.  

## 📂 Project Structure  

```plaintext
recipe-nest/
├── config/                   # Configuration files
│   ├── dbConfig.js           # MongoDB connection configuration
│   ├── emailConfig.js        # Email service configuration
│   ├── multerConfig.js       # File upload configuration
├── controllers/              # Controller logic for handling routes
│   ├── indexController.js    # Homepage and general controllers
│   ├── otpController.js      # OTP-related logic
│   ├── userController.js     # User-related controllers
├── middlewares/              # Middleware for route handling
│   ├── jwtMiddleware.js      # JWT authentication middleware
├── models/                   # MongoDB models (schemas)
│   ├── categoryModel.js      # Schema for recipe categories
│   ├── otpModel.js           # Schema for OTP storage
│   ├── recipeModel.js        # Schema for recipes
│   ├── userModel.js          # Schema for users
├── public/                   # Static assets (CSS, JS, images)
│   ├── css/                  # CSS files for styling
│   ├── images/               # Static images (categories, recipes, etc.)
│   ├── js/                   # JavaScript files for client-side logic
├── routes/                   # API and view routes
│   ├── indexRoutes.js        # General routes
│   ├── otpRoutes.js          # OTP-related routes
│   ├── userRoutes.js         # User-related routes
├── utils/                    # Utility functions
│   ├── emailUtils.js         # Email sending utilities
│   ├── httpStatusCode.js     # HTTP status code constants
│   ├── messageUtils.js       # Utility functions for messages
│   ├── otpUtils.js           # Logic for OTP generation/validation
│   ├── userUtils.js          # Utility functions for user operations
├── views/                    # EJS templates for rendering pages
│   ├── layouts/              # Layout templates
│   ├── partials/             # Reusable components (header, footer, etc.)
│   ├── users/                # User-specific templates
│   ├── 404.ejs               # 404 error page
│   ├── categories.ejs        # Categories page
│   ├── contact.ejs           # Contact page
│   ├── index.ejs             # Homepage
│   ├── recipeDetails.ejs     # Recipe details page
│   ├── recipes.ejs           # Recipes page
│   ├── serverError.ejs       # Server error page
├── .gitignore                # Git ignored files and folders
├── app.js                    # Main application entry point
├── package.json              # Project metadata and dependencies
├── package-lock.json         # Lock file for dependencies
```

## 🔧 Setup and Installation  

### Prerequisites  

- **Node.js** (v16+ recommended)  
- **MongoDB** (local or cloud instance)  
- **npm** (Node Package Manager)  

### Steps  

1. **Clone the repository**:  
   ```bash
   git clone https://github.com/your-username/recipe-nest.git
   cd recipe-nest
   ```

2. **Install dependencies**:  
   ```bash
   npm install
   ```

3. **Set up environment variables**:  
   Create a `.env` file in the root directory and add the following:  
   ```plaintext
   PORT=3000
   DB_URI=mongodb://localhost:27017/your_database_name
   SESSION_SECRET=your_session_secret
   SEND_EMAIL=your_email@example.com
   SEND_EMAIL_PASS=your_email_password
   ```

4. **Run the application**:  
   ```bash
   npm start
   ```

5. Open your browser and go to:  
   ```plaintext
   http://localhost:3000
   ```

## 📜 Usage  

1. **Browse Recipes**  
   - View all available recipes on the homepage or categorized pages.  

2. **Search Recipes**  
   - Use the search bar to find recipes by keywords.  

3. **Add Recipes and Categories**  
   - Log in to contribute new recipes and categories.  

4. **Favorite Recipes**  
   - Save recipes to your favorites for easy access later.  

## 📈 Learning Outcomes  

- Building RESTful APIs with **Express.js**.  
- Creating dynamic views with **EJS**.  
- Managing data with **MongoDB**.  
- Using JWT for secure authentication.  
- File uploads and image management with **Multer**.  

## 🛡️ License  

This project is licensed under the **MIT License**. 

## 🌟 Acknowledgements  
  
- Open-source libraries and tools for building this project.