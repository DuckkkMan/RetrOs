
"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const FILES_KEY = "retros_files_v3";
const NOTE_KEY = "retros_note_v3";
const BG_KEY = "retros_background_v3";

const desktop = $("#desktop");
const desktopIcons = $("#desktop-icons");
const windowLayer = $("#window-layer");
const taskbarWindows = $("#taskbar-windows");
const startMenu = $("#start-menu");
const startApps = $("#start-apps");
const startSearch = $("#start-search");
const contextMenu = $("#context-menu");

let zIndex = 10;
let nextWindowId = 0;
const windows = new Map();

const appDefinitions = [
  { key: "computer", icon: "🖥️", name: "Meu Computador" },
  { key: "google", icon: "🌐", name: "Google.app" },
  { key: "files", icon: "📁", name: "Meus Arquivos" },
  { key: "notes", icon: "📝", name: "Bloco de Notas" },
  { key: "calculator", icon: "🧮", name: "Calculadora" },
  { key: "settings", icon: "🎨", name: "Personalização" },
  { key: "terminal", icon: "💻", name: "Terminal" },
  { key: "creator", icon: "🧩", name: "Criar aplicativo" }
];

function makeId() {
  return "app-" + Date.now().toString(36) +
    "-" + Math.random().toString(36).slice(2, 8);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

const googleAppCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Google</title>
<style>
body{font-family:Arial,sans-serif;color:#202124;background:#fff;text-align:center;padding:25px 12px}
.logo{font-size:clamp(42px,10vw,68px);font-weight:bold;letter-spacing:-3px;margin:35px 0}
form{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
input{box-sizing:border-box;width:100%;max-width:460px;padding:14px 18px;border:1px solid #dadce0;border-radius:30px;font-size:16px}
button{padding:11px 16px;border:0;border-radius:6px;cursor:pointer;background:#f8f9fa}
button:hover{box-shadow:0 1px 4px #0003}
.info{margin-top:25px;color:#666;font-size:13px}
</style>
</head>
<body>
<div class="logo"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></div>
<form id="searchForm">
<input id="query" name="q" type="search" placeholder="Pesquisar no Google..." required>
<button type="submit">Pesquisa Google</button>
</form>
<div style="margin-top:18px">
<button type="button" id="youtube">▶ YouTube</button>
<button type="button" id="gmail">✉ Gmail</button>
<button type="button" id="maps">🗺 Maps</button>
</div>
<p class="info">Pesquisa real · Resultados do Google</p>
<script>
document.getElementById("searchForm").addEventListener("submit",function(e){
 e.preventDefault();
 var q=document.getElementById("query").value.trim();
 if(!q)return;
 window.open("https://www.google.com/search?q="+encodeURIComponent(q),"_blank","noopener,noreferrer");
});
document.getElementById("youtube").onclick=function(){window.open("https://www.youtube.com/","_blank","noopener,noreferrer")};
document.getElementById("gmail").onclick=function(){window.open("https://mail.google.com/","_blank","noopener,noreferrer")};
document.getElementById("maps").onclick=function(){window.open("https://maps.google.com/","_blank","noopener,noreferrer")};
<\/script>
</body>
</html>`;

const exampleAppCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial;background:#eef4ff;color:#172033;padding:25px}
.card{max-width:440px;margin:auto;background:white;border-radius:16px;padding:25px;text-align:center;box-shadow:0 8px 25px #0002}
button{padding:12px 18px;border:0;border-radius:8px;background:#176b87;color:white;cursor:pointer}
</style>
</head>
<body>
<div class="card">
<h1>🚀 Meu aplicativo</h1>
<p>Este app executa HTML, CSS e JavaScript!</p>
<button id="button">Clique aqui</button>
<p id="result">Esperando...</p>
</div>
<script>
document.getElementById("button").onclick=function(){
 document.getElementById("result").textContent="Funcionou! 🎉";
};
<\/script>
</body>
</html>`;

function loadFiles() {
  try {
    const stored = JSON.parse(localStorage.getItem(FILES_KEY) || "[]");
    if (Array.isArray(stored)) {
      return stored.filter(file =>
        file && typeof file.id === "string" &&
        typeof file.name === "string" &&
        ["app", "txt", "exe"].includes(file.type)
      );
    }
  } catch (error) {
    console.warn("Erro ao carregar arquivos:", error);
  }
  return [];
}

let files = loadFiles();

function saveFiles() {
  try {
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
    return true;
  } catch (error) {
    alert("Não foi possível salvar. O armazenamento do navegador pode estar cheio.");
    return false;
  }
}

function ensureSystemApps() {
  if (!files.some(file => file.name.toLowerCase() === "google.app")) {
    files.push({
      id: makeId(),
      name: "Google.app",
      type: "app",
      icon: "🌐",
      description: "Pesquisa real do Google.",
      content: googleAppCode,
      system: true
    });
  }

  if (!files.some(file => file.name.toLowerCase() === "manual.app")) {
    files.push({
      id: makeId(),
      name: "Manual.app",
      type: "app",
      icon: "📘",
      description: "Manual do RetrOS.",
      content: "<h1>Manual do RetrOS</h1><p>Abra o Google.app para pesquisar na internet.</p><p>Use Criar aplicativo para criar apps HTML, CSS e JavaScript.</p>",
      system: true
    });
  }

  saveFiles();
}

ensureSystemApps();

function renderDesktop() {
  const userApps = files
    .filter(file => file.type === "app")
    .map(file => ({
      key: "file:" + file.id,
      icon: file.icon || "🧩",
      name: file.name
    }));

  const allApps = [
    ...appDefinitions.filter(app => app.key !== "google"),
    ...userApps
  ];

  desktopIcons.innerHTML = allApps.map(app => `
    <button class="desktop-icon" data-action="desktop-open" data-key="${escapeHTML(app.key)}">
      <span class="emoji">${escapeHTML(app.icon)}</span>
      <span class="icon-label">${escapeHTML(app.name)}</span>
    </button>
  `).join("");

  renderStartMenu();
}

function renderStartMenu(filter = "") {
  const term = filter.toLowerCase();

  const builtIn = appDefinitions.filter(app =>
    app.name.toLowerCase().includes(term)
  );

  const userApps = files.filter(file =>
    file.type === "app" &&
    file.name.toLowerCase().includes(term)
  );

  startApps.innerHTML = [
    ...builtIn.map(app => `
      <button class="menu-app" data-action="open-app" data-key="${escapeHTML(app.key)}">
        <span>${escapeHTML(app.icon)}</span>${escapeHTML(app.name)}
      </button>
    `),
    ...userApps.map(file => `
      <button class="menu-app" data-action="open-file" data-id="${escapeHTML(file.id)}">
        <span>${escapeHTML(file.icon || "🧩")}</span>${escapeHTML(file.name)}
      </button>
    `)
  ].join("") || `<p class="muted">Nenhum aplicativo encontrado.</p>`;
}

function createWindow(title, icon, content, appKey, width = 650) {
  const id = "window-" + (++nextWindowId);
  const win = document.createElement("section");

  win.className = "window";
  win.dataset.windowId = id;
  win.style.width = `min(${width}px, calc(100vw - 16px))`;

  win.innerHTML = `
    <div class="titlebar">
      <div class="titlebar-name">
        <span>${escapeHTML(icon)}</span>
        <span>${escapeHTML(title)}</span>
      </div>
      <div class="window-controls">
        <button data-action="minimize" title="Minimizar">—</button>
        <button data-action="maximize" title="Maximizar">□</button>
        <button class="close-window" data-action="close" title="Fechar">×</button>
      </div>
    </div>
    <div class="window-body">${content}</div>
  `;

  windowLayer.appendChild(win);

  const taskButton = document.createElement("button");
  taskButton.className = "taskbar-window";
  taskButton.dataset.action = "toggle-window";
  taskButton.dataset.id = id;
  taskButton.textContent = icon + " " + title;
  taskbarWindows.appendChild(taskButton);

  windows.set(id, { element: win, taskButton, appKey });
  win.style.left = Math.max(8, Math.min(120, innerWidth / 2 - width / 2)) + "px";
  win.style.top = Math.max(8, Math.min(90, innerHeight / 2 - 220)) + "px";

  focusWindow(id);
  return id;
}

function focusWindow(id) {
  const entry = windows.get(id);
  if (!entry) return;

  entry.element.style.zIndex = ++zIndex;
  $$(".taskbar-window").forEach(button => button.classList.remove("active"));
  entry.taskButton.classList.add("active");
}

function closeWindow(id) {
  const entry = windows.get(id);
  if (!entry) return;

  entry.element.remove();
  entry.taskButton.remove();
  windows.delete(id);
}

function minimizeWindow(id) {
  const entry = windows.get(id);
  if (!entry) return;

  entry.element.classList.add("hidden");
  entry.taskButton.classList.remove("active");
}

function toggleWindow(id) {
  const entry = windows.get(id);
  if (!entry) return;

  if (entry.element.classList.contains("hidden")) {
    entry.element.classList.remove("hidden");
    focusWindow(id);
  } else {
    minimizeWindow(id);
  }
}

function openApp(key) {
  startMenu.classList.add("hidden");
  contextMenu.classList.add("hidden");

  switch (key) {
    case "computer":
      createWindow("Meu Computador", "🖥️", `
        <h2 class="panel-heading">Bem-vindo ao RetrOS</h2>
        <p>Seu sistema operacional virtual no navegador.</p>
        <p>Os arquivos são salvos neste navegador.</p>
        <p>Os aplicativos .app executam HTML, CSS e JavaScript em uma janela isolada.</p>
      `, key);
      break;

    case "google":
      openFile(files.find(file =>
        file.name.toLowerCase() === "google.app"
      )?.id);
      break;

    case "files":
      createWindow("Meus Arquivos", "📁", renderFiles(), key, 760);
      break;

    case "notes":
      openNotes();
      break;

    case "calculator":
      createWindow("Calculadora", "🧮", `
        <input class="calc-display" value="0" readonly>
        <div class="calc-grid">
          ${["7","8","9","/","4","5","6","*","1","2","3","-","0",".","C","+","(",")","%","="].map(value =>
            `<button data-action="calc" data-value="${value}">${value}</button>`
          ).join("")}
        </div>
      `, key, 340);
      break;

    case "settings":
      createWindow("Personalização", "🎨", `
        <h2 class="panel-heading">Papel de parede</h2>
        <label class="form-field">Escolha uma cor
          <input type="color" id="wallpaper-color" value="#176b87">
        </label>
        <button class="retro-button" data-action="set-wallpaper">Aplicar cor</button>
        <button class="retro-button" data-action="reset-wallpaper">Restaurar fundo</button>
      `, key);
      break;

    case "terminal":
      createWindow("Terminal", "💻", `
        <div class="terminal">
          <div class="terminal-output">RetrOS Terminal. Digite help.</div>
          <form class="terminal-form">
            <label>retrOS&gt;</label>
            <input name="command" autocomplete="off" spellcheck="false">
          </form>
        </div>
      `, key, 650);
      break;

    case "creator":
      createWindow("Criar aplicativo .app", "🧩", `
        <form class="creator-form">
          <label class="form-field">Nome do aplicativo
            <input name="name" placeholder="MeuApp.app" required maxlength="50">
          </label>
          <label class="form-field">Ícone (emoji)
            <input name="icon" value="🚀" maxlength="12">
          </label>
          <label class="form-field">Descrição
            <input name="description" placeholder="Descrição do app" maxlength="160">
          </label>
          <label class="form-field">Código HTML, CSS e JavaScript
            <textarea name="code" class="app-code-editor" rows="13">${escapeHTML(exampleAppCode)}</textarea>
          </label>
          <button class="retro-button" type="submit">Criar aplicativo</button>
        </form>
      `, key, 760);
      break;

    default:
      if (key.startsWith("file:")) openFile(key.slice(5));
  }
}

function renderFiles() {
  return `
    <h2 class="panel-heading">📁 Meus Arquivos</h2>
    <div class="button-row">
      <button class="retro-button" data-action="open-app" data-key="google">🌐 Abrir Google</button>
      <button class="retro-button" data-action="open-app" data-key="creator">🧩 Criar aplicativo</button>
      <button class="retro-button" data-action="new-text">📄 Novo texto</button>
    </div>
    <div class="file-list">
      ${files.map(file => `
        <div class="file-row">
          <div class="file-main">
            <span class="file-emoji">${escapeHTML(file.icon || (file.type === "txt" ? "📝" : "🧩"))}</span>
            <div class="file-details">
              <strong>${escapeHTML(file.name)}</strong>
              <small>${escapeHTML(file.type.toUpperCase())}${file.system ? " · Sistema" : ""}</small>
            </div>
          </div>
          <div class="file-actions">
            <button class="file-button" data-action="open-file" data-id="${escapeHTML(file.id)}">Abrir</button>
            ${file.system ? "" : `<button class="file-button" data-action="rename-file" data-id="${escapeHTML(file.id)}">Renomear</button><button class="file-button" data-action="delete-file" data-id="${escapeHTML(file.id)}">Excluir</button>`}
          </div>
        </div>
      `).join("")}
    </div>
    <p class="muted">O Google.app é instalado automaticamente pelo RetrOS.</p>
  `;
}

function openFile(id) {
  const file = files.find(item => item.id === id);
  if (!file) return alert("Arquivo não encontrado.");

  if (file.type === "txt") {
    openNotes(id);
    return;
  }

  if (file.type === "exe") {
    alert("Este .exe é apenas um arquivo virtual. Ele não executa programas do Windows.");
    return;
  }

  createAppWindow(file);
}

function createAppWindow(file) {
  const id = createWindow(file.name, file.icon || "🧩", `
    <div class="app-editor" data-id="${escapeHTML(file.id)}">
      <div class="button-row">
        <button class="retro-button" data-action="run-app">▶ Executar</button>
        <button class="retro-button" data-action="save-app">💾 Salvar código</button>
      </div>
      <iframe class="app-preview" sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" title="${escapeHTML(file.name)}"></iframe>
      <label class="form-field">Código do aplicativo
        <textarea class="app-code-editor app-code" spellcheck="false" rows="13">${escapeHTML(file.content || "")}</textarea>
      </label>
      <p class="muted">Apps executam em um iframe isolado. O Google.app abre pesquisas reais em novas abas.</p>
    </div>
  `, "user-app", 780);

  const entry = windows.get(id);
  const editor = $(".app-editor", entry.element);
  runPreview(editor);
}

function runPreview(editor) {
  if (!editor) return;

  const frame = $(".app-preview", editor);
  frame.srcdoc = $(".app-code", editor).value;
}

function saveApp(editor) {
  const file = files.find(item => item.id === editor.dataset.id);
  if (!file) return;

  file.content = $(".app-code", editor).value;
  saveFiles();
  alert("Código salvo!");
}

function createApp(form) {
  let name = form.elements.name.value.trim();
  if (!name) return;

  if (!name.toLowerCase().endsWith(".app")) name += ".app";

  if (files.some(file => file.name.toLowerCase() === name.toLowerCase())) {
    alert("Já existe um arquivo com esse nome.");
    return;
  }

  const file = {
    id: makeId(),
    name,
    type: "app",
    icon: form.elements.icon.value.trim() || "🧩",
    description: form.elements.description.value.trim(),
    content: form.elements.code.value,
    system: false
  };

  files.push(file);
  if (!saveFiles()) {
    files = files.filter(item => item.id !== file.id);
    return;
  }

  renderDesktop();
  closeWindow(form.closest(".window").dataset.windowId);
  openFile(file.id);
}

function openNotes(id = null) {
  const file = files.find(item => item.id === id);
  const content = file ? file.content || "" : localStorage.getItem(NOTE_KEY) || "";

  createWindow(file?.name || "Bloco de Notas", "📝", `
    <div class="note-editor" data-id="${escapeHTML(id || "")}">
      <textarea class="note-textarea" rows="15" style="width:100%;resize:vertical;">${escapeHTML(content)}</textarea>
      <div class="button-row">
        <button class="retro-button" data-action="save-note">💾 Salvar</button>
        <button class="retro-button" data-action="save-note-as">📄 Salvar como</button>
      </div>
    </div>
  `, "notes");
}

function saveNote(editor, saveAs = false) {
  const content = $(".note-textarea", editor).value;
  const id = editor.dataset.id;

  if (id && !saveAs) {
    const file = files.find(item => item.id === id);
    if (!file) return;
    file.content = content;
    saveFiles();
    alert("Arquivo salvo!");
    return;
  }

  if (!saveAs) {
    localStorage.setItem(NOTE_KEY, content);
    alert("Nota salva!");
    return;
  }

  const name = prompt("Nome do arquivo:", "MinhaNota.txt");
  if (!name) return;

  files.push({
    id: makeId(),
    name: name.toLowerCase().endsWith(".txt") ? name : name + ".txt",
    type: "txt",
    content
  });

  saveFiles();
  renderDesktop();
  alert("Arquivo criado!");
}

function terminalCommand(raw, output) {
  const [command, ...args] = raw.trim().split(/\s+/);
  const rest = args.join(" ");
  const line = document.createElement("div");
  line.textContent = "retrOS> " + raw;
  output.appendChild(line);

  const write = text => {
    const div = document.createElement("div");
    div.textContent = text;
    output.appendChild(div);
  };

  switch ((command || "").toLowerCase()) {
    case "help":
      write("help, ls, date, whoami, open NOME, create-app, calc EXPRESSAO, clear");
      break;

    case "ls":
      write(files.map(file => file.name).join("\n"));
      break;

    case "date":
      write(new Date().toLocaleString("pt-BR"));
      break;

    case "whoami":
      write("usuario@retros");
      break;

    case "open": {
      const file = files.find(item => item.name.toLowerCase() === rest.toLowerCase());
      if (file) openFile(file.id);
      else write("Arquivo não encontrado.");
      break;
    }

    case "create-app":
      openApp("creator");
      break;

    case "calc":
      try {
        if (!/^[0-9+\-*/().%\s]+$/.test(rest)) throw new Error();
        write(String(Function('"use strict";return (' + rest + ')')()));
      } catch {
        write("Expressão inválida.");
      }
      break;

    case "clear":
      output.innerHTML = "";
      break;

    default:
      write("Comando desconhecido. Digite help.");
  }

  output.scrollTop = output.scrollHeight;
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    if (!event.target.closest("#start-menu")) startMenu.classList.add("hidden");
    if (!event.target.closest("#context-menu")) contextMenu.classList.add("hidden");
    return;
  }

  const action = button.dataset.action;
  const key = button.dataset.key;
  const id = button.dataset.id;
  const win = button.closest(".window");
  const winId = win?.dataset.windowId;

  switch (action) {
    case "open-app":
      openApp(key);
      break;

    case "desktop-open":
      key.startsWith("file:") ? openFile(key.slice(5)) : openApp(key);
      break;

    case "open-file":
      openFile(id);
      break;

    case "close":
      closeWindow(winId);
      break;

    case "minimize":
      minimizeWindow(winId);
      break;

    case "maximize":
      win.classList.toggle("maximized");
      focusWindow(winId);
      break;

    case "toggle-window":
      toggleWindow(id);
      break;

    case "refresh":
      renderDesktop();
      contextMenu.classList.add("hidden");
      break;

    case "run-app":
      runPreview(button.closest(".app-editor"));
      break;

    case "save-app":
      saveApp(button.closest(".app-editor"));
      break;

    case "save-note":
      saveNote(button.closest(".note-editor"));
      break;

    case "save-note-as":
      saveNote(button.closest(".note-editor"), true);
      break;

    case "new-text": {
      const name = prompt("Nome do arquivo:", "NovoTexto.txt");
      if (!name) break;

      files.push({
        id: makeId(),
        name: name.toLowerCase().endsWith(".txt") ? name : name + ".txt",
        type: "txt",
        content: ""
      });

      saveFiles();
      renderDesktop();
      break;
    }

    case "rename-file": {
      const file = files.find(item => item.id === id);
      if (!file || file.system) break;

      const name = prompt("Novo nome:", file.name);
      if (!name) break;

      file.name = name;
      saveFiles();
      renderDesktop();
      break;
    }

    case "delete-file": {
      const file = files.find(item => item.id === id);
      if (!file || file.system) break;
      if (!confirm("Excluir " + file.name + "?")) break;

      files = files.filter(item => item.id !== id);
      saveFiles();
      renderDesktop();
      break;
    }

    case "set-wallpaper": {
      const color = $("#wallpaper-color", win)?.value;
      if (!color) break;
      desktop.style.background = color;
      localStorage.setItem(BG_KEY, color);
      break;
    }

    case "reset-wallpaper":
      desktop.style.background = "radial-gradient(ellipse at 75% 30%, #4bc0d0, transparent 35%), linear-gradient(135deg,#164e76,#168b9b 55%,#173e70)";
      localStorage.removeItem(BG_KEY);
      break;

    case "calc": {
      const display = $(".calc-display", win);
      const value = button.dataset.value;

      if (value === "C") {
        display.value = "0";
      } else if (value === "=") {
        try {
          if (!/^[0-9+\-*/().%\s]+$/.test(display.value)) throw new Error();
          display.value = String(Function('"use strict";return (' + display.value + ')')());
        } catch {
          display.value = "Erro";
        }
      } else {
        display.value = display.value === "0" ? value : display.value + value;
      }
      break;
    }
  }
});

$("#start-button").addEventListener("click", event => {
  event.stopPropagation();
  startMenu.classList.toggle("hidden");
  contextMenu.classList.add("hidden");
});

$("#start-search").addEventListener("input", () => {
  renderStartMenu(startSearch.value);
});

$("#start-power").addEventListener("click", () => {
  if (confirm("Recarregar o RetrOS?")) location.reload();
});

document.addEventListener("submit", event => {
  const form = event.target;

  if (form.matches(".creator-form")) {
    event.preventDefault();
    createApp(form);
  }

  if (form.matches(".terminal-form")) {
    event.preventDefault();
    const input = form.elements.command;
    const output = $(".terminal-output", form.closest(".terminal"));
    const command = input.value;
    input.value = "";
    terminalCommand(command, output);
    input.focus();
  }
});

// Arrastar janelas
let drag = null;

windowLayer.addEventListener("pointerdown", event => {
  const titlebar = event.target.closest(".titlebar");
  const win = event.target.closest(".window");
  if (!win) return;

  focusWindow(win.dataset.windowId);

  if (!titlebar || event.target.closest("button") || win.classList.contains("maximized")) return;

  const rect = win.getBoundingClientRect();

  drag = {
    win,
    x: event.clientX,
    y: event.clientY,
    left: rect.left,
    top: rect.top
  };
});

window.addEventListener("pointermove", event => {
  if (!drag) return;

  drag.win.style.left = Math.max(0, drag.left + event.clientX - drag.x) + "px";
  drag.win.style.top = Math.max(0, drag.top + event.clientY - drag.y) + "px";
});

window.addEventListener("pointerup", () => drag = null);
window.addEventListener("pointercancel", () => drag = null);

// Menu do botão direito
desktop.addEventListener("contextmenu", event => {
  if (event.target.closest(".window") || event.target.closest(".taskbar")) return;

  event.preventDefault();
  contextMenu.classList.remove("hidden");
  startMenu.classList.add("hidden");

  contextMenu.style.left = Math.max(0, Math.min(event.clientX, innerWidth - 220)) + "px";
  contextMenu.style.top = Math.max(0, Math.min(event.clientY, innerHeight - 180)) + "px";
});

// Relógio
function updateClock() {
  $("#clock").textContent = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

try {
  const savedColor = localStorage.getItem(BG_KEY);
  if (savedColor && savedColor.startsWith("#")) {
    desktop.style.background = savedColor;
  }
} catch (_) {}

renderDesktop();
updateClock();
setInterval(updateClock, 1000);
