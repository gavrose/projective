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

## Contact

- Author: Gavin Rose
- GitHub: https://github.com/gavrose
- LinkedIn: https://www.linkedin.com/in/gavin-rose-3449222aa
