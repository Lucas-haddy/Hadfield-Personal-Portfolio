import { db, collection, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from '../../firebase/init.js';

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
            <button type="button" class="edit-project" data-id="${doc.id}">Edit</button>
            <button type="button" class="delete-project" data-id="${doc.id}">Delete</button>
        `;

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