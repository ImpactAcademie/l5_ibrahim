const defaultQuests = [
  { id: "quest-1", title: "Finir mon devoir de maths", category: "ÉCOLE", completed: false },
  { id: "quest-2", title: "Ranger mon espace de jeu", category: "MAISON", completed: false },
  { id: "quest-3", title: "Lire 10 pages de mon livre", category: "PERSO", completed: true },
  { id: "quest-4", title: "Faire une pause et bouger", category: "ÉNERGIE", completed: false },
];

const storageKey = "blockquest-quests-v1";
const readSavedQuests = () => {
  try {
    const savedQuests = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(savedQuests) && savedQuests.every((quest) => quest && typeof quest.id === "string" && typeof quest.title === "string" && typeof quest.completed === "boolean")) {
      return savedQuests;
    }
  } catch {
    // Use the starter quests if local storage is unavailable or invalid.
  }
  return defaultQuests;
};

let quests = readSavedQuests();
let activeFilter = "all";

const questList = document.querySelector("#quest-list");
const questCount = document.querySelector("#quest-count");
const emptyState = document.querySelector("#empty-state");
const questForm = document.querySelector("#quest-form");
const questInput = document.querySelector("#quest-input");
const openFormButton = document.querySelector("#open-form");
const filterButtons = document.querySelectorAll(".filter-button");

function saveQuests() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(quests));
  } catch {
    // The list remains usable for this session when storage is unavailable.
  }
}

function updateStats() {
  const completed = quests.filter((quest) => quest.completed).length;
  const xp = completed * 25;
  const percent = quests.length === 0 ? 0 : Math.round((completed / quests.length) * 100);

  document.querySelector("#xp-total").textContent = String(xp).padStart(3, "0");
  document.querySelector("#completed-total").textContent = String(completed);
  document.querySelector("#progress-label").textContent = `${percent}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", String(percent));
  document.querySelector("#progress-fill").style.width = `${percent}%`;
  document.querySelector("#level-number").textContent = String(Math.floor(xp / 100) + 1).padStart(2, "0");
  document.querySelector("#next-level-xp").textContent = `${100 - (xp % 100)} XP`;
  document.querySelector("#rank-fill").style.width = `${xp % 100}%`;
  questCount.textContent = String(quests.length);
}

function renderQuests() {
  const visibleQuests = quests.filter((quest) => {
    if (activeFilter === "active") return !quest.completed;
    if (activeFilter === "completed") return quest.completed;
    return true;
  });

  questList.replaceChildren();
  for (const quest of visibleQuests) {
    const item = document.createElement("li");
    item.className = `quest-item${quest.completed ? " is-complete" : ""}`;

    const toggle = document.createElement("button");
    toggle.className = "quest-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", `${quest.completed ? "Marquer comme à faire" : "Terminer"} : ${quest.title}`);
    toggle.setAttribute("aria-pressed", String(quest.completed));
    toggle.innerHTML = quest.completed ? '<span class="quest-check" aria-hidden="true">✓</span>' : "";
    toggle.addEventListener("click", () => {
      quest.completed = !quest.completed;
      saveQuests();
      renderQuests();
    });

    const copy = document.createElement("div");
    copy.className = "quest-copy";
    const title = document.createElement("span");
    title.className = "quest-title";
    title.textContent = quest.title;
    const meta = document.createElement("span");
    meta.className = "quest-meta";
    const category = document.createElement("span");
    category.className = "quest-category";
    category.textContent = quest.category || "PERSO";
    meta.append(category, document.createTextNode("• QUÊTE DU JOUR"));
    copy.append(title, meta);

    const reward = document.createElement("span");
    reward.className = "quest-reward";
    reward.textContent = quest.completed ? "+25 XP" : "25 XP";

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.setAttribute("aria-label", `Supprimer : ${quest.title}`);
    remove.title = "Supprimer la quête";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      quests = quests.filter((itemQuest) => itemQuest.id !== quest.id);
      saveQuests();
      renderQuests();
    });

    item.append(toggle, copy, reward, remove);
    questList.append(item);
  }

  emptyState.hidden = visibleQuests.length > 0;
  updateStats();
}

openFormButton.addEventListener("click", () => {
  questForm.hidden = !questForm.hidden;
  if (!questForm.hidden) questInput.focus();
});

questForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = questInput.value.trim();
  if (!title) return;

  quests.unshift({ id: crypto.randomUUID(), title, category: "PERSO", completed: false });
  activeFilter = "all";
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  questInput.value = "";
  questForm.hidden = true;
  saveQuests();
  renderQuests();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderQuests();
  });
});

renderQuests();