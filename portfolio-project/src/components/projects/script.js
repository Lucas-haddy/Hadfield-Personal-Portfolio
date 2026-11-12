import { 
    db, 
    auth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    collection, 
    doc, 
    getDoc, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc 
} from '../../firebase/init.js';

// Google Authentication Login ↓
const googleLogin = document.getElementById('google-login');
const logout = document.getElementById('logout');
const userInfo = document.getElementById('user-info');

googleLogin.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider);
});

logout.addEventListener('click', async () => {
    await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        userInfo.textContent = `Signed in as ${user.displayName}`;
        googleLogin.style.display = 'none';
        logout.style.display = 'inline-block';

        if (user.uid === '6HTSv9H6S6WmxZ7MrBPqUxUfdoo2') {
            openProjectForm.style.display = 'block';
        } else {
            openProjectForm.style.display = 'none';
        }
    } else {
        userInfo.textContent = 'Not signed in';
        googleLogin.style.display = 'inline-block';
        logout.style.display = 'none';
        openProjectForm.style.display = 'none';
    }
});

// Read Operation ↓
const projectList = document.getElementById('project-list');

const projectsRef = collection(db, 'projects');

onSnapshot(projectsRef, (snapshot) => {
    projectList.innerHTML = '';

    snapshot.forEach((doc) => {
        const project = doc.data();

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
        
        li.querySelector('.comment-form').dataset.projectId = doc.id;

        // Hide Edit/Delete buttons if the user isn't ME
        if (auth.currentUser && auth.currentUser.uid === '6HTSv9H6S6WmxZ7MrBPqUxUfdoo2') {
            li.innerHTML += `
                <button type="button" class="edit-project" data-id="${doc.id}">Edit</button>
                <button type="button" class="delete-project" data-id="${doc.id}">Delete</button>
            `;
        }

        projectList.appendChild(li);
    });
});

// Modal controls ↓
const projectFormModal = document.getElementById('project-form-modal');
const openProjectForm = document.getElementById('open-project-form');
const closeProjectForm = document.getElementById('close-project-form');

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