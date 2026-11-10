import { db, collection, getDocs } from '../../firebase/init.js';

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