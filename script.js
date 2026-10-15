
"use strict";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const APP_NAMES = {
  computer: "Meu Computador",
  files: "Meus Arquivos",
  notes: "Bloco de Notas",
  calculator: "Calculadora",
  settings: "Configurações"
};

const FILES_KEY = "retros.files.v1";
const NOTE_KEY = "retros.note.v1";
const SETTINGS_KEY = "retros.settings.v1";

let files = [];
let openApps = new Set();
let zIndex = 10;
let expression = "";

function id() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
}

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveFiles() {
  try {
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
    return true;
  } catch {
    alert("Não foi possível salvar os arquivos neste navegador.");
    return false;
  }
}

function openWindow(name) {
  const win = $(`[data-window="${name}"]`);
  if (!win) return;

  win.classList.remove("hidden");
  win.style.zIndex = ++zIndex;
  openApps.add(name);

  if (name === "files") renderFiles();
  updateTaskbar();
  closeStartMenu();
}

function closeWindow(name) {
  const win = $(`[data-window="${name}"]`);
  if (win) win.classList.add("hidden");

  openApps.delete(name);
  updateTaskbar();
}

function minimizeWindow(name) {
  const win = $(`[data-window="${name}"]`);
  if (win) win.classList.add("hidden");

  updateTaskbar();
}

function updateTaskbar() {
  const host = $("#task-buttons");
  host.replaceChildren();

  for (const name of Object.keys(APP_NAMES)) {
    if (!openApps.has(name)) continue;

    const win = $(`[data-window="${name}"]`);
    if (!win) continue;

    const button = document.createElement("button");
    button.className = "task-button" +
      (!win.classList.contains("hidden") ? " active" : "");

    button.textContent = APP_NAMES[name];
    button.title = APP_NAMES[name];

    button.addEventListener("click", () => {
      if (win.classList.contains("hidden")) {
        openWindow(name);
      } else {
        minimizeWindow(name);
      }
    });

    host.append(button);
  }
}

function closeStartMenu() {
  $("#start-menu").classList.add("hidden");
  $("#start-button").setAttribute("aria-expanded", "false");
}

function renderFiles() {
  const host = $("#file-list");
  host.replaceChildren();

  $("#file-status").textContent =
    `${files.length} ${files.length === 1 ? "objeto" : "objetos"}`;

  if (!files.length) {
    const empty = document.createElement("div");
    empty.className = "empty-files";
    empty.textContent = "Esta pasta está vazia.";
    host.append(empty);
    return;
  }

  [...files]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .forEach(file => {
      const row = document.createElement("button");
      row.className = "file-row";

      const name = document.createElement("span");
      name.className = "file-name";
      name.textContent = "📄 " + file.name;

      const type = document.createElement("span");
      type.className = "file-type";
      type.textContent = "Texto";

      row.append(name, type);
      row.title = "Clique para abrir; botão direito para opções";

      row.addEventListener("click", () => openFile(file.id));

      row.addEventListener("contextmenu", event => {
        event.preventDefault();

        const choice = prompt(
          `Arquivo: ${file.name}\nDigite R para renomear ou E para excluir:`,
          "R"
        );

        if (!choice) return;

        if (choice.toUpperCase() === "R") {
          const newName = prompt("Novo nome:", file.name);
          if (!newName || !newName.trim()) return;

          file.name = newName.trim()
            .replace(/[\\/:*?"<>|]/g, "")
            .slice(0, 80);

          if (saveFiles()) renderFiles();
        }

        if (choice.toUpperCase() === "E") {
          if (!confirm(`Excluir "${file.name}"?`)) return;

          files = files.filter(item => item.id !== file.id);
          if (saveFiles()) renderFiles();
        }
      });

      host.append(row);
    });
}

function openFile(fileId) {
  const file = files.find(item => item.id === fileId);
  if (!file) return;

  openWindow("notes");

  $("#note-name").value = file.name;
  $("#note-editor").value = file.content;
  $("#note-editor").dataset.fileId = file.id;
  $("#note-status").textContent = "Arquivo aberto";
}

function newFile() {
  const name = prompt("Nome do novo arquivo:", "Documento.txt");
  if (!name || !name.trim()) return;

  const safeName = name.trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .slice(0, 80);

  if (!safeName) return;

  const file = {
    id: id(),
    name: safeName,
    content: ""
  };

  files.push(file);

  if (!saveFiles()) {
    files.pop();
    return;
  }

  renderFiles();
  openFile(file.id);
  $("#note-status").textContent = "Novo arquivo — não salvo";
}

function loadStandaloneNote() {
  const note = readJSON(NOTE_KEY, {
    name: "Anotações.txt",
    content: ""
  });

  $("#note-name").value = note.name;
  $("#note-editor").value = note.content;
  delete $("#note-editor").dataset.fileId;
  $("#note-status").textContent = "Pronto";
}

function saveNote() {
  const name = $("#note-name").value.trim() || "Anotações.txt";
  const content = $("#note-editor").value;
  const fileId = $("#note-editor").dataset.fileId;

  if (fileId) {
    const file = files.find(item => item.id === fileId);

    if (file) {
      const oldName = file.name;
      file.name = name;
      file.content = content;

      if (!saveFiles()) {
        file.name = oldName;
        return;
      }

      $("#note-status").textContent = "Arquivo salvo";
      renderFiles();
      return;
    }
  }

  try {
    localStorage.setItem(
      NOTE_KEY,
      JSON.stringify({ name, content })
    );
    $("#note-status").textContent = "Anotações salvas";
  } catch {
    alert("Não foi possível salvar as anotações.");
  }
}

// Menu Iniciar, ícones, botões das janelas e atalhos.
document.addEventListener("click", event => {
  const opener = event.target.closest("[data-open]");
  const closer = event.target.closest("[data-close]");
  const minimizer = event.target.closest("[data-minimize]");

  if (opener) {
    const name = opener.dataset.open;
    openWindow(name);

    if (name === "notes") loadStandaloneNote();
  }

  if (closer) closeWindow(closer.dataset.close);
  if (minimizer) minimizeWindow(minimizer.dataset.minimize);

  if (
    !event.target.closest("#start-menu") &&
    !event.target.closest("#start-button")
  ) {
    closeStartMenu();
  }

  if (!event.target.closest("#context-menu")) {
    $("#context-menu").classList.add("hidden");
  }
});

$("#start-button").addEventListener("click", () => {
  const menu = $("#start-menu");
  menu.classList.toggle("hidden");

  $("#start-button").setAttribute(
    "aria-expanded",
    String(!menu.classList.contains("hidden"))
  );

  $("#context-menu").classList.add("hidden");
});

$("#about-button").addEventListener("click", () => {
  closeStartMenu();
  alert(
    "RetrOs Web 1.0\n\n" +
    "Desktop retrô experimental.\n" +
    "Feito com HTML, CSS e JavaScript."
  );
});

// Gerenciador de arquivos.
$("#new-file").addEventListener("click", newFile);
$("#refresh-files").addEventListener("click", renderFiles);
$("#context-refresh").addEventListener("click", () => {
  $("#context-menu").classList.add("hidden");
  renderFiles();
});

// Bloco de Notas.
$("#save-note").addEventListener("click", saveNote);

$("#clear-note").addEventListener("click", () => {
  if (!confirm("Limpar o texto atual?")) return;

  $("#note-editor").value = "";
  delete $("#note-editor").dataset.fileId;
  $("#note-status").textContent = "Texto limpo — não salvo";
});

$("#note-editor").addEventListener("input", () => {
  $("#note-status").textContent = "Alterações não salvas";
});

$("#note-name").addEventListener("input", () => {
  $("#note-status").textContent = "Alterações não salvas";
});

// Personalização do desktop.
$$("[data-wall]").forEach(button => {
  button.addEventListener("click", () => {
    const color = button.dataset.wall;

    $("#desktop").style.backgroundColor = color;
    document.body.style.backgroundColor = color;

    const settings = readJSON(SETTINGS_KEY, {});
    settings.wallpaper = color;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      alert("Não foi possível salvar a configuração.");
    }
  });
});

// Calculadora.
$$("[data-calc]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.calc;
    const display = $("#calc-display");

    if (key === "C") {
      expression = "";
    } else if (key === "back") {
      expression = expression.slice(0, -1);
    } else if (key === "=") {
      try {
        if (!expression ||
            !/^[0-9+\-*/().\s]+$/.test(expression)) {
          throw new Error("Expressão inválida");
        }

        // A expressão só aceita números e operadores matemáticos.
        const result = Function(
          '"use strict"; return (' + expression + ')'
        )();

        if (!Number.isFinite(result)) {
          throw new Error("Resultado inválido");
        }

        expression = String(
          Math.round((result + Number.EPSILON) * 1e10) / 1e10
        );
      } catch {
        display.value = "Erro";
        expression = "";
        return;
      }
    } else if (expression.length < 80) {
      expression += key;
    }

    display.value = expression || "0";
  });
});

// Arrastar as janelas pela barra de título.
$$(".window").forEach(win => {
  const bar = $(".titlebar", win);
  let drag = null;

  bar.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;

    const rect = win.getBoundingClientRect();

    drag = {
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top
    };

    win.style.transform = "none";
    win.style.left = rect.left + "px";
    win.style.top = rect.top + "px";
    win.style.zIndex = ++zIndex;

    bar.setPointerCapture(event.pointerId);
  });

  bar.addEventListener("pointermove", event => {
    if (!drag) return;

    const left = drag.left + event.clientX - drag.x;
    const top = drag.top + event.clientY - drag.y;

    win.style.left = Math.max(
      0, Math.min(window.innerWidth - win.offsetWidth, left)
    ) + "px";

    win.style.top = Math.max(
      0, Math.min(window.innerHeight - 50, top)
    ) + "px";
  });

  const stopDrag = () => { drag = null; };

  bar.addEventListener("pointerup", stopDrag);
  bar.addEventListener("pointercancel", stopDrag);

  win.addEventListener("pointerdown", () => {
    win.style.zIndex = ++zIndex;
  });
});

// Menu do botão direito na área de trabalho.
$("#desktop").addEventListener("contextmenu", event => {
  if (event.target.closest(".window, .desktop-icon")) return;

  event.preventDefault();

  const menu = $("#context-menu");
  menu.classList.remove("hidden");

  menu.style.left = Math.min(
    event.clientX, window.innerWidth - 220
  ) + "px";

  menu.style.top = Math.min(
    event.clientY, window.innerHeight - 100
  ) + "px";
});

// Inicialização.
const savedSettings = readJSON(SETTINGS_KEY, {});

if (savedSettings.wallpaper) {
  $("#desktop").style.backgroundColor = savedSettings.wallpaper;
  document.body.style.backgroundColor = savedSettings.wallpaper;
}

const storedFiles = readJSON(FILES_KEY, null);

if (Array.isArray(storedFiles)) {
  files = storedFiles.filter(file =>
    file &&
    typeof file.id === "string" &&
    typeof file.name === "string" &&
    typeof file.content === "string"
  );
} else {
  files = [
    {
      id: id(),
      name: "Leia-me.txt",
      content:
        "Bem-vindo ao RetrOs!\n\n" +
        "Este é seu primeiro arquivo virtual."
    },
    {
      id: id(),
      name: "Bem-vindo.txt",
      content:
        "RetrOs Web 1.0\n" +
        "Seu desktop retrô no navegador."
    }
  ];

  saveFiles();
}

function updateClock() {
  $("#clock").textContent = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

updateClock();
setInterval(updateClock, 15000);
renderFiles();
updateTaskbar();

