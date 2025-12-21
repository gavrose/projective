document.addEventListener("DOMContentLoaded", ()=>{

    const startUpdateProfileBtn = document.getElementById("startUpdateBtn");
    const updateProfileForm = document.getElementById("updateProfile");    

    const profileDisplay = document.getElementById("profileDisplay");

    async function handleProfileUpdateFormDisplay(){
        if (updateProfileForm.hasAttribute("hidden")) {
            updateProfileForm.removeAttribute("hidden");
            profileDisplay.style.display = "none";
            startUpdateProfileBtn.innerText = "Cancel Profile Update";
        } else {
            profileDisplay.style.display = "block";
            updateProfileForm.setAttribute("hidden", "");
            startUpdateProfileBtn.innerText = "Edit Profile";
        }
    }

    async function handleProfileUpdateForm(){
        const username = document.getElementById("update-username").value;
        const email = document.getElementById("update-email").value;
        const bio = document.getElementById("update-bio").value;
        const user_id = document.getElementById("user_id").value;

        const msg_space = document.getElementById("profileMsg");

        const update_user = {
            username,
            email,
            bio
        }
        const url = `/api/update/profile/${user_id}`
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update_user)
        });

        if(!response.ok || response.error){
            msg_space.innerText = response.error
        } else {
            const emailDisplay = document.getElementById("emailDisplay");
            const bioDisplay = document.getElementById("bioDisplay");
            
            const data = await response.json();

            msg_space.innerText = "Profile Updated"
            updateProfileForm.setAttribute("hidden", "");
            profileDisplay.style.display = "block";
            emailDisplay.innerText = `Email: ${data.email}`;
            bioDisplay.innerText = `Bio: ${data.bio}`;
            startUpdateProfileBtn.innerText = "Edit Profile"
        }
    }

    if (startUpdateProfileBtn){
        startUpdateProfileBtn.addEventListener("click", handleProfileUpdateFormDisplay);
    }

    if (updateProfileForm){
        updateProfileForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            handleProfileUpdateForm();
        })
    }
//------------------------------------------------------------------
    const promoteUserForm = document.getElementById("promoteUserForm");

    if (promoteUserForm){
        promoteUserForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            handlePromoteUser();
        })
    }

    async function handlePromoteUser(){
        const user_id = document.getElementById("promoteUserID").value;
        const url = `/api/promote/${user_id}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        });

        if (response.ok){
            const roleDisplay = document.getElementById("roleDisplay");
            roleDisplay.innerText = 'Role: ADMIN';
            promoteUserForm.setAttribute("hidden", "");
        } else {
            alert("Promotion failed!")
        }
    }

//------------------------------------------------------------------
    const startUpdatePostBtn = document.getElementById("editPostBtn")
    const postDisplay = document.getElementById("postDisplay");
    const updatePostForm = document.getElementById("editPostForm");

    async function handleUpdatePostFormDisplay(){
        const postDisplay = document.getElementById("postDisplay");
        if (updatePostForm.hasAttribute("hidden")) {
            updatePostForm.removeAttribute("hidden");
            postDisplay.style.display = "none";
            startUpdatePostBtn.innerText = "Cancel Post Update";
        } else {
            postDisplay.style.display = "block";
            updatePostForm.setAttribute("hidden", "");
            startUpdatePostBtn.innerText = "Edit Post";
        }
    }

    async function handleUpdatePostForm(){
        const title = document.getElementById("editPostTitle").value;
        const content = document.getElementById("editPostContent").value;
        const post_id = document.getElementById("editPostID").value;

        const update_post = {
            title,
            content,
            post_id
        }
        const url = `/api/update/post/${post_id}`
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update_post)
        });

        if(!response.ok || response.error){
            msg_space.innerText = response.error
        } else {
            const postTitleDisplay = document.getElementById("postTitleDisplay");
            const postContentDisplay = document.getElementById("postContentDisplay");
            
            const data = await response.json();
            console.log(data)
            updatePostForm.setAttribute("hidden", "");
            postDisplay.style.display = "block";
            postTitleDisplay.innerText = `${data.title}`;
            postContentDisplay.innerText = `${data.content}`;
            startUpdatePostBtn.innerText = "Edit Post"
        }
    }

    if (startUpdatePostBtn){
        startUpdatePostBtn.addEventListener("click", handleUpdatePostFormDisplay);
    }

    if (updatePostForm){
        updatePostForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            handleUpdatePostForm();
        })
    }


//------------------------------------------------------------------
    const startUpdateProjectBtn = document.getElementById("editProjectBtn")
    const projectDisplay = document.getElementById("projectDisplay");
    const updateProjectForm = document.getElementById("editProjectForm");
    const proj_msg_space = document.getElementById("editProjMsg");


    async function handleUpdateProjectFormDisplay(){
        if (updateProjectForm.hasAttribute("hidden")) {
            updateProjectForm.removeAttribute("hidden");
            projectDisplay.style.display = "none";
            startUpdateProjectBtn.innerText = "Cancel Project Update";
            proj_msg_space.innerText = "";
        } else {
            projectDisplay.style.display = "flex";
            updateProjectForm.setAttribute("hidden", "");
            startUpdateProjectBtn.innerText = "Edit Project";
            proj_msg_space.innerText = "";
        }
    }

    async function handleUpdateProjectForm(){
        const title = document.getElementById("editProjTitle").value;
        const link = document.getElementById("editProjLink").value;
        const desc = document.getElementById("editProjDesc").value;
        const new_collaborator = document.getElementById("collaboratorSearch").value;
        const proj_id = document.getElementById("editProjID").value;

        const update_proj = {
            title,
            proj_id,
            desc,
            link,
            new_collaborator,
        }
        const url = `/api/update/project/${proj_id}`
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update_proj)
        });

        const data = await response.json();

        if(!response.ok || response.error){
            proj_msg_space.innerText = data.error
        } else {
            const projectTitleDisplay = document.getElementById("projTitleDisplay");
            const projectLinkDisplay = document.getElementById("projLinkDisplay");
            const projectDescDisplay = document.getElementById("projDescDisplay");
            const validPostersDisplay = document.getElementById("validPostersDisplay");


            updateProjectForm.setAttribute("hidden", "");
            projectDisplay.style.display = "flex";
            projectTitleDisplay.innerText = `${data.title}`;
            projectLinkDisplay.href = `${data.link}`;
            projectLinkDisplay.innerText = "Project Link";

            projectDescDisplay.innerText = `${data.desc}`;
            if (data.new_collaborator){
                const newCollab = `${data.new_collaborator}`
                const newSpan = document.createElement('span');
                const newLink = document.createElement('a');
                newLink.className = 'userLink';
                newLink.href = `/${newCollab}/profile`;
                newLink.textContent = `${newCollab}`;
                newSpan.appendChild(newLink);
                validPostersDisplay.appendChild(newSpan);
            }
            
            proj_msg_space.innerText = "";
            startUpdateProjectBtn.innerText = "Edit Project"
        }
    }

    if (startUpdateProjectBtn){
        startUpdateProjectBtn.addEventListener("click", handleUpdateProjectFormDisplay);
    }

    if (updateProjectForm){
        updateProjectForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            handleUpdateProjectForm();
        })
    }
})