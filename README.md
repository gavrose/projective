# Projective Website

Projective is a platform for managing **Projects** (similar to blogs) with collaborative features and categories.

---

## Key Features

### Collaborators
- Users can add collaborators to a project.
- Collaborators can **edit and delete the project** and posts within the project.
- Projects where a user is a collaborator appear on their profile and in the **"YOUR PROJECTS"** section of the left navbar.
- **Note:** There is currently no functionality to remove collaborators, so add carefully.

### Categories
- Users can select a **category** for a post when creating it.
- **Limitations:** 
  - Cannot change categories after project creation.
  - Multiple categories per project are not supported.

### Account Support
- Users can login in and receive different views based on their login status and user role (user/admin).
- Passwords are **stored hashed** in the database.
- **Note:** Users are automatically logged out after 3 hours.


---

## How to Run
1. Create an account via `/register` **or** log in and select the "Create Account" button.
    - Accessible from the **Login** button in the top navigation bar or by clicking the **guest user profile** in the left navbar.
2. Once logged in, you can create, edit, and manage projects and posts.

---

## Admin Account for Testing
- **Login Credentials:**
  - **Email:** `test@umn.edu`
  - **Password:** `test`
- Admin privileges allow full control to **edit/delete all projects, posts, and comments**.
- To promote a user to admin:
  1. Navigate to `/<username>/profile`
  2. Click the **"Promote to Admin"** button
- Feel free to delete/modify any project except CSCI 4131 Final Project











