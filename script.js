"use strict";

// =============================================
// RetrOS Web - Sistema operacional virtual
// Apps .app com HTML/CSS/JS em iframe sandbox
// =============================================

const FILES_KEY = "retros_files_v3";
const NOTE_KEY = "retros_note_v3";
const BG_KEY = "retros_background_v3";

const desktop = document.getElementById("desktop");
const desktopIcons = document.getElementById("desktop-icons");
const windowLayer = document.getElementById("window-layer");
const taskbarWindows = document.getElementById("taskbar-windows");
const startMenu = document.getElementById("start-menu");
const contextMenu = document.getElementById("context-menu");

let zIndex = 10;
let windowCounter = 0;
const windows = new Map();

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function makeId() {
  return "f" + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
}

const appCodeTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu aplicativo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f1f5f9;
      color: #172033;
      padding: 24px;
      margin: 0;
    }
    .cartao {
      max-width: 520px;
      margin: 20px auto;
      padding: 24px;
      border-radius: 16px;
      background: white;
      box-shadow: 0 8px 25px #0002;
      text-align: center;
    }
    button {
      border: 0;
      border-radius: 9px;
      padding: 10px 16px;
      background: #2563eb;
      color: white;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="cartao">
    <h1>🚀 Meu aplicativo</h1>
    <p>Este aplicativo está executando HTML, CSS e JavaScript!</p>
    <button id="botao">Clique aqui</button>
    <p id="resultado">Esperando...</p>
  </div>

  <script>
    document.getElementById("botao").addEventListener("click", () => {
      document.getElementById("resultado").textContent = "Funcionou! 🎉";
    });
  <\/script>
</body>
</html>`;

const googleAppContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px 14px; color: #202124; background: #fff; font-family: Arial, sans-serif; text-align: center; }
    .google { max-width: 620px; margin: 0 auto; padding-top: 22px; }
    .logo { font-size: clamp(48px, 10vw, 72px); font-weight: 600; letter-spacing: -4px; margin: 25px 0 32px; }
    form { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
    input { width: 100%; max-width: 480px; padding: 14px 18px; border: 1px solid #dfe1e5; border-radius: 28px; font-size: 16px; outline: none; }
    input:hover, input:focus { box-shadow: 0 1px 6px #20212435; border-color: #dfe1e5; }
    button, .shortcut { display: inline-block; padding: 11px 16px; border: 1px solid transparent; border-radius: 5px; background: #f8f9fa; color: #202124; font-size: 14px; text-decoration: none; cursor: pointer; }
    button:hover, .shortcut:hover { border-color: #dadce0; box-shadow: 0 1px 1px #0001; }
    .buttons { margin-top: 20px; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
    .shortcuts { margin-top: 30px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .note { color: #70757a; font-size: 12px; margin-top: 30px; line-height: 1.5; }
  </style>
</head>
<body>
  <main class="google">
    <div class="logo"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></div>
    <form action="https://www.google.com/search" method="GET" target="_blank">
      <input name="q" type="search" placeholder="Pesquisar no Google..." aria-label="Pesquisar no Google" required>
      <div class="buttons"><button type="submit">Pesquisa Google</button></div>
    </form>
    <div class="shortcuts">
      <a class="shortcut" href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">▶ YouTube</a>
      <a class="shortcut" href="https://mail.google.com/" target="_blank" rel="noopener noreferrer">✉ Gmail</a>
      <a class="shortcut" href="https://maps.google.com/" target="_blank" rel="noopener noreferrer">🗺 Google Maps</a>
    </div>
    <p class="note">Google real · A pesquisa abre em uma nova aba do navegador.</p>
  </main>
</body>
</html>`;

const manualContent = `COMO USAR ARQUIVOS .APP

Um arquivo .app é um aplicativo virtual do RetrOS.

1. Abra o menu Iniciar.
2. Escolha "Criar aplicativo".
3. Escreva o nome e escolha um emoji.
4. Adicione uma descrição.
5. Edite o código HTML, CSS e JavaScript.
6. Clique em Criar aplicativo.

O aplicativo aparecerá no desktop e em Meus Arquivos.
Clique no ícone para executar. Dentro da janela, você pode editar
seu código, clicar em Executar e salvar as alterações.

Os aplicativos são executados em um iframe isolado do RetrOS.
Eles funcionam neste navegador e não são programas nativos do Windows.

TERMINAL

help             Mostra os comandos.
ls               Lista os arquivos.
date             Mostra a data e a hora.
whoami           Mostra o usuário virtual.
open NOME        Abre um arquivo.
run NOME         Executa um .exe simulado.
cat NOME         Mostra o conteúdo de um arquivo.
touch NOME.txt   Cria um arquivo de texto.
create-app       Abre o criador de aplicativos.
calc EXPRESSAO   Calcula uma expressão.
background reset Restaura o papel de parede.
clear            Limpa o terminal.
neofetch         Mostra informações do RetrOS.

EXEMPLO:
open Manual.app
run Misterio.exe

ATENÇÃO:
Os arquivos .exe deste sistema são simulações, não executáveis
reais do Windows. Código .app é executado no navegador, em uma área
isolada, mas não deve ser usado para abrir código desconhecido.`;

function createDefaultFiles() {
  return [
    {
      id: makeId(),
      name: "Bem-vindo.txt",
      type: "txt",
      content:
        "Bem-vindo ao RetrOS!\n\n" +
        "Explore o desktop, abra o terminal e crie seus próprios aplicativos."
    },
    {
      id: makeId(),
      name: "Manual.app",
      type: "app",
      icon: "📘",
      description: "Manual de utilização do RetrOS.",
      content: manualContent
    },
    {
      id: makeId(),
      name: "Misterio.exe",
      type: "exe",
      content: "ARQUIVO EXECUTÁVEL VIRTUAL"
    }
  ];
}

function loadFiles() {
  try {
    const saved = localStorage.getItem(FILES_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(file =>
          file &&
          typeof file.id === "string" &&
          typeof file.name === "string" &&
          ["txt", "app", "exe"].includes(file.type)
        );
      }
    }
  } catch (error) {
    console.warn("Não foi possível carregar os arquivos.", error);
  }

  return createDefaultFiles();
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

function ensureSystemFiles() {
  if (!files.some(file => file.type === "exe" &&
      file.name.toLowerCase() === "misterio.exe")) {
    files.push({
      id: makeId(),
      name: "Misterio.exe",
      type: "exe",
      content: "ARQUIVO EXECUTÁVEL VIRTUAL"
    });
  }

  if (!files.some(file => file.name.toLowerCase() === "manual.app")) {
    files.push({
      id: makeId(),
      name: "Manual.app",
      type: "app",
      icon: "📘",
      description: "Manual de utilização do RetrOS.",
      content: manualContent
    });
  }

  if (!files.some(file => file.name.toLowerCase() === "google.app")) {
    files.push({
      id: makeId(),
      name: "Google.app",
      type: "app",
      icon: "🌐",
      description: "Acesse a pesquisa real do Google.",
      content: googleAppContent,
      system: true
    });
  }

  saveFiles();
}

ensureSystemFiles();

// =============================================
// PAPEL DE PAREDE
// Aceita Fundo.jpg ou Fundo.jpge no repositório.
// =============================================

function setDefaultBackground(save = false) {
  if (save) {
    try {
      localStorage.setItem(BG_KEY, JSON.stringify({ type: "default" }));
    } catch (_) {}
  }

  const candidates = ["Fundo.jpg", "Fundo.jpge"];
  let index = 0;

  function tryNext() {
    if (index >= candidates.length) {
      desktop.style.backgroundImage = "none";
      desktop.style.backgroundColor = "#286c76";
      return;
    }

    const path = candidates[index++];
    const image = new Image();

    image.onload = () => {
      desktop.style.backgroundImage = `url("${path}")`;
      desktop.style.backgroundPosition = "center";
      desktop.style.backgroundSize = "cover";
      desktop.style.backgroundRepeat = "no-repeat";
    };

    image.onerror = tryNext;
    image.src = path;
  }

  tryNext();
}

function setBackgroundColor(color, save = true) {
  desktop.style.backgroundImage = "none";
  desktop.style.backgroundColor = color;

  if (save) {
    try {
      localStorage.setItem(BG_KEY, JSON.stringify({ type: "color", value: color }));
    } catch (_) {}
  }
}

function setBackgroundImage(dataURL) {
  try {
    localStorage.setItem(BG_KEY, JSON.stringify({ type: "image", value: dataURL }));
    desktop.style.backgroundImage = `url("${dataURL}")`;
    desktop.style.backgroundPosition = "center";
    desktop.style.backgroundSize = "cover";
    desktop.style.backgroundRepeat = "no-repeat";
  } catch (error) {
    alert("Não foi possível salvar essa imagem. Tente uma imagem menor.");
  }
}

function applySavedBackground() {
  try {
    const saved = JSON.parse(localStorage.getItem(BG_KEY));

    if (saved?.type === "image" && saved.value) {
      desktop.style.backgroundImage = `url("${saved.value}")`;
      desktop.style.backgroundPosition = "center";
      desktop.style.backgroundSize = "cover";
      return;
    }

    if (saved?.type === "color" && saved.value) {
      setBackgroundColor(saved.value, false);
      return;
    }
  } catch (_) {}

  setDefaultBackground();
}

applySavedBackground();

// =============================================
// ÍCONES DO DESKTOP
// =============================================

const desktopApps = [
  { key: "computer", icon: "🖥️", name: "Meu Computador" },
  { key: "files", icon: "📁", name: "Meus Arquivos" },
  { key: "notes", icon: "📝", name: "Bloco de Notas" },
  { key: "calculator", icon: "🧮", name: "Calculadora" },
  { key: "settings", icon: "🎨", name: "Personalização" },
  { key: "terminal", icon: "💻", name: "Terminal" },
  { key: "appbuilder", icon: "🧩", name: "Criar aplicativo" },
  { key: "help", icon: "📘", name: "Manual do RetrOS" },
  { key: "mystery", icon: "👾", name: "Misterio.exe" }
];

function renderDesktopIcons() {
  const customApps = files
    .filter(file => file.type === "app")
    .map(file => ({ fileId: file.id, icon: file.icon || "🧩", name: file.name }));

  desktopIcons.innerHTML = [
    ...desktopApps.map(app => `
      <button class="desktop-icon" data-action="open-desktop"
        data-key="${escapeHTML(app.key)}" title="${escapeHTML(app.name)}">
        <span class="emoji">${escapeHTML(app.icon)}</span>
        <span class="icon-label">${escapeHTML(app.name)}</span>
      </button>
    `),
    ...customApps.map(app => `
      <button class="desktop-icon" data-action="open-desktop"
        data-file-id="${escapeHTML(app.fileId)}" title="${escapeHTML(app.name)}">
        <span class="emoji">${escapeHTML(app.icon)}</span>
        <span class="icon-label">${escapeHTML(app.name)}</span>
      </button>
    `)
  ].join("");
}

renderDesktopIcons();

// =============================================
// JANELAS
// =============================================

function createWindow(title, icon, content, appKey, width = 620) {
  const id = "window-" + (++windowCounter);
  const win = document.createElement("section");
  win.className = "window";
  win.dataset.windowId = id;
  win.style.width = `min(${width}px, calc(100vw - 24px))`;
  win.style.zIndex = ++zIndex;

  win.innerHTML = `
    <div class="titlebar">
      <div class="titlebar-name"><span>${escapeHTML(icon)}</span><span>${escapeHTML(title)}</span></div>
      <div class="window-controls">
        <button data-action="minimize-window" data-window-id="${id}" title="Minimizar">—</button>
        <button data-action="maximize-window" data-window-id="${id}" title="Maximizar">□</button>
        <button class="close-window" data-action="close-window" data-window-id="${id}" title="Fechar">×</button>
      </div>
    </div>
    <div class="window-body">${content}</div>
  `;

  windowLayer.appendChild(win);

  const taskButton = document.createElement("button");
  taskButton.className = "taskbar-window active";
  taskButton.dataset.action = "toggle-window";
  taskButton.dataset.windowId = id;
  taskButton.textContent = `${icon} ${title}`;
  taskbarWindows.appendChild(taskButton);

  windows.set(id, { element: win, taskButton, appKey });
  focusWindow(id);
  return id;
}

function focusWindow(id) {
  const entry = windows.get(id);
  if (!entry) return;
  entry.element.style.zIndex = ++zIndex;
  for (const [otherId, other] of windows) {
    other.taskButton.classList.toggle("active", otherId === id);
  }
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
  entry.element.style.display = "none";
  entry.taskButton.classList.remove("active");
}

function toggleWindow(id) {
  const entry = windows.get(id);
  if (!entry) return;
  if (entry.element.style.display === "none") {
    entry.element.style.display = "flex";
    focusWindow(id);
  } else {
    minimizeWindow(id);
  }
}

function refreshOpenFileWindows() {
  for (const [, entry] of windows) {
    if (entry.appKey === "files") {
      const body = entry.element.querySelector(".window-body");
      body.innerHTML = renderFilesHTML();
    }
  }
}

function openApp(key, options = {}) {
  startMenu.classList.add("hidden");
  contextMenu.classList.add("hidden");

  switch (key) {
    case "computer":
      createWindow("Meu Computador", "🖥️", `
        <h2 class="panel-heading">Bem-vindo ao RetrOS</h2>
        <p>Um sistema operacional virtual feito para funcionar no navegador.</p>
        <div class="desktop-info">
          <p><strong>💾 Armazenamento:</strong> disco virtual do navegador</p>
          <p><strong>🌐 Plataforma:</strong> RetrOS Web</p>
          <p><strong>📦 Aplicativos:</strong> arquivos .app com HTML, CSS e JavaScript</p>
          <p><strong>⚙️ Executáveis:</strong> simulação de arquivos .exe</p>
        </div>
        <div class="button-row">
          <button class="retro-button" data-action="open-app" data-key="files">📁 Abrir arquivos</button>
          <button class="retro-button" data-action="open-app" data-key="terminal">💻 Terminal</button>
        </div>
      `, key);
      break;

    case "files":
      createWindow("Meus Arquivos", "📁", renderFilesHTML(), key, 700);
      break;

    case "googleapp": {
      const googleApp = files.find(file => file.name.toLowerCase() === "google.app");
      if (googleApp) openFile(googleApp.id);
      else alert("Google.app não encontrado.");
      break;
    }

    case "browser":
      createWindow("Google / Internet", "🌐", `
        <div class="retros-browser" style="display:flex;flex-direction:column;gap:12px;min-height:420px;">
          <div style="text-align:center;padding:16px 8px 4px;">
            <div style="font-size:44px;font-weight:700;letter-spacing:-2px;line-height:1.2;">
              <span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span>
            </div>
            <p class="muted">Pesquisa real do Google, dentro do RetrOS</p>
          </div>
          <form class="browser-search-form" style="display:flex;gap:8px;flex-wrap:wrap;">
            <input name="query" type="search" placeholder="Pesquisar no Google..." aria-label="Pesquisar no Google" required style="flex:1;min-width:180px;padding:11px 13px;border:1px solid #aaa;border-radius:22px;font:inherit;">
            <button class="retro-button" type="submit">🔎 Pesquisar</button>
          </form>
          <div class="button-row" style="justify-content:center;flex-wrap:wrap;">
            <button class="retro-button" type="button" data-action="browser-quick" data-url="https://mail.google.com/">✉️ Gmail</button>
            <button class="retro-button" type="button" data-action="browser-quick" data-url="https://www.youtube.com/">▶️ YouTube</button>
            <button class="retro-button" type="button" data-action="browser-quick" data-url="https://maps.google.com/">🗺️ Google Maps</button>
          </div>
          <hr>
          <h3 style="margin:0;">Abrir um endereço</h3>
          <form class="browser-url-form" style="display:flex;gap:8px;flex-wrap:wrap;">
            <input name="url" type="text" placeholder="https://exemplo.com" aria-label="Endereço do site" required style="flex:1;min-width:180px;padding:10px;border:1px solid #aaa;border-radius:6px;font:inherit;">
            <button class="retro-button" type="submit">🌐 Abrir em nova aba</button>
          </form>
          <p class="muted" style="margin:0;">O Google e os sites abrem de verdade em uma nova aba do navegador. Alguns sites bloqueiam a exibição dentro de outra página, por isso a abertura externa é a opção mais compatível.</p>
          <div style="border:1px solid #aaa;border-radius:8px;padding:12px;background:var(--panel-bg, #f5f5f5);">
            <strong>Como funciona?</strong>
            <p style="margin:6px 0 0;">As pesquisas são enviadas diretamente para <code>google.com/search</code>. O RetrOS não simula os resultados nem precisa de uma API de pesquisa.</p>
          </div>
        </div>
      `, key, 760);
      break;

    case "notes":
      openNotes();
      break;

    case "calculator":
      createWindow("Calculadora", "🧮", `
        <div class="calc">
          <input class="calc-display" data-calc-display type="text" value="0" readonly aria-label="Resultado">
          <div class="calc-grid">
            ${["7","8","9","/","4","5","6","*","1","2","3","-","0",".","(",")","+","%","C","="].map(value => `
              <button data-action="calc-input" data-value="${escapeHTML(value)}">${escapeHTML(value)}</button>
            `).join("")}
          </div>
        </div>
      `, key, 350);
      break;

    case "settings":
      createWindow("Personalização", "🎨", `
        <h2 class="panel-heading">Personalizar background</h2>
        <p>Escolha uma imagem ou uma cor para o desktop.</p>
        <label class="form-field">Imagem do computador<input class="bg-file" type="file" accept="image/*"></label>
        <div class="button-row"><button class="retro-button" data-action="reset-background">🖼️ Restaurar Fundo.jpg</button></div>
        <hr>
        <label class="form-field">Cor do fundo<input class="bg-color" type="color" value="#286c76"></label>
        <div class="button-row"><button class="retro-button" data-action="apply-background-color">Aplicar cor</button></div>
        <p class="muted">As preferências ficam salvas neste navegador. Para restaurar a imagem do repositório, use o botão acima.</p>
      `, key);
      break;

    case "terminal":
      createWindow("RetrOS Terminal", "💻", `
        <div class="terminal">
          <div class="terminal-output" data-terminal-output>
            <div class="terminal-line">RetrOS Terminal [Versão 4.0]</div>
            <div class="terminal-line">Digite help para ver os comandos.</div>
            <div class="terminal-line">&nbsp;</div>
          </div>
          <form class="terminal-form">
            <label>retrOS&gt;</label>
            <input type="text" name="command" autocomplete="off" spellcheck="false" aria-label="Comando do terminal">
          </form>
        </div>
      `, key, 700);
      break;

    case "appbuilder":
      createWindow("Criar aplicativo .app", "🧩", `
        <h2 class="panel-heading">Novo aplicativo executável</h2>
        <form class="app-builder-form">
          <label class="form-field">Nome do aplicativo
            <input type="text" name="appName" placeholder="Ex.: Meu aplicativo.app" required maxlength="45">
          </label>
          <label class="form-field">Emoji do ícone
            <input type="text" name="appIcon" value="🚀" maxlength="12" required>
          </label>
          <label class="form-field">Descrição
            <input type="text" name="appDescription" placeholder="O que este app faz?" maxlength="180">
          </label>
          <label class="form-field">Código HTML, CSS e JavaScript
            <textarea name="appContent" class="app-code-editor" rows="13" spellcheck="false" required>${escapeHTML(appCodeTemplate)}</textarea>
          </label>
          <div class="button-row">
            <button class="retro-button" type="button" data-action="reset-app-template">↩️ Restaurar exemplo</button>
            <button class="retro-button" type="submit">🧩 Criar aplicativo</button>
          </div>
        </form>
        <p class="muted">O código será executado em uma janela isolada do RetrOS. Não execute código de fontes desconhecidas.</p>
      `, key, 760);
      break;

    case "help": {
      const manual = files.find(file => file.name.toLowerCase() === "manual.app");
      if (manual) openFile(manual.id);
      else alert("Manual não encontrado.");
      break;
    }

    case "mystery":
      runMystery();
      break;

    case "userapp":
      openUserApp(options.fileId);
      break;

    default:
      alert("Esse aplicativo não existe.");
  }
}

// =============================================
// MEUS ARQUIVOS
// =============================================

function fileIcon(file) {
  if (file.type === "app") return file.icon || "🧩";
  if (file.type === "exe") return "👾";
  return "📝";
}

function renderFilesHTML() {
  return `
    <h2 class="panel-heading">📁 Meus Arquivos</h2>
    <div class="button-row">
      <button class="retro-button" data-action="new-text">📄 Novo texto</button>
      <button class="retro-button" data-action="open-app" data-key="appbuilder">🧩 Novo aplicativo</button>
    </div>
    <div class="file-list">
      ${files.length ? files.map(file => `
        <div class="file-row">
          <div class="file-main">
            <span class="file-emoji">${escapeHTML(fileIcon(file))}</span>
            <div class="file-details"><strong>${escapeHTML(file.name)}</strong><small>${escapeHTML(file.type.toUpperCase())}</small></div>
          </div>
          <div class="file-actions">
            <button class="file-button" data-action="open-file" data-file-id="${escapeHTML(file.id)}">Abrir</button>
            ${file.system ? "" : `<button class="file-button" data-action="rename-file" data-file-id="${escapeHTML(file.id)}">Renomear</button>`}
            ${file.system ? "" : `<button class="file-button" data-action="delete-file" data-file-id="${escapeHTML(file.id)}">Excluir</button>`}
          </div>
        </div>
      `).join("") : `<div class="empty-state">Nenhum arquivo encontrado.</div>`}
    </div>
    <p class="muted">Os arquivos são virtuais e ficam salvos no armazenamento deste navegador.</p>
  `;
}

function openFile(id) {
  const file = files.find(item => item.id === id);
  if (!file) {
    alert("Arquivo não encontrado.");
    return;
  }

  if (file.type === "txt") {
    openNotes(file.id);
  } else if (file.type === "app") {
    openUserApp(file.id);
  } else if (file.type === "exe") {
    if (file.name.toLowerCase() === "misterio.exe") runMystery();
    else alert("Este executável virtual ainda não possui uma simulação.");
  }
}

function openNotes(fileId = null) {
  const file = fileId ? files.find(item => item.id === fileId) : null;
  const content = file ? file.content || "" : localStorage.getItem(NOTE_KEY) || "";
  const title = file ? file.name : "Bloco de Notas";

  createWindow(title, "📝", `
    <div class="note-editor" data-file-id="${escapeHTML(fileId || "")}">
      <textarea class="note-textarea" aria-label="Texto do documento">${escapeHTML(content)}</textarea>
      <div class="button-row">
        <button class="retro-button" data-action="save-note">💾 Salvar</button>
        <button class="retro-button" data-action="save-note-as">📄 Salvar como arquivo</button>
      </div>
      <p class="muted">${file ? "Editando arquivo virtual." : "Nota independente salva neste navegador."}</p>
    </div>
  `, "notes", 600);
}

function newTextFile() {
  const name = prompt("Nome do arquivo:", "Novo arquivo.txt");
  if (!name || !name.trim()) return;
  let finalName = name.trim();
  if (!finalName.toLowerCase().endsWith(".txt")) finalName += ".txt";
  files.push({ id: makeId(), name: finalName, type: "txt", content: "" });
  saveFiles();
  refreshOpenFileWindows();
  renderDesktopIcons();
}

function renameFile(id) {
  const file = files.find(item => item.id === id);
  if (!file) return;
  const name = prompt("Novo nome:", file.name);
  if (!name || !name.trim()) return;
  file.name = name.trim();
  saveFiles();
  refreshOpenFileWindows();
  renderDesktopIcons();
}

function deleteFile(id) {
  const file = files.find(item => item.id === id);
  if (!file) return;
  if (!confirm(`Excluir "${file.name}"?`)) return;
  files = files.filter(item => item.id !== id);
  saveFiles();
  refreshOpenFileWindows();
  renderDesktopIcons();
}

function saveNote(button) {
  const win = button.closest(".window");
  const editor = win?.querySelector(".note-editor");
  if (!editor) return;
  const content = editor.querySelector(".note-textarea").value;
  const fileId = editor.dataset.fileId;

  if (fileId) {
    const file = files.find(item => item.id === fileId);
    if (!file) return alert("O arquivo não existe mais.");
    file.content = content;
    saveFiles();
    refreshOpenFileWindows();
    alert("Arquivo salvo!");
  } else {
    try {
      localStorage.setItem(NOTE_KEY, content);
      alert("Nota salva!");
    } catch (_) {
      alert("Não foi possível salvar a nota.");
    }
  }
}

function saveNoteAs(button) {
  const win = button.closest(".window");
  const editor = win?.querySelector(".note-editor");
  if (!editor) return;
  const name = prompt("Nome do arquivo:", "Minha nota.txt");
  if (!name || !name.trim()) return;
  let finalName = name.trim();
  if (!finalName.toLowerCase().endsWith(".txt")) finalName += ".txt";
  files.push({ id: makeId(), name: finalName, type: "txt", content: editor.querySelector(".note-textarea").value });
  saveFiles();
  refreshOpenFileWindows();
  renderDesktopIcons();
  alert("Arquivo criado!");
}

// =============================================
// APLICATIVOS .APP EXECUTÁVEIS
// =============================================

function prepareAppDocument(content) {
  const source = String(content || "");
  // Compatibilidade com antigos .app que guardavam apenas texto.
  if (!/<\s*[a-z!/?][^>]*>/i.test(source)) {
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;padding:20px;white-space:pre-wrap;overflow-wrap:anywhere;color:#202938}</style></head><body>${escapeHTML(source || "Aplicativo vazio. Clique em Editar código para começar.")}</body></html>`;
  }
  return source;
}

function runAppPreview(editor) {
  if (!editor) return;
  const code = editor.querySelector(".app-content")?.value ?? "";
  const frame = editor.querySelector(".app-preview");
  if (!frame) return;

  // O sandbox permite scripts dentro do app, mas não concede acesso à origem do RetrOS.
  frame.srcdoc = prepareAppDocument(code);
}

function openUserApp(fileId) {
  const file = files.find(item => item.id === fileId);
  if (!file || file.type !== "app") {
    alert("Aplicativo não encontrado.");
    return;
  }

  const code = file.content || appCodeTemplate;
  const id = createWindow(file.name, file.icon || "🧩", `
    <div class="app-editor" data-file-id="${escapeHTML(file.id)}" style="display:flex;flex-direction:column;gap:10px;min-height:360px;">
      <div class="app-toolbar" style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <strong>${escapeHTML(file.icon || "🧩")} ${escapeHTML(file.name)}</strong>
        <div class="button-row">
          <button class="retro-button" data-action="run-app-code">▶️ Executar</button>
          <button class="retro-button" data-action="save-app-content">💾 Salvar código</button>
        </div>
      </div>
      <iframe class="app-preview" title="Aplicativo ${escapeHTML(file.name)}" sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer" style="width:100%;height:300px;flex:0 0 300px;border:1px solid #aab4c0;border-radius:8px;background:white;"></iframe>
      <label class="form-field">Código HTML, CSS e JavaScript
        <textarea class="app-content app-code-editor" spellcheck="false" rows="12" style="font-family:Consolas,monospace;white-space:pre;tab-size:2;">${escapeHTML(code)}</textarea>
      </label>
      <p class="muted">Edite o código e clique em Executar para testar. Clique em Salvar código para guardar as alterações.</p>
    </div>
  `, "userapp", 780);

  const entry = windows.get(id);
  const editor = entry?.element.querySelector(".app-editor");
  runAppPreview(editor);
}

function saveAppContent(button) {
  const editor = button.closest(".app-editor");
  if (!editor) return;
  const file = files.find(item => item.id === editor.dataset.fileId);
  if (!file) return alert("Aplicativo não encontrado.");

  file.content = editor.querySelector(".app-content").value;
  if (!saveFiles()) return;
  alert("Código do aplicativo salvo!");
}

function createUserApp(form) {
  const nameInput = form.elements.appName;
  const iconInput = form.elements.appIcon;
  const descriptionInput = form.elements.appDescription;
  const contentInput = form.elements.appContent;

  let name = nameInput.value.trim();
  const icon = iconInput.value.trim() || "🧩";
  if (!name) return alert("Digite o nome do aplicativo.");
  if (!name.toLowerCase().endsWith(".app")) name += ".app";

  if (files.some(file => file.name.toLowerCase() === name.toLowerCase())) {
    alert("Já existe um arquivo com esse nome.");
    return;
  }

  const app = {
    id: makeId(),
    name,
    type: "app",
    icon,
    description: descriptionInput.value.trim(),
    content: contentInput.value.trim() || appCodeTemplate
  };

  files.push(app);
  if (!saveFiles()) {
    files = files.filter(file => file.id !== app.id);
    return;
  }

  renderDesktopIcons();
  refreshOpenFileWindows();
  const win = form.closest(".window");
  if (win) closeWindow(win.dataset.windowId);
  openUserApp(app.id);
}

// =============================================
// CALCULADORA
// =============================================

function calculateExpression(expression) {
  const cleaned = expression.trim();
  if (!cleaned) return "0";
  if (!/^[0-9+\-*/().%\s]+$/.test(cleaned)) throw new Error("Expressão inválida.");
  const result = Function('"use strict"; return (' + cleaned + ')')();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Resultado inválido.");
  return String(Number(result.toPrecision(12)));
}

function handleCalculator(action, value, button) {
  const display = button.closest(".window")?.querySelector("[data-calc-display]");
  if (!display) return;
  if (action === "calc-clear" || value === "C") {
    display.value = "0";
    return;
  }
  if (value === "=") {
    try { display.value = calculateExpression(display.value); }
    catch (_) { display.value = "Erro"; }
    return;
  }
  if (display.value === "0" || display.value === "Erro") {
    display.value = /^[0-9.(]$/.test(value) ? value : display.value + value;
  } else {
    display.value += value;
  }
}

// =============================================
// TERMINAL
// =============================================

function terminalWrite(output, text = "") {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function terminalHelp() {
  return [
    "Comandos disponíveis:",
    "help                 Ajuda",
    "ls                   Lista arquivos",
    "date                 Data e hora",
    "whoami               Usuário virtual",
    "open NOME            Abre arquivo ou aplicativo",
    "run NOME             Executa um .exe simulado",
    "cat NOME             Lê arquivo de texto",
    "touch NOME.txt       Cria arquivo",
    "create-app           Cria um aplicativo .app",
    "calc EXPRESSAO       Faz um cálculo",
    "background reset     Restaura Fundo.jpg",
    "apps                 Lista aplicativos",
    "neofetch             Informações do RetrOS",
    "clear                Limpa a tela"
  ].join("\n");
}

function findFileByName(name) {
  const normalized = name.toLowerCase().trim();
  return files.find(file => file.name.toLowerCase() === normalized) ||
    files.find(file => file.name.toLowerCase().replace(/\.(txt|app|exe)$/i, "") === normalized);
}

function runTerminalCommand(raw, output) {
  const commandLine = raw.trim();
  if (!commandLine) return;
  terminalWrite(output, "retrOS> " + commandLine);

  const parts = commandLine.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  const rest = args.join(" ");

  switch (command) {
    case "help": terminalWrite(output, terminalHelp()); break;
    case "clear": output.innerHTML = ""; break;
    case "ls":
    case "dir":
      terminalWrite(output, files.map(file => `${fileIcon(file)} ${file.name}`).join("\n") || "Nenhum arquivo.");
      break;
    case "date": terminalWrite(output, new Date().toLocaleString("pt-BR")); break;
    case "whoami": terminalWrite(output, "usuario@retros"); break;
    case "echo": terminalWrite(output, rest); break;
    case "open": {
      if (!rest) { terminalWrite(output, "Uso: open NOME"); break; }
      const file = findFileByName(rest);
      if (!file) terminalWrite(output, "Arquivo não encontrado: " + rest);
      else { openFile(file.id); terminalWrite(output, "Abrindo " + file.name + "..."); }
      break;
    }
    case "run": {
      if (!rest) { terminalWrite(output, "Uso: run Misterio.exe"); break; }
      const file = findFileByName(rest);
      if (!file || file.type !== "exe") terminalWrite(output, "Executável não encontrado.");
      else { terminalWrite(output, "Executando " + file.name + "..."); openFile(file.id); }
      break;
    }
    case "misterio.exe": runMystery(); terminalWrite(output, "Executando Misterio.exe..."); break;
    case "cat": {
      const file = findFileByName(rest);
      if (!file) terminalWrite(output, "Arquivo não encontrado.");
      else if (file.type === "txt") terminalWrite(output, file.content || "(arquivo vazio)");
      else terminalWrite(output, "Este arquivo não é um documento de texto.");
      break;
    }
    case "touch": {
      if (!rest) { terminalWrite(output, "Uso: touch Novo.txt"); break; }
      let name = rest;
      if (!name.toLowerCase().endsWith(".txt")) name += ".txt";
      if (findFileByName(name)) { terminalWrite(output, "Já existe um arquivo com esse nome."); break; }
      files.push({ id: makeId(), name, type: "txt", content: "" });
      saveFiles(); renderDesktopIcons(); refreshOpenFileWindows();
      terminalWrite(output, "Criado: " + name);
      break;
    }
    case "create-app": openApp("appbuilder"); terminalWrite(output, "Abrindo o criador de aplicativos..."); break;
    case "calc":
      try { terminalWrite(output, calculateExpression(rest)); }
      catch (error) { terminalWrite(output, "Erro: " + error.message); }
      break;
    case "background":
      if (args[0]?.toLowerCase() === "reset") {
        setDefaultBackground(true);
        terminalWrite(output, "Papel de parede padrão restaurado.");
      } else terminalWrite(output, "Use: background reset");
      break;
    case "apps": {
      const appNames = files.filter(file => file.type === "app").map(file => `${file.icon || "🧩"} ${file.name}`);
      terminalWrite(output, appNames.join("\n") || "Nenhum aplicativo instalado.");
      break;
    }
    case "neofetch":
      terminalWrite(output, [
        "       .----.       RetrOS Web",
        "      / .--. \\      Sistema virtual",
        "      | |  | |      Plataforma: navegador",
        "      | '--' |      Apps: .app HTML/CSS/JS",
        "       '----'       Executáveis: simulados",
        "",
        "      Bem-vindo ao RetrOS!"
      ].join("\n"));
      break;
    case "about": terminalWrite(output, "RetrOS Web 4.0 — sistema virtual com apps HTML/CSS/JS."); break;
    default: terminalWrite(output, `Comando desconhecido: ${command}. Digite help.`);
  }
}

// =============================================
// EXECUTÁVEL MISTERIOSO
// É uma simulação segura, não um .exe real.
// =============================================

function runMystery() {
  const id = createWindow("Misterio.exe", "👁️", `
    <div class="mystery-box">
      <h2>⚠ PROCESSO DESCONHECIDO</h2>
      <div class="mystery-status">Inicializando... Verificando sistema... Aguardando resposta...</div>
    </div>
  `, "mystery", 480);

  desktop.classList.add("glitching");
  const entry = windows.get(id);

  setTimeout(() => {
    if (entry && entry.element.isConnected) {
      const status = entry.element.querySelector(".mystery-status");
      if (status) status.textContent =
        "ACESSO CONCEDIDO.\nVOCÊ ENCONTROU O ARQUIVO.\n\n...\n\nCalma! 😈 Era só um easter egg do RetrOS.\nNenhum arquivo real foi executado ou alterado.";
    }
    desktop.classList.remove("glitching");
  }, 1600);
}

// =============================================
// EVENTOS GERAIS
// =============================================

document.getElementById("start-button").addEventListener("click", event => {
  event.stopPropagation();
  startMenu.classList.toggle("hidden");
  contextMenu.classList.add("hidden");
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    if (!event.target.closest("#start-menu")) startMenu.classList.add("hidden");
    if (!event.target.closest("#context-menu")) contextMenu.classList.add("hidden");
    return;
  }

  const action = button.dataset.action;
  const key = button.dataset.key;
  const id = button.dataset.windowId;
  const fileId = button.dataset.fileId;
  const value = button.dataset.value;

  switch (action) {
    case "open-app": openApp(key); break;
    case "browser-quick": {
      const address = button.dataset.url;
      if (address) window.open(address, "_blank", "noopener,noreferrer");
      break;
    }
    case "open-desktop": if (fileId) openFile(fileId); else openApp(key); break;
    case "open-file": openFile(fileId); break;
    case "new-text": newTextFile(); break;
    case "rename-file": renameFile(fileId); break;
    case "delete-file": deleteFile(fileId); break;
    case "save-note": saveNote(button); break;
    case "save-note-as": saveNoteAs(button); break;
    case "save-app-content": saveAppContent(button); break;
    case "run-app-code": runAppPreview(button.closest(".app-editor")); break;
    case "reset-app-template": {
      const area = button.closest(".window")?.querySelector('textarea[name="appContent"]');
      if (area) area.value = appCodeTemplate;
      break;
    }
    case "close-window": closeWindow(id); break;
    case "minimize-window": minimizeWindow(id); break;
    case "maximize-window": {
      const entry = windows.get(id);
      if (entry) { entry.element.classList.toggle("maximized"); focusWindow(id); }
      break;
    }
    case "toggle-window": toggleWindow(id); break;
    case "calc-input": handleCalculator(action, value, button); break;
    case "reset-background": setDefaultBackground(true); break;
    case "apply-background-color": {
      const color = button.closest(".window")?.querySelector(".bg-color")?.value;
      if (color) setBackgroundColor(color);
      break;
    }
    case "refresh-desktop": renderDesktopIcons(); refreshOpenFileWindows(); contextMenu.classList.add("hidden"); break;
  }
});

// Importar uma imagem para o papel de parede.
document.addEventListener("change", event => {
  if (!event.target.matches(".bg-file")) return;
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) return alert("Escolha um arquivo de imagem.");
  const reader = new FileReader();
  reader.onload = () => { if (typeof reader.result === "string") setBackgroundImage(reader.result); };
  reader.onerror = () => alert("Não foi possível ler essa imagem.");
  reader.readAsDataURL(file);
});

// Criar aplicativos e executar comandos do terminal.
document.addEventListener("submit", event => {
  const form = event.target;
  if (form.matches(".app-builder-form")) {
    event.preventDefault();
    createUserApp(form);
    return;
  }
  if (form.matches(".terminal-form")) {
    event.preventDefault();
    const input = form.elements.command;
    const command = input.value;
    input.value = "";
    const output = form.closest(".terminal")?.querySelector("[data-terminal-output]");
    if (output) runTerminalCommand(command, output);
    input.focus();
    return;
  }
  if (form.matches(".browser-search-form")) {
    event.preventDefault();
    const query = form.elements.query.value.trim();
    if (!query) return;
    window.open("https://www.google.com/search?q=" + encodeURIComponent(query), "_blank", "noopener,noreferrer");
    return;
  }
  if (form.matches(".browser-url-form")) {
    event.preventDefault();
    let address = form.elements.url.value.trim();
    if (!address) return;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(address)) address = "https://" + address;
    try {
      const parsed = new URL(address);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        alert("Por segurança, use um endereço que comece com http:// ou https://");
        return;
      }
      window.open(parsed.href, "_blank", "noopener,noreferrer");
    } catch {
      alert("Esse endereço não parece válido.");
    }
  }
});

// Arrastar janelas pela barra de título.
let dragState = null;

windowLayer.addEventListener("pointerdown", event => {
  const titlebar = event.target.closest(".titlebar");
  const win = event.target.closest(".window");
  if (!win) return;
  focusWindow(win.dataset.windowId);
  if (!titlebar || event.target.closest("button")) return;
  if (win.classList.contains("maximized")) return;

  const rect = win.getBoundingClientRect();
  dragState = {
    win,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    left: rect.left,
    top: rect.top
  };
  titlebar.setPointerCapture(event.pointerId);
});

window.addEventListener("pointermove", event => {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const { win, startX, startY, left, top } = dragState;
  const maxLeft = Math.max(0, window.innerWidth - win.offsetWidth);
  const maxTop = Math.max(0, window.innerHeight - 65);
  win.style.left = Math.max(0, Math.min(maxLeft, left + event.clientX - startX)) + "px";
  win.style.top = Math.max(0, Math.min(maxTop, top + event.clientY - startY)) + "px";
  win.style.transform = "none";
});

window.addEventListener("pointerup", () => { dragState = null; });
window.addEventListener("pointercancel", () => { dragState = null; });

// Menu de contexto do desktop.
desktop.addEventListener("contextmenu", event => {
  if (event.target.closest(".window") || event.target.closest(".taskbar")) return;
  event.preventDefault();
  contextMenu.classList.remove("hidden");
  startMenu.classList.add("hidden");
  const rect = desktop.getBoundingClientRect();
  const x = Math.min(event.clientX - rect.left, rect.width - 230);
  const y = Math.min(event.clientY - rect.top, rect.height - 200);
  contextMenu.style.left = Math.max(0, x) + "px";
  contextMenu.style.top = Math.max(0, y) + "px";
});

// Relógio da barra de tarefas.
function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit"
  });
}

updateClock();
setInterval(updateClock, 1000);
