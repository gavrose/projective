require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4444;


const {
  addUser,
  addProject,
  addPost,
  addComment,
  addCollaborator,
  getProject,
  getProjects,
  getPost,
  getPosts,
  getComments,
  getCategories,
  getCollaborators,
  getUsernames,
  getUserInfo,
  updateUserInfo,
  updateProjectInfo,
  updatePostInfo,
  promoteUser,
  deleteUser,
  deleteProject,
  deletePost,
  deleteComment
} = require('./data');

const bcrypt = require("bcryptjs");
const jwt = require("jwt-simple");
const secret = process.env.JWT_SECRET;

const cookieParser = require("cookie-parser");


app.set("view engine", "pug")
app.set("views", "templates")

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/images", express.static("resources/images"));
app.use("/js", express.static("resources/js"));
app.use("/css", express.static("resources/css"));
app.use("/", express.static("templates"));


app.use((req, res, next) => {
    const token = req.cookies.token;
    try{
        if (token) {
            res.locals.curr_user = jwt.decode(token, secret);
            // https://forum.freecodecamp.org/t/res-locals-user-how-does-it-work/76212/7
            // https://www.geeksforgeeks.org/node-js/how-to-implement-jwt-authentication-in-express-js-app/
        } else {
            res.locals.curr_user = null;
        }
        console.log(req.method, req.url, res.statusCode);
    }catch (e) {
        res.clearCookie("token");
        return res.redirect("/login");
    }
    next();
});

app.use(async (req, res, next) => {
    try {
        if (res.locals.curr_user) {
            const userProjects = await getProjects(res.locals.curr_user.username, "");
            res.locals.userProjects = userProjects;
        } else {
            res.locals.userProjects = [];
        }
    } catch (e) {
        console.error("Failed to fetch user projects:", err);
        res.locals.userProjects = [];
    }
    next();
});


function escape_html(s){
    s = s.replace(/&/g, "&amp;")
    s = s.replace(/"/g, "&quot;")
    s = s.replace(/</g, "&lt;")
    s = s.replace(/>/g, "&gt;")
    s = s.replace(/'/g, "&#39;")
    return s
}


app.get("/about", async (req, res) => {
    res.render("about", {
        title: "About Projective",
        curr_user: res.locals.curr_user
    })
})

app.get(["/", "/projects"], async (req, res) => {

    const username = req.query.usernameFilter || "";
    const category_id = req.query.categoryFilter || "";


    const categories = await getCategories("");
    const projects = await getProjects(username,category_id);

    const usernames_list = await getUsernames();

    if (projects.length){
        for (let project of projects) {
            project.total_posts = (await getPosts(project.proj_id)).length;
            project.collaborators = await getCollaborators(project.proj_id);
        }
    }

    res.render("projects", {
        title: "Projects",
        projects,
        categories,
        curr_user: res.locals.curr_user,
        usernames_list
    });
})


app.get("/projects/new", async (req, res) => {
    const categories = await getCategories("")
    res.render("new_project",{
        title: "New Project",
        categories: categories,
        curr_user: res.locals.curr_user
    });
});

app.get("/projects/:proj_id", async (req, res) => {
    const proj_id = req.params.proj_id
    const project = (await getProject(proj_id))[0];
    const posts = await getPosts(proj_id);

    let valid_posters = [];
    const author = await getUserInfo(project.author_id)
    valid_posters.push({user_id: author.user_id, username: author.username});

    const collaborators = await getCollaborators(proj_id);
    for (const collaborator of collaborators){
        const user = await getUserInfo(collaborator.user_id)
        valid_posters.push({user_id: user.user_id, username: user.username});
    }

    for (const post of posts){
        post.author_username = (await getUserInfo(post.author_id)).username
    }

    const usernames_list = await getUsernames();

    const category_name = await getCategories(project.category_id)

    res.render("view_proj",{
        title: `${project.title}`,
        project: project,
        category_name: category_name,
        posts: posts,
        valid_posters: valid_posters,
        usernames_list: usernames_list,
        curr_user: res.locals.curr_user
    });
});

app.get("/projects/:proj_id/posts/new",async (req,res)=>{
    const proj_id = req.params.proj_id
    const project = (await getProject(proj_id))[0];

    let valid_posters = [];
    valid_posters.push(project.author_id);

    const collaborators = await getCollaborators(proj_id);
    for (const collaborator of collaborators){
        valid_posters.push(collaborator.user_id)
    }

    if (!valid_posters.includes(res.locals.curr_user.user_id)){
        return res.status(403).json({ error: "Access Forbidden" });
    } else {
        res.render("new_post",{
            title: `${project.title}`,
            project: project,
            valid_posters: valid_posters,
            curr_user: res.locals.curr_user
        });
    }   
});

app.get("/projects/:proj_id/posts/:post_id",async (req,res)=>{
    const proj_id = req.params.proj_id;
    const project = (await getProject(proj_id))[0];

    const post_id = req.params.post_id;
    const post = (await getPost(post_id))[0]
    const postAuthor = await getUserInfo(post.author_id);
    post.author_username = postAuthor.username;
    const comments = (await getComments(post_id))

    let valid_posters = [];
    valid_posters.push(project.author_id);

    for (let comment of comments){
        comment.author_username = (await getUserInfo(comment.author_id)).username
    }

    res.render("view_post",{
        title: `${project.title}`,
        project: project,
        post: post,
        comments: comments,
        curr_user: res.locals.curr_user
    });
})

app.get("/:username/profile", async (req, res) => {
    const username = req.params.username;
    const profile = await getUserInfo(username);
    if (!profile) return res.status(404).render("404", { title: "User Not Found" });

    const projects = await getProjects(username,"");
    for (let project of projects) {
        project.total_posts = (await getPosts(project.proj_id)).length;
        project.collaborators = await getCollaborators(project.proj_id);
    }
    
    res.render("user_profile", {
        title: `${profile.username}'s Profile`,
        userProfile: profile,
        projects,
        curr_user: res.locals.curr_user
    });
    console.log("VIEWING: ", profile.username)
    console.log("LOGGED IN AS:", res.locals.curr_user.username)
})

app.get("/login", (req, res) => {
    res.render("login", {title: "Login"})
})

app.get("/logout", (req, res) => {
    res.clearCookie("token", {httpOnly: true});
    res.locals.curr_user = null;
    res.redirect("/");
});

app.get("/register", (req, res) => {
    res.render("register", {title: "Create Account"});
})

app.post("/api/new/proj", async (req,res) => {
    const username = res.locals.curr_user.username;
    const title = req.body.title;
    const cat_id = req.body.cat_id;
    const desc = req.body.description;
    const link = req.body.link;


    const new_proj = await addProject(username, title, cat_id, desc, link);
    console.log(new_proj)
    if (new_proj){
        res.status(201).json({
            username: username,
            proj_id: new_proj });
    }
})

app.post("/api/new/post", async (req,res) => {
    const user_id = res.locals.curr_user.user_id;
    const proj_id = req.body.proj_id;
    const title = req.body.title;
    const content = req.body.content;

    const new_post = await addPost(proj_id, user_id, title, content);

    if (new_post){
        res.status(201).json({
            curr_user: res.locals.curr_user,
            proj_id: proj_id,
            post_id: new_post});
    }
})

app.post("/api/new/comment", async (req,res) => {
    const user_id = res.locals.curr_user.user_id;
    const post_id = req.body.post_id;
    const content = req.body.comment_content;


    const new_comment = await addComment(user_id, post_id, content);
    console.log(new_comment)
    if (new_comment){
        return res.status(201).json({
            comment_id: new_comment,
            comment_text: content,
            author_username: res.locals.curr_user.username,
            author_id: res.locals.curr_user.user_id,
            created_at: new Date()});
    } else {
        return res.status(500).json({error: "Failed to add comment"});
    }
})


app.post("/api/auth", async (req,res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const user = await getUserInfo(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid username/email or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log("Invalid username/email or password")
            return res.status(401).json({ error: "Invalid username/email or password" });
        }
        const payload = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now()/1000) + (3600 * 3) //stay logged in for 3 hrs
        };
        const token = jwt.encode(payload, secret);
        res.cookie("token", token, {httpOnly: true});
        res.status(200).json({username: user.username});
    } catch {
        res.status(500).json({ error: "Server error" });
    }
})

app.post("/api/register", async (req,res) => {
    const usernames = await getUsernames();
    console.log("Usernames:", usernames);
    if (usernames.includes(req.body.username)){
        res.status(400).json({error: "Username Taken"})
    } else {
        if (!req.body.username || !req.body.password || !req.body.email) {
            return res.status(418).json({ error: "Missing username, email, and/or password" });
        }
        const hashed_pw = await bcrypt.hash(req.body.password, 12);
        const new_user_id = await addUser(req.body.username, req.body.email, hashed_pw);
        const new_user = await getUserInfo(new_user_id);

        const payload = {
            user_id: new_user.user_id,
            username: new_user.username,
            email: new_user.email,
            role: new_user.role,
            exp: Math.floor(Date.now()/1000) + (3600 * 3) //stay logged in for 3 hrs
        };
        const token = jwt.encode(payload, secret);
        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({username: new_user.username});
    }
});

app.post("/api/update/profile/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const {username, email, bio} = req.body;

    const existingUsernames = await getUsernames();
    if (existingUsernames.includes(username)) {
        return res.status(400).json({ error: "Username Taken" });
    }

    if (!username || !email) {
        return res.status(418).json({ error: "Missing username or email" });
    }

    await updateUserInfo(user_id, username, email, bio);
    const payload = {
        user_id: user_id,
        username: username,
        email: email,
        exp: Math.floor(Date.now()/1000) + (3600) //1 hr 
    };

    const updated_user = await getUserInfo(user_id);

    const token = jwt.encode(payload, secret);
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({
        username: updated_user.username,
        email: updated_user.email,
        bio: updated_user.bio,
    });
});

app.post("/api/update/post/:post_id", async (req, res) => {
    const post_id = req.params.post_id;
    const {title, content} = req.body;


    if (!title || !content) {
        return res.status(418).json({ error: "Missing title or content" });
    }

    const updated = await updatePostInfo(post_id, title, content);
    if (updated){
        const [updated_post] = await getPost(post_id);
            return res.status(200).json({
                title: updated_post.title,
                content: updated_post.content,
            });
    } else {
        return res.status(500).json({error: "Post update failed"});
    }
});

app.post("/api/update/project/:proj_id", async (req, res) => {
    const proj_id = req.params.proj_id;
    const proj_to_update = (await getProject(proj_id))[0];
    console.log(proj_to_update);

    const {title, desc, link, new_collaborator} = req.body;
    const responseBody = {};

    if (new_collaborator) {
        const collab_user_id = (await getUserInfo(new_collaborator)).user_id
        if (collab_user_id === proj_to_update.author_id) {
            return res.status(400).json({error: "User is the project owner."});
        }
        const current_collaborators = await getCollaborators(proj_id);

        for (let i = 0; i < current_collaborators.length; i++) {
            if (current_collaborators[i].username === new_collaborator) {
                return res.status(400).json({error: "User is already a collaborator."});
            }
        }

        const collaboratorAdded = await addCollaborator(proj_id, new_collaborator);
        if (!collaboratorAdded) {
            return res.status(400).json({ error: "Failed to add collaborator." });
        }
        responseBody.new_collaborator = new_collaborator;
    }

    const updated = await updateProjectInfo(proj_id, title, desc, link);
    if (!updated) {
        return res.status(500).json({ error: "Project update failed" });
    }

    responseBody.title = title;
    responseBody.desc = desc;
    responseBody.link = link;
    
    return res.status(200).json(responseBody);
});



app.post("/api/promote/:user_id", async (req,res) => {
    const user_id = req.params.user_id;

    const user = await getUserInfo(user_id);
    if (user.role === 'user'){
        const promoted = await promoteUser(user_id);
        if (promoted){
            return res.status(200).json({success: "Promotion successful"});
        } else {
            return res.status(500).json({error: "Promotion failed"});
        }
    } else {
        return res.status(404).json({error: "User is already an admin"});
    }
});

app.delete("/api/delete/user/:user_id", async (req,res) => {
    const user_id = req.params.user_id;

    const user = await getUserInfo(user_id);
    if (user.role === 'user'){
        const deleted = await deleteUser(user_id);
        if (deleted){
            console.log("Deleted?", deleted);
            res.clearCookie("token", {httpOnly: true, path: "/"});
            res.locals.curr_user = null;
            console.log("Sending 204 now");
            return res.sendStatus(204);
        } else {
            return res.status(404).json({error: "Account deleteion failed"});
        }
    } else {
        return res.status(404).json({error: "Unable to delete other admin accounts"});
    }
});


app.delete("/api/delete/comment/:comment_id", async (req, res) => {
    const comment_id = req.params.comment_id;
    const deleted = await deleteComment(comment_id);
    if (deleted) {
        return res.sendStatus(204);
    } else {
        return res.status(404).json({error: "Comment not found"});
    }
})

app.delete("/api/delete/post/:post_id", async (req, res) => {
    const post_id = req.params.post_id;
    const deleted = await deletePost(post_id);
    if (deleted) {
        return res.sendStatus(204)
    } else {
        return res.status(404).json({error: "Post not found"});
    }
})

app.delete("/api/delete/project/:proj_id", async (req, res) => {
    const proj_id = req.params.proj_id;
    const deleted = await deleteProject(proj_id);
    if (deleted) {
        return res.sendStatus(204)
    } else {
        return res.status(404).json({error: "Post not found"});
    }
})

app.use((req,res, next)=>{
	res.status(404).render("404.pug", {title: "Page Not Found"})
}) 

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})