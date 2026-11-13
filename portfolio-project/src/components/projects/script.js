import { 
    db, 
    auth, 
    onAuthStateChanged, 
    collection, 
    doc, 
    getDoc, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc 
} from '../../firebase/init.js';

// Project list and modal controls ↓
const projectList = document.getElementById('project-list');
const projectFormModal = document.getElementById('project-form-modal');
const openProjectForm = document.getElementById('open-project-form');
const closeProjectForm = document.getElementById('close-project-form');

const projectsRef = collection(db, 'projects');

let currentProjects = [];

// Display projects ↓
function displayProjects() {
    projectList.innerHTML = '';

    currentProjects.forEach((projectData) => {
        const project = projectData.data;
        const projectId = projectData.id;

        const li = document.createElement('li');

        li.innerHTML = `
            <h4>${project.title}</h4>
            <img src="${project.image}" alt="${project.title}">
            <p>${project.description}</p>
            
            <div class="project-comments">
                <h5>Comments</h5>
                <div class="comment-list"></div>

                <form class="comment-form">
                    <input type="text" class="comment-input" placeholder="Leave a comment..." required>
                    <button type="submit">Comment</button>
                </form>
            </div>
        `;

        li.querySelector('.comment-form').dataset.projectId = projectId;

        // Hide Edit/Delete buttons if the user isn't ME
        if (auth.currentUser && auth.currentUser.uid === '6HTSv9H6S6WmxZ7MrBPqUxUfdoo2') {
            li.innerHTML += `
                <button type="button" class="edit-project" data-id="${projectId}">Edit</button>
                <button type="button" class="delete-project" data-id="${projectId}">Delete</button>
            `;
        }

        projectList.appendChild(li);
    });
}

// Read Operation ↓
onSnapshot(projectsRef, (snapshot) => {
    currentProjects = snapshot.docs.map((projectDoc) => ({
        id: projectDoc.id,
        data: projectDoc.data()
    }));

    displayProjects();
});

// Project authentication state ↓
onAuthStateChanged(auth, (user) => {
    if (user && user.uid === '6HTSv9H6S6WmxZ7MrBPqUxUfdoo2') {
        openProjectForm.style.display = 'block';
    } else {
        openProjectForm.style.display = 'none';
    }

    displayProjects();
});

// Modal controls ↓
openProjectForm.addEventListener('click', () => {
    projectFormModal.style.display = 'flex';
});

closeProjectForm.addEventListener('click', () => {
    projectFormModal.style.display = 'none';
});

// Create Operation ↓
const addProjectForm = document.getElementById('add-project-form');

addProjectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const image = document.getElementById('project-image').value;

    if (editingProjectId) {
        const projectRef = doc(db, 'projects', editingProjectId);

        await updateDoc(projectRef, {
            title: title,
            description: description,
            image: image
        });
    } else {
        await addDoc(collection(db, 'projects'), {
            title: title,
            description: description,
            image: image
        });
    }

    editingProjectId = null;
    addProjectForm.reset();
    projectFormModal.style.display = 'none';
});

// Edit Operation ↓
let editingProjectId = null;

projectList.addEventListener('click', async (event) => {
    const editButton = event.target.closest('.edit-project');

    if (!editButton) {
        return;
    }

    editingProjectId = editButton.dataset.id;

    const projectRef = doc(db, 'projects', editingProjectId);
    const projectSnapshot = await getDoc(projectRef);

    if (projectSnapshot.exists()) {
        const project = projectSnapshot.data();

        document.getElementById('project-title').value = project.title;
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-image').value = project.image;

        projectFormModal.style.display = 'flex';
    }
});

// Delete Operation ↓
projectList.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('.delete-project');

    if (!deleteButton) {
        return;
    }

    const confirmed = confirm('Are you sure you want to delete this project?');

    if (!confirmed) {
        return;
    }

    const projectId = deleteButton.dataset.id;
    const projectRef = doc(db, 'projects', projectId);

    await deleteDoc(projectRef);
});

// Comment event Listener ↓
const commentsRef = collection(db, 'comments');

projectList.addEventListener('submit', async (event) => {
    const form = event.target.closest('.comment-form');

    if (!form) {
        return;
    }

    event.preventDefault();

    if (!auth.currentUser) {
        alert('You must be signed in to comment.');
        return;
    }

    const commentInput = form.querySelector('.comment-input');
    const text = commentInput.value.trim();

    if (!text) {
        return;
    }

    await addDoc(commentsRef, {
        projectId: form.dataset.projectId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        text: text
    });

    commentInput.value = '';
});

// Show comments when they are made ↓
onSnapshot(commentsRef, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));

    document.querySelectorAll('.project-grid li').forEach((li) => {
        const commentList = li.querySelector('.comment-list');
        const projectId = li.querySelector('.comment-form').dataset.projectId;

        commentList.innerHTML = '';

        comments
            .filter((comment) => comment.projectId === projectId)
            .forEach((comment) => {
                const commentElement = document.createElement('div');

                commentElement.innerHTML = `
                    <p>${comment.userName}: ${comment.text}</p>
                `;

                if (auth.currentUser && auth.currentUser.uid === comment.userId) {
                    commentElement.innerHTML += `
                        <button type="button" class="edit-comment" data-id="${comment.id}">Edit</button>
                        <button type="button" class="delete-comment" data-id="${comment.id}">Delete</button>
                    `;
                }

                commentList.appendChild(commentElement);
            });
    });
});

// Allow users to delete their own comments ↓
projectList.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('.delete-comment');

    if (!deleteButton) {
        return;
    }

    const confirmed = confirm('Are you sure you want to delete this comment?');

    if (!confirmed) {
        return;
    }

    const commentId = deleteButton.dataset.id;
    const commentRef = doc(db, 'comments', commentId);

    await deleteDoc(commentRef);
});

// Allow users to edit their own comments ↓
projectList.addEventListener('click', async (event) => {
    const editButton = event.target.closest('.edit-comment');

    if (!editButton) {
        return;
    }

    const commentId = editButton.dataset.id;
    const commentRef = doc(db, 'comments', commentId);
    const commentSnapshot = await getDoc(commentRef);

    if (!commentSnapshot.exists()) {
        return;
    }

    const comment = commentSnapshot.data();

    const newText = prompt('Edit your comment:', comment.text);

    if (newText === null) {
        return;
    }

    const trimmedText = newText.trim();

    if (!trimmedText) {
        return;
    }

    await updateDoc(commentRef, {
        text: trimmedText
    });
});