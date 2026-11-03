---
name: Atlas
description: A local-AI workspace that feels like a product — chats, a calm conversation column, and Atlas itself as a living holographic Earth that reacts to the model and to you.
colors:
  signal: "#3ad8ff"
  signal-soft: "rgba(58, 216, 255, 0.55)"
  core: "#eafcff"
  amber: "#ffb84d"
  amber-soft: "rgba(255, 184, 77, 0.14)"
  red: "#ff6b76"
  ground: "#02060a"
  ground-2: "#040c12"
  row-hover: "#07161e"
  row-active: "#081b23"
  panel-solid: "#06131c"
  raised: "rgba(57, 213, 255, 0.07)"
  line: "rgba(90, 205, 255, 0.16)"
  line-strong: "rgba(110, 220, 255, 0.36)"
  ink: "#d8f6ff"
  ink-2: "#8fc7da"
  ink-3: "#6fa3b6"
typography:
  greeting:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "clamp(26px, 2.4vw, 34px)"
    fontWeight: 300
    lineHeight: 1.15
    fontVariation: "'wdth' 108"
  clock:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "22px"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 110"
    fontFeature: "'tnum'"
  wordmark:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.32em"
    fontVariation: "'wdth' 125"
  core-state:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 125"
  label:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 125"
  body:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    fontVariation: "'wdth' 100"
    fontFeature: "'tnum'"
  meta:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    fontVariation: "'wdth' 100"
    fontFeature: "'tnum'"
  mono:
    fontFamily: "ui-monospace, 'Cascadia Mono', 'Cascadia Code', Consolas, 'SFMono-Regular', monospace"
    fontSize: "13px"
    lineHeight: 1.55
rounded:
  square: "0px"
  radius: "2px"
  dot: "50%"
spacing:
  gap: "12px"
  pad: "16px"
components:
  sidebar:
    backgroundColor: "{colors.ground-2}"
    textColor: "{colors.ink-2}"
    width: "264px"
  chat-row:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    height: "34px"
    padding: "0 8px"
  chat-row-active:
    backgroundColor: "{colors.row-active}"
    textColor: "{colors.core}"
  new-chat:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    height: "38px"
  message-user:
    backgroundColor: "rgba(57, 213, 255, 0.07)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "10px 14px"
  message-error:
    backgroundColor: "{colors.amber-soft}"
    textColor: "#ffd9a1"
    rounded: "{rounded.radius}"
    padding: "10px 14px"
  composer:
    backgroundColor: "{colors.panel-solid}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    width: "min(760px, 100%) - 48px"
  send:
    backgroundColor: "{colors.signal}"
    textColor: "#01131c"
    rounded: "{rounded.radius}"
    size: "34px"
  send-stop:
    backgroundColor: "transparent"
    textColor: "{colors.amber}"
  popover:
    backgroundColor: "{colors.panel-solid}"
    rounded: "{rounded.radius}"
    width: "min(420px, 100vw - 28px)"
  presence:
    backgroundColor: "{colors.ground}"
    width: "clamp(360px, 34vw, 560px)"
  core:
    width: "min(90cqw, 90cqh)"
  core-mini:
    width: "40px"
  vital-value:
    textColor: "{colors.core}"
    fontSize: "17px"
  state-readout:
    textColor: "{colors.signal}"
    typography: "{typography.core-state}"
---

# Design System: Atlas

## Overview

**Creative North Star: "A product with a presence."**

Atlas looks like the chat apps people already know how to use, with one thing none of them has: Atlas itself, on screen, alive. The screen has three regions, left to right:

1. **Your chats**: a quiet sidebar with the wordmark, New chat, and your saved conversations grouped by when you last used them.
2. **The conversation**: a calm reading column in the middle, Claude-style. Your messages sit right in a tinted box; Atlas's replies run full width as rendered markdown. The composer docks at the foot. An empty chat lifts the greeting and the composer to the middle of the screen.
3. **Atlas**: the instrument. A holographic Earth inside rotating rings on a projection grid, its state word and detail above it, the clock, and four real vitals beneath (model, context, last reply, link).

The owner's binding reference is the cinematic holographic HUD (cyan on black, a circular core, a boot sequence). That language now lives on Atlas's side of the screen; the chat side borrows only its colours and its frame-in-light, so reading stays calm. The old Systems drawer and module list are gone: the screen shows what Atlas *is*, never what is left to build (that lives in `docs/ROADMAP.md`).

**Key characteristics:**
- One hue family (cyan) on a near-black ground; amber and red are status voices only.
- One variable typeface, Saira: normal width for everything you read and click, expanded tracked capitals only for the instrument's labels.
- The Earth is the model made visible, and it reacts to you: typing, hovering, dragging.
- Every number is measured, labelled as an estimate, or a dash.
- Presence view: the Earth takes the whole screen, the reply runs as captions. It is the groundwork for voice mode (GUIDE Phase 15).

## Colors

A single cyan light source on a blue-black ground, with amber and red held back as status voices.

### Primary
- **Signal Cyan** (#3ad8ff): Atlas's own light. The send button, the brand mark, lit status dots (with glow), the context arc, the state word, list markers, links, focus outlines, the composer's focus frame, the reasoning chevron, the select chevrons. The Earth is drawn in the same light.
- **Core White** (#eafcff): the hottest light. The wordmark, the clock, the greeting, the open chat's title in the sidebar, vital values, popover titles.

### Secondary
- **Amber** (#ffb84d): exists but isn't working. The Stop button, Fault and Offline state words, the Earth in the error and offline states, the "not applied yet" note in Instructions, the delete confirmation row, warn results in the boot log, the context meter past 75%.
- **Amber Soft** (rgba(255, 184, 77, 0.14)): fills for error messages and the delete confirmation.

### Tertiary
- **Red** (#ff6b76): one place only, the link dot and value in the sidebar footer when the backend doesn't answer.

### Neutral
- **Ground** (#02060a): the conversation and Atlas's panel (the panel adds a 32px projection grid at 3% and a radial light centred on the Earth).
- **Ground 2** (#040c12): the sidebar, one tone step up.
- **Panel Solid** (#06131c): the composer and the Instructions popover.
- **Raised Tint** (rgba(57, 213, 255, 0.07)): your own messages, hover on quiet buttons.
- **Row Hover / Row Active** (#07161e / #081b23): chat rows. Solid, so the row actions can sit on them without a gradient.
- **Line** (rgba(90, 205, 255, 0.16)) and **Line Strong** (0.36): every frame and divider. No grey borders anywhere.
- **Ink** (#d8f6ff), **Ink 2** (#8fc7da), **Ink 3** (#6fa3b6): reading text, secondary, meta. All clear 4.5:1 on both grounds.

### Named Rules
**The Structure-in-Light Rule.** Frames, dividers, meter tracks and scrollbars are cyan at reduced alpha. There are no grey borders.

**The Status Voice Rule.** Cyan means live and answering. Amber means it exists but isn't working. Red is only a dead link. Neither is ever decorative.

## Typography

**Font:** Saira (variable: weight 100–900, width 50–125%), self-hosted WOFF2 (latin + latin-ext) under the SIL OFL, with system-ui and Segoe UI as fallbacks. **Mono:** ui-monospace / Cascadia / Consolas, for code blocks and raw error detail only.

**Character:** the product voice is Saira at normal width in sentence case. The instrument voice (expanded width, uppercase, 0.14em tracking) is used for exactly five things: the wordmark, the state word, the clock's date line, the vital labels and the boot log names. Numbers are tabular everywhere.

### Hierarchy
- **Greeting** (300, clamp(26px, 2.4vw, 34px), width 108%, core white): "Good evening, Sigmar" on an empty chat.
- **Clock** (300, 22px, width 110%, glow) with its date line (10.5px instrument voice, ink 2).
- **Vital value** (400, 17px, width 105%, core white).
- **Body** (400, 15px, line-height 1.55; replies 1.65): messages, composer, chat title.
- **UI** (13.5–14px): buttons, chat rows, New chat, popover text.
- **Meta** (12–12.5px, ink 3): reply meta, sublines, group labels ("Today", "Yesterday"), the note under the composer.
- **Instrument labels** (10.5–12px, 600–700, expanded caps): state word, vital labels.

### Named Rules
**The Two Voices Rule.** Expanded capitals belong to the instrument (Atlas's side). Anything you read or click on the chat side is normal width, sentence case.

## Layout

A full-viewport app (`100dvh`, the page never scrolls; regions scroll inside).

- **Desktop (≥ 1100px):** three columns: sidebar 264px · conversation 1fr · Atlas clamp(360px, 34vw, 560px). Each region names its grid column, so hiding the sidebar never shifts the others.
- **Sidebar collapse:** the panel icon hides it (remembered in `localStorage`); a matching button appears at the left of the chat header. No animation: it is a frequent, deliberate action.
- **Tablet (760–1099px):** the Atlas column leaves; the Earth moves into the chat header as a 40px orb (the same element, moved, so there is only ever one globe). Tapping it opens presence view.
- **Phone (< 760px):** the sidebar becomes a sheet (min(300px, 86vw)) that slides in over a scrim; the header holds the sheet button, the title, an icon-only Instructions button and the orb. Touch screens hide keyboard hints.

**Conversation column.** Max 760px including 24px gutters, centred. Rows: header (56px) · transcript · composer · one-line note. With no messages a spacer row (1.3fr) lifts the greeting and composer to the middle; the first message docks the composer at the foot.

**Atlas panel.** Rows: head (state readout · clock · full-screen toggle) · stage (a size container; the core is min(90cqw, 90cqh)) · vitals (a 2×2 divided block, one 1px line between cells). Short screens (< 700px tall) drop the vital sublines.

**Presence view** (`.app[data-view="presence"]`): one column. The Atlas panel fills the screen (head, Earth, then captions of the latest reply at 18px, centred, max 760px), and the composer stays as one slim line at the bottom, max 680px. The sidebar, chat header, transcript and vitals hide. Escape or the toggle returns to the chat.

## Elevation & Depth

Depth comes from light, not lift. Surfaces are flat; separation is one tone step (sidebar) or one 1px line. Real shadows exist only on what floats: the Instructions popover (0 18px 48px at 55%) and the phone sheet while open (24px 0 60px at 55%).

**Glow is emission.** It belongs to light that is live: the Earth and its bloom, the wordmark and mark, the clock, the state word, lit status dots, the streaming caret, the focused composer. Body text and frames never glow.

## Shapes

Square, with a 2px radius on every control, message box, code block, row and popover. Circles only for status dots, the operator's initial and the core. Icons are inline SVG at a 1.5px stroke with round caps (16–18px).

## Components

### Sidebar
- **Head:** the mark (a small globe with a dashed orbit, signal with a soft glow) and the ATLAS wordmark (15px, 600, 0.32em, glow); the hide button at the right.
- **New chat:** full width, 38px, a 1px line-strong frame, a signal plus, the label, and "Alt N" in ink 3 at the right (hidden on touch).
- **Groups:** Today · Yesterday · Previous 7 days · Previous 30 days · then month and year; 12px ink 3 sentence-case labels.
- **Row:** 34px, a link to `#/c/<id>` (so back/forward and reload work). Hover: row-hover fill, ink text. Open chat: row-active fill, core white text (brightness, no accent bar).
- **Row actions:** rename (pencil) and delete (bin) appear on hover or focus, on a solid fill matching the row. Rename turns the row into a text field (Enter saves, Escape cancels, blur saves; F2 also renames). Delete asks once, inside the row, on amber soft: "Delete this chat?" · Delete · Keep. No browser dialogs.
- **States:** loading shows six flat bars at title size (no shimmer); empty says "No chats yet. Your first message starts one."; errors say what failed in one sentence with Try again.
- **Footer:** the operator's initial in a ringed disc and name; the link dot and latency (red "Offline" when dead).

### Conversation
- **Header:** the chat title (click to rename in place; disabled for an unsaved chat), Instructions (a dot when set) and, when narrow, the Earth orb.
- **Instructions popover:** the chat's system prompt. Grows out of its button (top-right origin, 180ms ease-out from 0.97 scale and 0 opacity; closes instantly). Ctrl+Enter saves. While the backend can't apply instructions yet, one amber line says so.
- **Your message:** right-aligned, max 85% (92% on phones), raised tint, 1px line, whitespace kept.
- **Atlas's reply:** full-width markdown. Under it, the meta (model · seconds · tok/s · context) and Copy (shown on hover; always on touch).
- **Reasoning:** a dashed frame, collapsed, "Thinking…" while it streams, then "Thought · N characters".
- **Error:** amber soft with one plain sentence saying what to do and the raw detail in mono.
- **Note under the composer:** one 12.5px line, only when something isn't true yet (for example "Messages stay until you reload: the backend doesn't save them yet."). A fact is said once: an unsaved old chat says it in the greeting line instead.
- **Entrances:** a new message rises 6px over 220ms. History opens all at once.

### Composer
- Panel solid, 1px line-strong frame, no shadow at rest. Focus: signal frame, a 1px ring and a 26px glow.
- The textarea grows to 220px. Enter sends, Shift+Enter breaks a line, Escape stops a reply, "/" jumps here from anywhere.
- The bar: Model and Thinking selects (30px, 1px line, an icon, a signal chevron), the keyboard hint, and Send (34px signal square with an up arrow; transparent and ink 3 when there is nothing to send) or Stop (amber frame, filled square).
- Model and Thinking belong to the chat (saved with PATCH); a new chat starts from your last choice. A model the chat names that isn't installed shows as "name (not installed)".

### The core (Atlas)
Each ring is its own SVG layer in a 600-unit viewBox, rotated on the compositor: a static layer (faint ring, four bracket arcs, the context arc on its track), the tick ring (120 ticks), the segmented ring, the scan arc (only while thinking or booting), the bloom, and the Earth's canvas (inset 17%).

**The Earth.** About 2,200 land dots on a sphere tilted 20°, a graticule, a dark glass body with a lit rim, a halo, and 120 voice bars just outside the rim. It turns once every 70s at speed 1.

**It reacts to the model:**
- *Standby:* turns slowly; the halo breathes; every few seconds a signal arc hops between two places on its visible face.
- *Listening:* the composer has focus; each keystroke flickers it and sometimes launches an arc.
- *Thinking:* the scan arc sweeps; arcs fire every 0.16–0.36s ("searching").
- *Speaking:* every streamed chunk pulses the bloom and the Earth talks: ripples run across the land dots, the voice bars jump, and some chunks launch arcs. The rings spin faster with the measured rate.
- *Fault:* amber, slow. *Offline:* amber, dimmed, rings greyed and stopped dead.

**It reacts to you:**
- *Hover:* dots under the pointer light up (a 0.3R spotlight) and a reticle shows the real latitude and longitude under it (an inverse projection, not a lookup).
- *Drag (or arrow keys when focused):* spin it and lean it; let go and it coasts, then friction hands it back to its own turn and the lean springs back.
- *Pointer over the panel:* the whole instrument leans up to 7° toward it on a spring.

**Arcs:** a great-circle path between two land dots 15–75° apart, lifted above the surface in proportion to its length; a lit tail runs along it, brighter at the head, and a ring pings where it lands. At most 14 at once.

**The Coupled Motion Rule.** Speed and voice come from real state: one chunk, one pulse; a dead link stops everything dead. Ambient motion (the slow turn, the breathing, an arc every few seconds) is allowed only while Atlas is idle, so it reads as alive without ever pretending to be busy.

### Vitals
Four cells, label over value over subline: **Model** (this chat's model, or why the list is missing), **Context** (Ollama's real count after a reply, "≈" estimate before; a 3px meter, amber past 75%), **Last reply** (tok/s from Ollama's counts, chunks/s if there are none; seconds and tokens beneath), **Link** (round-trip to `/api/health` every 5s). A changed value flashes white for 700ms.

### Boot sequence
Once per browser session (Alt+Shift+B replays it; `?boot=0` skips it). The real core is lifted into the body at its boot size, centred at 40% of the height, and its layers open from the centre with circle clip-paths while the log prints real checks: backend link, models, chats, operator. Then the overlay fades, the regions draw in left to right (clip-path, 620ms, 90ms stagger) and the core glides home with one transform (move + scale to its slot, 850ms ease-in-out), to the Atlas panel or to the header orb.

### Motion grammar
- **Curves:** ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for responses; ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` for the boot glide; ease-expo `cubic-bezier(0.16, 1, 0.3, 1)` for reveals; ease-drawer `cubic-bezier(0.32, 0.72, 0, 1)` for the phone sheet. Springs (in JS) for the lean and the globe's tilt.
- **Durations:** 160ms press, hover and chevrons; 180ms popover; 200ms composer focus; 220ms message entrance; 300ms phone sheet; 600–700ms meters, the context arc and value flashes.
- **Press:** every pressable thing scales to 0.97 (the orb to 0.94). Hover styles live inside `(hover: hover) and (pointer: fine)`.
- **No animation** on keyboard actions (Alt N, "/", collapsing the sidebar).
- **Reduced motion:** nothing rotates or travels by itself: rings pause, the Earth stops turning, no arcs, no ripples, no lean. Talking still shows as brightness, and your own drag still turns the globe. Entrances become fades or nothing.

## Do's and Don'ts

### Do:
- **Do** keep the chat side a calm product: sentence case, normal width, no glow on text.
- **Do** drive any new Earth or ring behaviour from real state, and keep idle motion slow and occasional.
- **Do** show a missing value as a dash and label estimates as estimates; say once, in one quiet line, when something isn't saved or applied yet.
- **Do** give new per-chat settings a home on the chat (header or composer bar) and save them with PATCH.
- **Do** keep hover styles behind `(hover: hover) and (pointer: fine)` and give every pressable thing the 0.97 press.

### Don't:
- **Don't** put unbuilt features, module lists, phase numbers or "coming soon" on screen; they live in the roadmap.
- **Don't** add grey borders, grey text or untinted neutrals.
- **Don't** invent numbers or simulate telemetry.
- **Don't** add a second typeface, rounded cards, pill buttons or large radii.
- **Don't** let anything push the composer below the fold, or sit on top of the conversation.
- **Don't** use the expanded capitals on the chat side.
