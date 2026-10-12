const storageKey = "portfolioProjects";

const defaultProjects = [
  {
    id: crypto.randomUUID(),
    title: "AAT Portfolio Project Tracker",
    objective: "Track project milestones, technologies, deadlines, and documentation status for academic portfolio submission.",
    technology: "HTML, CSS, JavaScript",
    deadline: "2026-10-16",
    progress: 85,
    status: "Testing"
  },
  {
    id: crypto.randomUUID(),
    title: "GitHub README Preparation",
    objective: "Prepare a clear README with objective, features, execution steps, screenshots, and output details.",
    technology: "Markdown, Git",
    deadline: "2026-10-15",
    progress: 70,
    status: "Development"
  }
];

const form = document.querySelector("#projectForm");
const projectContainer = document.querySelector("#projects");
const template = document.querySelector("#projectCardTemplate");
const statusFilter = document.querySelector("#statusFilter");
const exportButton = document.querySelector("#exportButton");

function loadProjects() {
  const savedProjects = localStorage.getItem(storageKey);
  if (!savedProjects) {
    localStorage.setItem(storageKey, JSON.stringify(defaultProjects));
    return defaultProjects;
  }
  return JSON.parse(savedProjects);
}

function saveProjects(projects) {
  localStorage.setItem(storageKey, JSON.stringify(projects));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function renderDashboard(projects) {
  const activeProjects = projects.filter((project) => project.status !== "Completed");
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress), 0) / projects.length)
    : 0;
  const upcoming = [...projects]
    .filter((project) => project.status !== "Completed")
    .sort((first, second) => new Date(first.deadline) - new Date(second.deadline))[0];

  document.querySelector("#totalProjects").textContent = projects.length;
  document.querySelector("#activeProjects").textContent = activeProjects.length;
  document.querySelector("#averageProgress").textContent = `${averageProgress}%`;
  document.querySelector("#nextDeadline").textContent = upcoming ? formatDate(upcoming.deadline) : "-";
}

function renderProjects() {
  const projects = loadProjects();
  const filter = statusFilter.value;
  const visibleProjects = filter === "All"
    ? projects
    : projects.filter((project) => project.status === filter);

  renderDashboard(projects);
  projectContainer.innerHTML = "";

  if (!visibleProjects.length) {
    projectContainer.innerHTML = '<p class="empty-state">No projects match the selected status.</p>';
    return;
  }

  visibleProjects.forEach((project) => {
    const card = template.content.cloneNode(true);
    card.querySelector("h3").textContent = project.title;
    card.querySelector(".objective").textContent = project.objective;
    card.querySelector(".technology").textContent = project.technology;
    card.querySelector(".deadline").textContent = formatDate(project.deadline);
    card.querySelector(".status").textContent = project.status;
    card.querySelector(".progress-value").textContent = `${project.progress}%`;
    card.querySelector(".progress-fill").style.width = `${project.progress}%`;
    card.querySelector(".delete-button").addEventListener("click", () => deleteProject(project.id));
    projectContainer.appendChild(card);
  });
}

function deleteProject(projectId) {
  const projects = loadProjects().filter((project) => project.id !== projectId);
  saveProjects(projects);
  renderProjects();
}

function addProject(event) {
  event.preventDefault();
  const data = new FormData(form);
  const projects = loadProjects();
  projects.unshift({
    id: crypto.randomUUID(),
    title: data.get("title").trim(),
    objective: data.get("objective").trim(),
    technology: data.get("technology").trim(),
    deadline: data.get("deadline"),
    progress: Number(data.get("progress")),
    status: data.get("status")
  });
  saveProjects(projects);
  form.reset();
  document.querySelector("#progress").value = 25;
  renderProjects();
}

function exportSummary() {
  const projects = loadProjects();
  const lines = projects.map((project, index) => {
    return `${index + 1}. ${project.title} | ${project.status} | ${project.progress}% | Deadline: ${formatDate(project.deadline)}`;
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "portfolio-project-summary.txt";
  link.click();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", addProject);
statusFilter.addEventListener("change", renderProjects);
exportButton.addEventListener("click", exportSummary);

renderProjects();
