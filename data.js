// const mysql = require("mysql2/promise");

// var connPool = mysql.createPool({
//   connectionLimit: 5, // it's a shared resource, let's not go nuts.
//   host: "127.0.0.1", // this will work
//   port: 3306,
//   user: "C4131F25U118",
//   database: "C4131F25U118",
//   password: "13974", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
// });

const config = require('dotenv').config();
const mysql = require("mysql2/promise");

// If DATABASE_URL exists (on your server), it uses that. 
// Otherwise, it falls back to a local string for testing.
const connectionString = process.env.DATABASE_URL;


const poolConfig = {
  host: process.env.DB_HOST,      // Should be the IP address
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
};

const connPool = mysql.createPool(poolConfig);
// var connPool = mysql.createPool({
//   uri: connectionString,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// Simple test to confirm connection on startup
connPool.getConnection()
  .then(connection => {
    console.log("Connected to Aiven MySQL successfully!");
    connection.release();
  })
  .catch(err => {
    console.error("Database connection failed:", err.message);
  });

module.exports = connPool;


async function addUser(username, email, password) {
  /**
   * create a new user
   */
  // hashed_password = 
  const [user] = await connPool.query(
    `INSERT into Users (username, email, password, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [username, email, password]
  )
  return user.insertId;
}

async function addProject(username, title, category_id, description){
  const [users] = await connPool.query(
    `SELECT user_id 
    FROM Users 
    WHERE username = ?`,
    [username]
  );

  const user_id = users[0].user_id;

  const [project] = await connPool.query(
    `
    INSERT INTO Projects (author_id, category_id, title, description)
    VALUES (?, ?, ?, ?)
    `,
    [user_id, category_id, title, description]
  );
  return project.insertId;
}


async function getProject(proj_id){
  const [proj] = await connPool.query(
    `SELECT *
    FROM Projects
    WHERE proj_id = ?`,
    [proj_id]
  )
  return proj;
}

async function getProjects(username, category_id){
  let user_id = null;

  if (username) {
    const user = await getUserInfo(username);
    if (!user) return [];
    user_id = user.user_id;
  };

  const [projects] = await connPool.query(
    `SELECT DISTINCT Projects.*, Users.username, Categories.category_name 
    FROM Projects
    JOIN Users on Projects.author_id = Users.user_id
    LEFT JOIN Categories on Projects.category_id = Categories.category_id
    LEFT JOIN Collaborators ON Projects.proj_id = Collaborators.proj_id
    LEFT JOIN Users AS CollabUsers ON Collaborators.user_id = CollabUsers.user_id
    WHERE (? IS NULL OR Projects.author_id = ? OR Collaborators.user_id = ?) AND (? = '' OR Users.username LIKE ? OR CollabUsers.username LIKE ?) AND (? = '' OR Categories.category_id = ?)
    ORDER BY Projects.created_at ASC`,
    [user_id, user_id, user_id, username, `%${username}%`, `%${username}%`, category_id, category_id]
  );
  return projects;
}





async function addComment(user_id, post_id, content) {
  // const user = await getUserInfo(user_id);
  // const username = user.username;

  const [comment] = await connPool.query(
    `INSERT INTO Comments (author_id, post_id, comment_text)
    VALUES (?,?,?)`,
    [user_id, post_id, content]
  );
  return comment.insertId;
}

async function addCollaborator(proj_id, username){

  const [rows] = await connPool.query(
    `SELECT user_id 
    FROM Users WHERE username = ?`,
    [username]
  );

  if (!rows.length) {
    return 0;
  }

  const user_id = rows[0].user_id;
  const [existing] = await connPool.query(
    `SELECT 1 FROM Collaborators
    WHERE proj_id = ? AND user_id = ?`,
    [proj_id, user_id]
  );

  if (existing.length > 0) {
    return 0;
  }

  const [new_collaborator] = await connPool.query(
    `INSERT INTO Collaborators (proj_id, user_id) 
    VALUES (?, ?)`,
    [proj_id, user_id]
  );


  if (new_collaborator.affectedRows === 0){
    return 0;
  } else {
    return 1;
  }
}


async function getCategories(query){
  const [categories] = await connPool.query(
    `SELECT * 
    FROM Categories
    WHERE (? = '' OR category_id = ?)`,
    [query,query]
  );
  return categories;
}

async function getUsernames(){
  const [usernames] = await connPool.query(`
    SELECT username 
    FROM Users
    `)
  return usernames;
}

async function getUserInfo(query){
  const [info] = await connPool.query(`
    SELECT * 
    FROM Users
    WHERE username = ? OR email = ? OR user_id = ?`,
    [query, query, query])
  return info[0] || null;
}


async function getPost(post_id){
  const [post] = await connPool.query(
    `SELECT * 
    FROM Posts
    WHERE (post_id = ?)`,
    [post_id]
  );
  return post;
}

async function getPosts(proj_id){
  const [posts] = await connPool.query(
    `SELECT * 
    FROM Posts
    WHERE (proj_id = '' OR proj_id = ?)`,
    [proj_id]
  );
  return posts;
}


async function getComments(post_id){
  const [comments] = await connPool.query(
    `SELECT * 
    FROM Comments
    WHERE post_id = ?`,
    [post_id]
  )
  return comments
}

async function getCollaborators(proj_id){

  const [collaborators] = await connPool.query(
    `SELECT Collaborators.user_id, Users.username
     FROM Collaborators
     JOIN Users ON Collaborators.user_id = Users.user_id
     WHERE Collaborators.proj_id = ?`,
     [proj_id]
  )
  return collaborators;
}


async function deleteProject(proj_id){
  const [posts] = await connPool.query(
    `SELECT post_id 
    FROM Posts 
    WHERE proj_id = ?`,
    [proj_id]
  );

  for (let i = 0; i < posts.length; i++) {
    const post_id = posts[i].post_id;
    await connPool.query(
      `DELETE FROM Comments 
      WHERE post_id = ?`,
      [post_id]
    );
  }

  await connPool.query(
    `DELETE FROM Posts 
    WHERE proj_id = ?`,
    [proj_id]);

  await connPool.query(
    `DELETE FROM Collaborators
    WHERE proj_id = ?`,
    [proj_id]
  )
  const [result] = await connPool.query(
    `DELETE FROM Projects
    WHERE proj_id = ?`,
    [proj_id]);

  if (result.affectedRows === 0) {
    return 0; 
  } else {
    return 1; 
  }
}

async function deletePost(post_id){
    await connPool.query(
    `DELETE FROM Comments 
    WHERE post_id = ?`,
    [post_id]);

  const [result] = await connPool.query(
    `DELETE FROM Posts 
    WHERE post_id = ?`,
    [post_id]);

  if (result.affectedRows === 0) {
    return 0; 
  } else {
    return 1; 
  }
}

async function deleteComment(comment_id){
  const [result] = await connPool.query(
    `DELETE FROM Comments 
    WHERE comment_id = ?`,
    [comment_id]
    );

  if (result.affectedRows === 0) {
    return 0;
  } else {
    return 1;
  }
}


async function updateUserInfo(user_id, username, email, bio){
  const [updated_user] = await connPool.query(
    `UPDATE Users
    SET username=?, email=?, bio=?
    WHERE user_id = ?`,
    [username, email, bio, user_id]
  )
}

async function updatePostInfo(post_id, title, content) {
  const [updated_post] = await connPool.query(
      `UPDATE Posts
      SET title=?, content=?
      WHERE post_id = ?`,
      [title, content, post_id]
  );

  if (updated_post.affectedRows === 0) {
    return 0;
  } else {
    return 1;
  }
}

async function updateProjectInfo(proj_id, title) {
  const [result] = await connPool.query(
    `UPDATE Projects
    SET title=?
    WHERE proj_id = ?`,
    [title, proj_id]
    );

  if (result.affectedRows === 0) {
    return 0;
  } else {
    return 1;
  }
}

async function promoteUser(user_id){
  const [promoted_user] = await connPool.query(
    `UPDATE Users
    SET role='admin'
    WHERE user_id = ?`,
    [user_id]
  )
  if (promoted_user.affectedRows === 0) {
    return 0;
  } else {
    return 1;
  }
}

async function deleteUser(user_id){

  await connPool.query(
    `DELETE FROM Comments 
    WHERE author_id = ?`,
    [user_id]);

  await connPool.query(
    `DELETE FROM Collaborators
    WHERE user_id = ?`, [user_id]);

  await connPool.query(
    `DELETE FROM Posts 
    WHERE author_id = ?`,
    [user_id]);

  await connPool.query(
    `DELETE FROM Projects
    WHERE author_id = ?`,
    [user_id]);

  const [result] = await connPool.query(
      `DELETE FROM Users
      WHERE user_id = ?`,
      [user_id]
    );

  if (result.affectedRows === 0) {
    return 0; 
  } else {
    return 1; 
  }
}


async function addPost(proj_id, user_id, title, content){
  console.log(proj_id, user_id, title,)
  const [users] = await connPool.query(
    `SELECT user_id
    FROM Users
    Where user_id = ?`,
    [user_id]
  );

  if (!users[0]){
    throw("ERROR: User not found.")
  }
  const [owner] = await connPool.query(
    `SELECT author_id
    FROM Projects
    WHERE proj_id = ?`,
    [proj_id]
  );

  const author_id = owner[0].author_id;
  if (user_id != author_id) {
    const [collab_check] = await connPool.query(
      `SELECT *
      FROM Collaborators
      WHERE proj_id = ? OR user_id = ?`,
      [proj_id, user_id]
    );
    
    if (!collab_check[0]){
      throw("ERROR: User not authorized to add a post in this project.")
    }
  }

  const [post] = await connPool.query(
    `INSERT INTO Posts (proj_id, author_id, title, content)
    VALUES (?,?,?,?)`,
    [proj_id, user_id, title, content]
  );

  return post.insertId;
}

module.exports = {
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
};
