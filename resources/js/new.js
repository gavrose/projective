document.addEventListener("DOMContentLoaded", () =>{

const newProjForm = document.getElementById('newProjectForm');
const newPostForm = document.getElementById('newPostForm');
const newCommentForm = document.getElementById('addCommentForm');

const newCommentBtn = document.getElementById('addCommentBtn');

async function handleNewProj () {
    const title = document.getElementById('projTitleEntry').value;
    const cat_id = document.getElementById('projCatEntry').value;
    const link = document.getElementById('projLinkEntry').value;
    const desc = document.getElementById('projDescEntry').value;

    const proj = {
        title: title,
        link: link,
        cat_id: cat_id,
        description: desc,
    }
    const url = '/api/new/proj';
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proj)
    });
    const data = await response.json();
    if (!response.ok) {
        alert("Failed to create project!");
        return;
    }
    window.location.href = `/projects/${data.proj_id}`;
}

async function handleNewPost () {
    const proj_id = document.getElementById('postProjID').value;
    const post_title = document.getElementById('postTitleEntry').value;
    const post_content = document.getElementById('postContentEntry').value;

    const post = {
        proj_id: proj_id,
        title: post_title,
        content: post_content,
    }
    const url = '/api/new/post';
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
    });
    const data = await response.json();
    if (!response.ok) {
        alert("Failed to create post!");
        return;
    }
    window.location.href = `/projects/${data.proj_id}/posts/${data.post_id}`;
}

function handleCommentFormDisplay(){
    if (newCommentForm.hasAttribute("hidden")) {
        newCommentForm.removeAttribute("hidden");
        newCommentBtn.innerText = "Cancel comment";
        document.getElementById("commentContent").focus();
    } else {
        newCommentForm.setAttribute("hidden", "");
        newCommentBtn.innerText = "Add Comment";
    }
}

async function handleNewComment () {
    const comment_content = document.getElementById('commentContent').value;
    const post_id = document.getElementById('post_id').value;

    const comment = {
        post_id: post_id,
        comment_content: comment_content,
    }
    const url = '/api/new/comment';
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment)
    });
    if (!response.ok) {
        alert("Failed to create comment!");
        return;
    }
    const new_comment = await response.json();
    newCommentForm.setAttribute("hidden", "");
    newCommentBtn.innerText = "Add Comment";
    renderNewComment(new_comment);
}

function renderNewComment(comment){
    const commentsList = document.querySelector(".commentsList");

    const new_comment = document.createElement("div");
    new_comment.className = "comment";
    new_comment.id = `comment${comment.comment_id}`;

    new_comment.innerHTML = 
        `<span class="commentInfo">
            <div class="commentHeader">
                <a class="userLink" href="/${comment.author_username}/profile">
                    ${comment.author_username}
                </a>
                posted just now
                <form class="deleteCommentForm">
                    <input type="hidden" name="comment_id" value="${comment.comment_id}">
                    <button class="deleteCommentBtn" type="submit">Delete Comment</button>
                </form>
            </div>
        </span>
        <p class="commentContent">${comment.comment_text}</p>`;

    commentsList.prepend(new_comment);
}

if (newCommentBtn){
    newCommentBtn.addEventListener("click", handleCommentFormDisplay);
}

if (newProjForm){
    newProjForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        handleNewProj();
    })
}

if (newPostForm){
    newPostForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        handleNewPost();
    })
}

if (newCommentForm) {
    newCommentForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        await handleNewComment();
    });
};

});

