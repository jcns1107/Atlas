// conversations.js — the sidebar: your saved chats, grouped by when you last
// used them, with rename and delete.
//
// The list comes from GET /api/conversations (summaries, newest first). Each
// chat is a link to "#/c/<id>", so the browser's back and forward buttons move
// between chats and a reload reopens the one you were in (see app.js).

import { deleteConversation, listConversations, updateConversation } from "./api.js";
import { escapeHtml } from "./markdown.js";

const $ = (id) => document.getElementById(id);

const ICON_RENAME =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.75 4.25 15.75 7.25 7.5 15.5H4.5v-3z" /></svg>';
const ICON_DELETE =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6h11M8 6V4.5h4V6M6 6l.75 9.5h6.5L14 6" /></svg>';

/** "Today", "Yesterday", "Previous 7 days", … from an ISO timestamp. */
function groupOf(iso, now = new Date()) {
  const d = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((startOfToday - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 days";
  if (days < 30) return "Previous 30 days";
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(d);
}

export const hrefFor = (id) => `#/c/${id}`;

/**
 * onRenamed(conversation): a chat's title changed (the header shows it too).
 * onDeleted(id):           a chat was deleted (if it was open, start a new one).
 */
export function createSidebar({ onRenamed, onDeleted }) {
  const nav = $("convos");
  let items = []; // [{ id, title, model, updated_at }], newest first
  let activeId = null;
  let status = "loading"; // loading | ready | error | unavailable
  let errorText = "";

  function render() {
    if (status === "loading" && !items.length) {
      // The final layout with flat bars where the titles will land.
      nav.innerHTML = `<div class="convos__skeleton" aria-label="Loading chats">${'<span></span>'.repeat(6)}</div>`;
      return;
    }
    if (status === "unavailable" || status === "error") {
      nav.innerHTML = `
        <div class="convos__state">
          <p>${escapeHtml(errorText)}</p>
          <button class="btn btn--quiet btn--small" type="button" data-act="retry">Try again</button>
        </div>`;
      return;
    }
    if (!items.length) {
      nav.innerHTML = `<p class="convos__state convos__state--empty">No chats yet. Your first message starts one.</p>`;
      return;
    }

    const groups = new Map();
    for (const item of items) {
      const g = groupOf(item.updated_at);
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(item);
    }
    let html = "";
    for (const [label, list] of groups) {
      html += `<section class="convos__group"><h2 class="convos__label">${escapeHtml(label)}</h2><ul>`;
      for (const item of list) {
        const title = escapeHtml(item.title);
        const current = item.id === activeId ? ' aria-current="page"' : "";
        html += `
          <li class="convo" data-id="${item.id}">
            <a class="convo__link" href="${hrefFor(item.id)}"${current} title="${title}">${title}</a>
            <span class="convo__actions">
              <button class="convo__act" type="button" data-act="rename" aria-label="Rename ${title}" title="Rename">${ICON_RENAME}</button>
              <button class="convo__act" type="button" data-act="delete" aria-label="Delete ${title}" title="Delete">${ICON_DELETE}</button>
            </span>
          </li>`;
      }
      html += "</ul></section>";
    }
    nav.innerHTML = html;
  }

  async function refresh() {
    if (status !== "ready") status = "loading";
    render();
    try {
      items = await listConversations();
      status = "ready";
    } catch (err) {
      status = err?.status === 404 ? "unavailable" : "error";
      errorText =
        status === "unavailable"
          ? "Chats aren't being saved: GET /api/conversations answered 404."
          : err instanceof TypeError
            ? "Can't reach the backend, so your chats can't load."
            : `Couldn't load your chats (${err?.status ?? "error"}).`;
    }
    render();
    return status === "ready";
  }

  // --- Rename: the row turns into a text field --------------------------------
  function startRename(li) {
    const id = li.dataset.id;
    const item = items.find((i) => i.id === id);
    if (!item || li.querySelector("input")) return;
    li.classList.add("is-editing");
    const input = document.createElement("input");
    input.className = "convo__input";
    input.value = item.title;
    input.setAttribute("aria-label", "Chat title");
    input.maxLength = 120;
    li.querySelector(".convo__link").replaceWith(input);
    input.focus();
    input.select();

    let done = false;
    const finish = async (save) => {
      if (done) return;
      done = true;
      const title = input.value.trim();
      if (save && title && title !== item.title) {
        const before = item.title;
        item.title = title; // optimistic: show it now, undo on failure
        render();
        try {
          const updated = await updateConversation(id, { title });
          Object.assign(item, { title: updated.title, updated_at: updated.updated_at });
          onRenamed?.(updated);
        } catch {
          item.title = before;
        }
      }
      render();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
    input.addEventListener("blur", () => finish(true));
  }

  // --- Delete: one confirm step inside the row (no browser dialogs) ------------
  function confirmDelete(li) {
    li.classList.add("is-confirming");
    li.innerHTML = `
      <span class="convo__confirm">Delete this chat?</span>
      <button class="convo__yes" type="button" data-act="confirm-delete">Delete</button>
      <button class="convo__no" type="button" data-act="cancel">Keep</button>`;
    li.querySelector(".convo__no").focus();
  }
  async function reallyDelete(li) {
    const id = li.dataset.id;
    li.classList.add("is-leaving");
    try {
      await deleteConversation(id);
    } catch (err) {
      if (err?.status !== 404) {
        // Still there: put it back.
        render();
        return;
      }
    }
    items = items.filter((i) => i.id !== id);
    render();
    onDeleted?.(id);
  }

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const li = btn.closest(".convo");
    const act = btn.dataset.act;
    if (act === "retry") refresh();
    else if (act === "rename") startRename(li);
    else if (act === "delete") confirmDelete(li);
    else if (act === "confirm-delete") reallyDelete(li);
    else if (act === "cancel") render();
  });
  nav.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && e.target.closest(".is-confirming")) render();
    // F2 renames the focused chat, as in a file manager.
    if (e.key === "F2" && e.target.closest(".convo__link")) startRename(e.target.closest(".convo"));
  });

  return {
    refresh,
    get available() {
      return status === "ready";
    },
    setUnavailable(text) {
      status = "unavailable";
      errorText = text;
      items = [];
      render();
    },
    setActive(id) {
      activeId = id;
      for (const a of nav.querySelectorAll(".convo__link")) {
        if (a.closest(".convo").dataset.id === id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      }
    },
    /** Add or update one chat (after create, a reply, or a header rename) and keep newest first. */
    upsert(conv) {
      const summary = { id: conv.id, title: conv.title, model: conv.model, updated_at: conv.updated_at };
      items = [summary, ...items.filter((i) => i.id !== conv.id)].sort((a, b) =>
        b.updated_at.localeCompare(a.updated_at),
      );
      if (status !== "ready" && status !== "loading") return;
      status = "ready";
      render();
    },
    startRenameById(id) {
      const li = nav.querySelector(`.convo[data-id="${id}"]`);
      if (li) startRename(li);
    },
  };
}
