import { db, collection, getDocs, addDoc } from '../../firebase/init.js';

// Read Operation ↓
const projectList = document.getElementById('project-list');

const projectsRef = collection(db, 'projects');
const snapshot = await getDocs(projectsRef);

snapshot.forEach((doc) => {
    const project = doc.data();

    const li = document.createElement('li');

    li.innerHTML = `
        <h4>${project.title}</h4>
        <img src="${project.image}" alt="${project.title}">
        <p>${project.description}</p>
    `;

    projectList.appendChild(li);
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

    await addDoc(collection(db, 'projects'), {
        title: title,
        description: description,
        image: image
    });

    addProjectForm.reset();
    projectFormModal.style.display = 'none';
});