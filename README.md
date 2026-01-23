# Projective

Projective is a server-rendered web app for creating, discovering, and collaborating on side-projects. Built with Node.js, Express and Pug, Projective demonstrates full-stack skills including server-side rendering, relational database design and access, secure authentication, and client-side interactivity.

> A place to turn ideas into projects — post ideas, create projects, invite collaborators, comment on posts, and track your progress.

---


## Tech stack & highlights

- Node.js + Express — HTTP server and routing
- Pug — server-side templates (views are in `templates/`)
- MySQL (mysql2 connection pool) — relational data (project, posts, users, comments, categories)
- JWT + cookies + bcrypt — authentication, session handling and password hashing
- Static assets served from `resources/` (CSS, JS, images)
- Modular data layer — `data.js` encapsulates queries and exposes async helpers 
- Secure and production-aware: uses environment variables, connection pooling, and sensible defaults

This repo is a concise example of building a collaborative CRUD application with server-rendered pages and progressive enhancement via JavaScript.

---

## Key features

- User registration, login, and JWT-based sessions
- Create and manage Projects (title, description, link, category)
- Create Posts within projects and comment on posts
- Invite and manage collaborators for projects
- Categories & filters to discover relevant projects
- Server-rendered pages with Pug templates for good SEO and fast first paint
- Client-side form handling and fetch-based APIs for a responsive UX (examples in `resources/js`)
- Static assets (CSS/JS/images) organized under `resources/`

---

## Project structure (important files & folders)

- `server.js` — main Express app, routing, middleware, view engine setup and static asset mounting
- `data.js` — database connection and exported helper functions to interact with MySQL
- `templates/` — Pug templates and partials: `layout.pug`, `header.pug`, page templates (projects, new_project, view_proj, about, etc.)
- `resources/`
  - `css/main.css` — styles
  - `js/` — client-side scripts (e.g., `new.js`)
  - `images/` — icons and images
- `.env` (not committed) — runtime configuration (DB credentials, JWT secret, etc.) ***NEEDED FOR DEPLOYMENT**

---

## How the data layer is organized

`data.js` exports async functions used by the server:
- addUser, addProject, addPost, addComment, addCollaborator
- getProject, getProjects, getPost, getPosts, getComments
- getCategories, getUsernames, getUserInfo, updateUserInfo, updateProjectInfo, updatePostInfo
- promoteUser, deleteUser, deleteProject, deletePost, deleteComment

The functions centralize SQL queries and error handling and return plain JS objects consumed by the route handlers and Pug templates.

---

## Security & best practices implemented

- Passwords hashed with bcrypt
- Tokens handled with JWT and cookies (HttpOnly recommended)
- Parameterized queries via a single data module (avoid SQL injection)
- Connection pooling for efficient DB usage

---

## What did I learn?
- *Web development is a lengthy process* - To make things function - and look good - it requires extreme attention to detail.
- *HTML/CSS vs. Framework* - This project utilize Pug templating for HTML which helped streamline the process a bit, but was still very time consuming. However, now that I have the fundamentals down, I am very interested in learning to use design frameworks like react to build more complex interactive programs.
- *Data* - Managing the data and ensuring proper database structuring, development, and management is very difficult, however, I enjoyed this process. It taught me that it is important to fully flesh out an idea and understand its requirementes before you begin building the database. I missed a few key features and then had to modify the database after its creation to account for these missing or added features.
- *Time Management* - This project also taught me how to use my time effectively. I did not have much time to complete this project, and was stressed out by having major surgery a week prior as well as other finals to manage. I realized that working on the project when I could - even in small segments of time - was very valuable. I also found myself thinking about the project and planning what I was going to do when I could work on it next. I will look to implement these sorts of ideas in my future projects, as well as life. As I have often found, getting started is the hard part. Once I get started on a project, I will often work much longer than I initially expected to.
  
---

- Author: Gavin Rose
- GitHub: https://github.com/gavrose
- LinkedIn: https://www.linkedin.com/in/gavin-rose-3449222aa

--- 
**This project was part of a class at the University of Minnesota (CSCI 4131 - Internet Programming). The original project was to use our knowledge acquired throughout the class to build a blog. I wanted to challenge myself and eventually decided on the project documentation platform you see here.*
