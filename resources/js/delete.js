document.addEventListener("DOMContentLoaded", () => {

    async function handleDeleteComment(comment_id){
        const response = await fetch(`/api/delete/comment/${comment_id}`, {
            method: "DELETE",
        });

        if (response.status === 204) {
            const comment = document.getElementById(`comment${comment_id}`);
            const noComments = document.getElementById("noComments")
            if (comment){
                comment.remove();
                noComments.remove();
            }
        } else {
            alert("Failed to delete comment");
        }
    }

    async function handleDeleteProject(proj_id){
        const confirmed = confirm("Delete this project? This cannot be undone.");
        
        if (confirmed){
            const response = await fetch(`/api/delete/project/${proj_id}`, {
                method: "DELETE",
            });

            if (response.status === 204) {
                window.location.href = "/projects";
            } else {
                alert("Failed to delete project");
            }
        }
    }

    async function handleDeletePost(post_id, proj_id){
        const confirmed = confirm("Delete this post? This cannot be undone.");
        
        if (confirmed){
            const response = await fetch(`/api/delete/post/${post_id}`, {
                method: "DELETE",
            });

            if (response.status === 204) {
                window.location.href = `/projects/${proj_id}`;
            } else {
                alert("Failed to delete post");
            }
        }
    }

    document.querySelectorAll(".deleteCommentForm").forEach(form => {
        form.addEventListener("submit", function (event) {
            const comment_id = form.querySelector('input[name="comment_id"]').value;
            event.preventDefault();
            handleDeleteComment(comment_id);
        });
    });

    const deleteProjForm = document.getElementById("deleteProjForm");

    if (deleteProjForm) {
        deleteProjForm.addEventListener("submit", function (event) {
            console.log("DELETE PROJ CLICKED")
            const proj_id = document.getElementById("deleteProjID").value;
            event.preventDefault();
            handleDeleteProject(proj_id);
        });
    }


    const deletePostForm = document.getElementById("deletePostForm");

    if (deletePostForm) {
        deletePostForm.addEventListener("submit", function (event) {
            const delete_from_proj_id = document.getElementById("deleteFromProjID").value;
            const post_id = document.getElementById("deletePostID").value;
            event.preventDefault();
            handleDeletePost(post_id, delete_from_proj_id);
        });
    }

    const deleteUserForm = document.getElementById("deleteUserForm");

    async function handleDeleteUser(){
        const user_id = document.getElementById("deleteUserID").value;
        const url = `/api/delete/user/${user_id}`;
        const response = await fetch(url, {
            method: "DELETE",
        });

        if (response.status === 204){
            window.location.href = "/"
        } else {
            alert("Deletion failed!")
        }
    }

    if (deleteUserForm){
        deleteUserForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            handleDeleteUser();
        })
    }
});