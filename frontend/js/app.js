// Atlas — starter chat client.
// Talks to the FastAPI backend: GET /api/models and POST /api/chat (SSE stream).

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("input");
const modelEl = document.getElementById("model");
const sendBtn = formEl.querySelector("button");

// Conversation history sent to the model each turn.
const history = [];

// ---- Load the list of installed Ollama models into the dropdown ----
async function loadModels() {
  try {
    const res = await fetch("/api/models");
    const { installed } = await res.json();
    if (installed.length === 0) {
      modelEl.innerHTML = `<option value="">No models — run "ollama pull llama3.2"</option>`;
      return;
    }
    modelEl.innerHTML = installed.map((m) => `<option value="${m}">${m}</option>`).join("");
  } catch {
    modelEl.innerHTML = `<option value="">Ollama not reachable</option>`;
  }
}

function addMessage(role, text) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

// ---- Send a message and stream the reply ----
async function send(text) {
  addMessage("user", text);
  history.push({ role: "user", content: text });

  const replyEl = addMessage("assistant", "");
  let reply = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history, model: modelEl.value || null }),
  });

  // Parse the Server-Sent Events stream manually.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop(); // keep the incomplete trailing chunk

    for (const evt of events) {
      if (evt.startsWith("event: error")) {
        replyEl.classList.replace("assistant", "error");
        replyEl.textContent = "Error: " + evt.split("data: ")[1];
      } else if (evt.startsWith("event: done")) {
        // stream finished
      } else if (evt.startsWith("data: ")) {
        reply += evt.slice("data: ".length);
        replyEl.textContent = reply;
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    }
  }

  history.push({ role: "assistant", content: reply });
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  sendBtn.disabled = true;
  try {
    await send(text);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
});

// Submit on Enter, newline on Shift+Enter.
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    formEl.requestSubmit();
  }
});

loadModels();
