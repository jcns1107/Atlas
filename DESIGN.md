---
name: Atlas
description: A holographic heads-up display for a self-hosted local-AI workspace, where a talking Earth is the model and every readout is real.
colors:
  signal: "#3ad8ff"
  signal-soft: "rgba(58, 216, 255, 0.55)"
  core: "#eafcff"
  amber: "#ffb84d"
  amber-soft: "rgba(255, 184, 77, 0.14)"
  red: "#ff6b76"
  ground: "#02060a"
  panel: "rgba(8, 28, 40, 0.42)"
  panel-solid: "#06131c"
  raised: "rgba(57, 213, 255, 0.07)"
  line: "rgba(90, 205, 255, 0.2)"
  line-strong: "rgba(110, 220, 255, 0.42)"
  ink: "#d8f6ff"
  ink-2: "#8fc7da"
  ink-3: "#6fa3b6"
typography:
  readout:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "34px"
    fontWeight: 300
    lineHeight: 1
    fontVariation: "'wdth' 112"
    fontFeature: "'tnum'"
  clock:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "24px"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 110"
    fontFeature: "'tnum'"
  wordmark:
    fontFamily: "Saira, system-ui, 'Segoe UI', sans-serif"
    fontSize: "18px"
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
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "#01131c"
    typography: "{typography.label}"
    rounded: "{rounded.radius}"
    padding: "0 14px"
    height: "34px"
  button-primary-hover:
    backgroundColor: "#7be6ff"
  button-primary-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.radius}"
    padding: "0 14px"
    height: "34px"
  button-ghost-hover:
    textColor: "{colors.ink}"
  button-stop:
    backgroundColor: "transparent"
    textColor: "{colors.amber}"
    typography: "{typography.label}"
    rounded: "{rounded.radius}"
    padding: "0 14px"
    height: "34px"
  button-stop-hover:
    backgroundColor: "{colors.amber-soft}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    padding: "4px 2px"
  menu-button:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 14px 0 10px"
    height: "36px"
  menu-button-open:
    textColor: "{colors.core}"
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.square}"
    padding: "0 12px"
    height: "30px"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "10px 4px 9px"
  tab-selected:
    textColor: "{colors.core}"
  drawer:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    width: "min(380px, 92vw)"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "14px 16px 16px"
  panel-readout:
    textColor: "{colors.core}"
    typography: "{typography.readout}"
  panel-readout-warn:
    textColor: "{colors.amber}"
  module-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.square}"
    padding: "11px 2px"
  module-row-online:
    textColor: "{colors.core}"
  session-log:
    backgroundColor: "rgba(2, 10, 16, 0.78)"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    width: "min(780px, 100%)"
  message-user:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "10px 14px"
  message-error:
    backgroundColor: "{colors.amber-soft}"
    textColor: "#ffd9a1"
    rounded: "{rounded.square}"
    padding: "10px 14px"
  composer:
    backgroundColor: "rgba(4, 18, 27, 0.9)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "12px 14px 6px"
  core:
    width: "clamp(200px, 41dvh, 430px)"
  core-phone:
    width: "clamp(150px, 30dvh, 240px)"
  state-readout:
    textColor: "{colors.signal}"
    typography: "{typography.core-state}"
---

# Design System: Atlas

## Overview

**Creative North Star: "The Honest Hologram"**

Atlas is a heads-up display projected onto a blue-black table: a faint 32px grid, light falling off from the Earth near the top of the screen, and every structure drawn in translucent cyan light rather than grey. The core sits at the top of one centred column. It is a dot-matrix holographic Earth inside rotating rings, and it is the model made visible. While the model thinks, a scan arc sweeps the rings. While a reply streams, every chunk makes the Earth talk: ripples run across its land dots and voice bars jump around its rim. The rings spin faster with the measured stream rate, and everything stops dead when the backend is gone. The spectacle is real telemetry in costume.

The screen is deliberately quiet. The owner asked for less clutter, so the main view holds only a three-part top bar, the core with a one-line state readout, and the chat box beneath it, which takes the rest of the height. Telemetry and the module list sit one click away in a Systems drawer on the left. Reading stays calm: normal-width 15px type in a darker frame no wider than 780px. The owner's binding reference is the cinematic holographic HUD: cyan on black, a circular core, a boot sequence. Atlas builds its own HUD from that grammar and copies no film props or studio marks.

The world rejects the category default for chat, a conversation sidebar beside a centred transcript. Chat is the job, and it sits directly under the instrument that shows the model working.

**Key Characteristics:**
- One hue family (cyan, roughly 209–239° in OKLCH) on a near-black ground; amber and red are status voices only.
- Structure in light: 1px translucent cyan frames, with brighter 2px corner brackets on instrument regions.
- One variable typeface, Saira, in two widths: expanded tracked capitals for labels, normal width for reading.
- Glow is emission. It belongs to the core and the Earth, the identity marks, the clock, live values and lit status.
- One centred column: core, state line, chat. Everything else lives in the Systems drawer.
- The rings' speed and the Earth's voice are coupled to app state and to the measured stream.
- Every number is measured, labelled as an estimate, or an em dash that names the route it is waiting for.

## Colors

A single cyan light source on a blue-black ground, with amber and red held back as status voices.

### Primary
- **Signal Cyan** (#3ad8ff): the hologram's own light. It fills the primary button and colours lit status dots (with an 8px glow), the context arc, the corner brackets on the core, panels and log, the 2px focus outline, the composer's focus border, the open Systems button's border, the selected tab's underline, the state word, Atlas's name in the log, list markers and links. The Earth's land dots, graticule, rim and halo are drawn in the same light.
- **Signal Soft** (rgba(58, 216, 255, 0.55)): latency and chunk-arrival bars, and the hover border on ghost and link buttons.
- **Core White** (#eafcff): the hottest light. Used for the wordmark, clock, readout values, the Systems drawer and Session log titles, the selected tab, the open Systems button, online module names and the scan arc.

### Secondary
- **Stub Amber** (#ffb84d): anything that exists but isn't working yet. Used for stub module rows (filled dot and status), the warn state of the inline Model chip, the Hardware waiting note, the Stop button, the Fault and Offline state words, the error core's brackets, the Earth itself in the error and offline states, warn results in the boot log, and the Link readout when a health check fails.
- **Amber Soft** (rgba(255, 184, 77, 0.14)): fill for error messages, failed latency bars and the Stop button's hover.

### Tertiary
- **Fault Red** (#ff6b76): used in one place only, the Link chip's dot and value when the backend doesn't answer. In-flow failures (the Fault message, the error core) speak amber.

### Neutral
- **Projection Ground** (#02060a): the page ground (under a radial glow centred on the Earth and a 32px grid at 3% line alpha), the boot overlay, the Systems drawer and the browser theme colour.
- **Panel Glass** (rgba(8, 28, 40, 0.42)): telemetry panels, the Link chip and the Systems button. It is translucent so the projection grid shows through.
- **Panel Solid** (#06131c): the opaque fill of the Model select.
- **Raised Tint** (rgba(57, 213, 255, 0.07)): the operator's own message box.
- **Line** (rgba(90, 205, 255, 0.2)): the default 1px frame and divider, used on panels, the chip, the Systems button, the log frame and header rule, the drawer's tab rule, footer rule and module-row dividers, code blocks, key caps and the reasoning block's dashes.
- **Line Strong** (rgba(110, 220, 255, 0.42)): frames that must read as controls or as the drawer's edge: buttons, the composer at rest, the drawer's right border, and the hover frame on the Systems and close buttons.
- **Ink** (#d8f6ff): reading text, message bodies, key-value values and module details.
- **Ink 2** (#8fc7da): secondary text, including panel heads, key-value labels, the Systems button label, module names, the operator's speaker name, reasoning text, the state detail, the drawer intro and the date.
- **Ink 3** (#6fa3b6): meta text, including timestamps, chip labels, placeholders, unselected tabs, offline module phases, captions, notes and the operator label.

### Named Rules
**The Structure-in-Light Rule.** Frames, dividers, meter tracks and scrollbars are cyan at reduced alpha (line at 20%, line-strong at 42%). There are no grey borders anywhere in the world.

**The Status Voice Rule.** Cyan means live and answering. Amber means it exists but isn't working (stub, waiting, warning, fault, offline core). Red is only a dead Link chip. Amber and red are never decorative.

**The Contrast Floor Rule.** Every ink token clears 4.5:1 on the ground and on panel glass. Ink 3, the faintest, measures about 7.3:1 on the ground and 5.4:1 on the raised tint. New text colours meet the same floor.

## Typography

**Display Font:** Saira (variable: weight 100–900, width 50–125%), self-hosted WOFF2 in latin and latin-ext subsets under the SIL OFL, with system-ui, Segoe UI, sans-serif fallback
**Body Font:** Saira at normal width (the same family)
**Label/Mono Font:** ui-monospace, Cascadia Mono, Cascadia Code, Consolas, SFMono-Regular, monospace, for code, API routes, file paths and key caps only

**Character:** One family with two voices. The HUD voice is expanded width (`font-stretch: 125%`, the `wdth` axis) in uppercase with 0.14em tracking. The reading voice is normal width in sentence case. Numbers are tabular everywhere (`tabular-nums` is set on body), so clocks, latencies and counters never jitter.

### Hierarchy
- **Readout** (300, 34px, line-height 1, width 112%, glow): live values in the telemetry panels, such as Link latency.
- **Clock** (300, 24px, width 110%, 0.04em, glow): the top-bar clock, 17px on phones. Its date line below (weekday, date and time-zone city) is 10.5px HUD voice at 0.12em in ink 2, hidden on phones.
- **Wordmark** (600, 18px, width 125%, 0.32em, uppercase, glow): "ATLAS", centred in the top bar, with the OS version beside it in meta ink 3.
- **Core state** (700, 12px, HUD voice, signal with glow): the state word on the line under the core, followed by its detail in meta ink 2.
- **Title** (600, 13px, HUD voice): the Systems drawer title (core white with glow). The Session log title uses the same voice at 12px without glow.
- **Label** (600, 11px, HUD voice): panel heads, buttons, tabs and the Systems button.
- **Body** (400, 15px, line-height 1.55): message bodies, the composer input and the empty-state line.
- **Meta** (400, 12.5px): key-value labels, chip values, notes, module statuses, the message count and the state detail.
- **Mono** (13px in code blocks; 11–12px for routes in panel heads, module build paths and the boot log).

Off-scale sizes exist in the build: 10px, 10.5px, 11.5px, 12px, 13.5px and 14px on individual elements (the operator label, chip labels, speaker names, the code bar, timestamps, the drawer intro, module names, key-value values). Each sits within a pixel of a step above. They are not part of the scale, and new work snaps to the steps listed.

### Named Rules
**The Two Widths Rule.** Expanded tracked capitals are for labels only: panel heads, chip labels, buttons, tabs, the Systems button, speaker names, the state word, the wordmark, the drawer title and the date line. Anything a person reads as a sentence is normal width and sentence case.

**The Real Spelling Rule.** API routes and file paths keep their real, case-sensitive spelling in mono, even next to an uppercase HUD label (panel subheads, boot log lines, module build paths).

## Layout

Atlas is a full-viewport app shell (`100dvh`, page overflow hidden). Regions scroll internally; the page never scrolls.

**Shell.** Two grid rows (top bar, then the main column) with an 8px gap and 12px 20px 16px padding.

**Top bar.** Three columns (1fr auto 1fr, 16px gap, min-height 52px, no rule below): the Systems button at the left, the wordmark centred, and the Link chip with the clock at the right (18px apart). Nothing else lives here.

**Main column.** One centred flex column with a 10px gap:
- **The core**, square at clamp(200px, 41dvh, 430px). Because it is sized from height, the chat always keeps what is left.
- **The state readout**, one line centred under the core (4px below it, 22px minimum height).
- **The chat box** (min(780px, 100%) wide), which flexes to fill the remaining height, with the composer docked at its foot.

**Systems drawer.** A fixed panel on the left edge, full height, min(380px, 92vw) wide, over a scrim. It holds a head (title and close button), tabs (Telemetry | Modules), a scrolling body with 16px 20px padding, and a footer with the operator and Reboot. Telemetry panels stack at the 12px gap.

**Short screens** (under 640px tall and wider than 760px): the core drops to clamp(160px, 34dvh, 260px).

**Phone (760px and narrower).** The same column, tighter. Padding is 8px 12px plus the bottom safe area. The top bar becomes auto 1fr auto at a 10px gap: the Systems button shows its icon only (0 9px padding), the Link chip shows its dot only, and the version and date hide. The clock drops to 17px. The core shrinks to clamp(150px, 30dvh, 240px). The chat box runs edge to edge with no side borders, and its message count hides.

**Container queries.** When the composer is 560px wide or narrower, the keyboard hint hides.

**Rhythm.** 12px between panels (gap), 16px inside frames (pad), 20px drawer gutters, and internal steps of 6, 8 and 10px between rows and label pairs.

**The One Column Rule.** The main screen is the core, its state line and the chat, centred, and nothing else. Telemetry, module status and controls that are not about the conversation go in the Systems drawer, not the column, the corners or the top bar.

**The Log Keeps Its Height Rule.** The core is sized from viewport height so the session log and composer always fill what remains. Nothing pushes them below the fold.

## Elevation & Depth

Depth comes from light, not lift. Panels are flat, translucent glass over the projection grid. Hierarchy comes from frame strength (line or line-strong), ink brightness and glow, which is emission rather than elevation. The Earth reads as a sphere through its own light: a dark glass body lit from the upper left, faint back-side dots seen through it, and a halo around the rim. Only the Systems drawer casts a dark shadow, and it is opaque.

### Shadow Vocabulary
- **Glow** (`text-shadow: 0 0 14px rgba(58, 216, 255, 0.55)`, the `--glow` token): the wordmark, clock, readout values, the state word, the drawer title and Atlas's speaker name.
- **Lit dot** (`box-shadow: 0 0 8px #3ad8ff`): status dots, online module dots, the meter fill, the streaming caret and the newest latency bar (6px). The chip uses amber and red versions for warn and bad.
- **Warn readout** (`text-shadow: 0 0 12px rgba(255, 184, 77, 0.45)`): the Link value when the health check fails.
- **Composer focus** (`box-shadow: 0 0 0 1px rgba(58, 216, 255, 0.4), 0 0 26px rgba(58, 216, 255, 0.14)`): the composer while focused.
- **Drawer** (`box-shadow: 24px 0 60px rgba(0, 0, 0, 0.55)`): the Systems drawer, over a scrim of rgba(0, 3, 6, 0.55).
- **Core light** (SVG drop-shadows): scan arc 8px at full signal, context arc 6px at 80%. A bloom (radial core-cyan gradient) sits behind the Earth, and the Earth draws its own halo, which swells while it talks.

### Named Rules
**The Emission-Not-Elevation Rule.** Cyan glow marks light that is live: the core and the Earth, the identity marks, the clock, measured values, the state word and lit status. Body text, panel heads and static frames never glow.

**The Floating-Goes-Opaque Rule.** Only the Systems drawer carries a dark drop shadow, and it has an opaque ground fill over a dimming scrim, so its text never sits over the turning rings.

## Shapes

The world is square. Panels, the chip, the Systems button, tabs, the chat box, the composer, the drawer, messages and code blocks have no radius. Buttons and the model select get a barely-there 2px. Circles are reserved for status dots (7px) and the core itself.

- **Bracketed frame:** a 1px line frame plus two corner brackets in 2px signal cyan, at top-left and bottom-right only (a diagonal pair). 10×10px on telemetry panels, 14×14px on the chat box.
- **Core brackets:** four 3px signal arcs at 80% on the core's diagonals, curved rather than square.
- **Tab underline:** a 2px bottom border, signal on the selected tab, sitting on the tab row's 1px line rule.
- **Module rows:** an open list separated by 1px line rules, no frames.
- **Dashed frame:** a 1px dashed line around the reasoning block. Dashes mark the model's working, not its answer.
- **Icons:** inline SVG at a 1.5px stroke with round caps (the Systems menu glyph, close cross, chevrons, select caret). No icon font.

**The Bracket Placement Rule.** Corner brackets mark instrument regions: a diagonal pair on telemetry panels and on the chat box, arcs on the core. Chips, buttons, tabs, messages and module rows carry plain 1px frames or rules.

## Components

### Buttons
- **Shape:** square-cornered with a 2px radius, 34px minimum height and 0 14px padding, in the HUD-voice label (11px, 600, width 125%, 0.14em, uppercase).
- **Primary (Transmit):** signal cyan fill and border with near-black ink (#01131c). Hover is a brighter cyan (#7be6ff). Disabled while the composer is empty: transparent, ink 3 text, line border and a not-allowed cursor.
- **Ghost (New session):** transparent with a 1px line-strong frame and ink 2 text. Hover moves to ink text and a signal-soft border. It sits at 30px tall in the log header.
- **Stop:** amber border and text, with an amber-soft fill on hover. It replaces Transmit while a reply streams.
- **Link (Reboot):** borderless HUD label in ink 2 with 4px 2px padding, followed by Alt Shift B key caps (1px line, 11px mono ink 3).
- **Icon button (drawer close):** 34px square, transparent frame that turns line-strong on hover, an 18px glyph in ink 2.
- **Press / Focus:** buttons, the Systems button, icon buttons and tabs scale to 0.97 on press (160ms ease-out). Hover rules apply only under `(hover: hover) and (pointer: fine)`. Focus is the global 2px signal outline at a 2px offset.

### Systems button
- **Style:** 36px tall, 0 14px 0 10px padding, a 1px line frame on panel glass, square. It holds the 18px menu glyph and the HUD label "Systems" in ink 2.
- **Open:** a signal border and core-white text while the drawer is open (`aria-expanded`). Hover takes a line-strong frame. On phones it shows the glyph only.

### Status chip
- **Style:** 30px tall, 0 12px padding, a 1px line frame on panel glass, square. It holds a 7px dot, a HUD label in ink 3 and a meta-size value in ink that truncates at 200px.
- **State:** pending (ink 3 dot), ok (signal dot with glow), warn (amber dot with glow, amber value), bad (red dot with glow, red value).
- **Where:** the Link chip (latency) is the only chip in the top bar. The Model chip appears inline in the Session panel, frameless, with the same dot and value states.

### Systems drawer
- **Shell:** opaque ground, a 1px line-strong right edge and the drawer shadow, min(380px, 92vw) wide. It slides in from the left (translateX(-102%) to 0, 300ms ease-drawer) while the scrim fades in (240ms). Clicking the scrim, the close button or Escape closes it.
- **Head:** "SYSTEMS" in the title voice, core white with glow, and the close button.
- **Tabs:** Telemetry | Modules. Unselected tabs are HUD labels in ink 3; the selected tab is core white over a 2px signal underline. The Modules tab carries a normal-width count in ink 2 ("1 / 10").
- **Footer:** a 1px line rule, then "OPERATOR" (10px HUD, ink 3) with the name in meta ink 2, and Reboot with its key caps at the right.
- **Accessibility:** while closed it is `inert` and `aria-hidden`. Opening moves focus to the close button; closing returns focus to the Systems button.

### Telemetry panels
- **Corner Style:** square, with a bracketed frame (see Shapes).
- **Background:** panel glass. No shadow.
- **Internal Padding:** 14px 16px 16px.
- **Head:** a HUD label in ink 2 with a right-aligned sub, either a mono route (`/api/health`) or 12px Saira text ("last reply", "in memory").
- **Readout:** the 34px value with a meta-size unit. In the warn state it turns amber with an amber glow and the unit hides.
- **Key-value rows:** labels in meta ink 2, values at 14px in ink, right-aligned. A changed value flashes white with a signal glow for 700ms.
- **Bars:** link latency (40 bars, 34px tall, the newest brightest with glow, failed checks full-height in amber soft) and a chunk-arrival histogram for the last reply (32 bins, 26px tall).
- **Meter:** a 4px track (signal at 12%) with a glowing signal fill that grows by scaleX over 600ms. It shows the estimated context ("≈ 52 / 8,192").
- **Waiting panel:** a panel with no data source keeps its rows, shows em dashes in ink 3, and ends with an amber note naming the route and phase that will fill it.

**The Honest Readout Rule.** A value is measured; or labelled as an estimate ("≈", "estimated", "(browser)"); or an em dash with a note naming the route and phase that will supply it. There are no placeholder numbers and no simulated graphs.

### Module list
- **Intro:** one 13.5px ink 2 sentence explaining that modules come online by themselves and that amber means the route answers 501.
- **Row:** a full-width button on a four-part grid (8px dot, name, status, 10px chevron) with 11px 2px padding and a 1px line rule below. The name is 14px ink 2 and turns core white on hover.
- **Online:** a filled signal dot with glow, a core-white name and "Online" in signal.
- **Stub:** a filled amber dot and "Stub" in amber.
- **Offline:** a hollow 1px ink 3 dot and the phase ("Phase 4") in ink 3.
- **Expanded:** the chevron turns 90° (160ms) and a detail opens below (indented 22px): the blurb in 13.5px ink, then the mono build path in ink 2.
- **Status source:** a route missing from `/openapi.json` is offline; a registered route whose GET answers 501 is a stub; anything else is online.

**The Lit-Only-When-Built Rule.** A module turns cyan only when its route answers. There is no "coming soon" glow.

### The core (signature component)
Each ring is its own SVG layer in a 600-unit viewBox, so the compositor can rotate it with a transform. From the outside in:
- a static layer: a faint ring (r292, signal at 12%), four bracket arcs (r270) and the context arc (r238): a 2px signal arc on a 12% track that fills to the estimated share of the context window over 700ms;
- the tick ring: 120 ticks from r246 to r256 at 42%, with every tenth running long to r266 at 85%;
- the segmented ring (r226): a 12px stroke with a dashed base at 14% and a brighter broken pattern at 62%;
- the scan arc (r214): a short 3px core-white arc with round caps, shown only while thinking or booting;
- the bloom (inset 14%), a soft radial light behind the Earth;
- **the Earth**: a canvas inset 17% (66% of the core), sphere radius 46% of the canvas.

**The Earth.** About 2,200 land dots on a sphere tilted 20° toward the viewer, a graticule every 30° on the front half, a dark glass body with a 1.5px lit rim, and a halo. Front dots are brighter toward the viewer; back dots show faintly through the sphere. A ring of 120 voice bars sits just outside the rim (1.07× the radius); idle, they read as a faint dotted ring. It turns once every 70s at speed 1.

**The Earth talks.** Each streamed chunk adds voice energy. Ripples run outward from the centre across the land dots: dots on a wave crest are pushed out slightly and light to a hotter near-white cyan (rgb 200, 245, 255), and the voice bars jump to as much as 13% of the radius. The halo swells with them. In the error and offline states the whole Earth turns amber; offline it also dims to 35%.

**States** (the core's `data-state`; ring speed is a multiple of the base speed, and the Earth turns at 1 + 35% of the rings' extra speed so it stays calm):
- **Standby** (speed 1): "Standby · Awaiting command".
- **Listening** (speed 1.6): set while the composer has focus.
- **Thinking** (speed 3): waiting for the first token. The scan arc shows, and the detail counts up ("Waiting for first token · 2.4 s").
- **Streaming** (speed 2 + min(chunks/s ÷ 8, 6)): each chunk pulses the bloom and makes the Earth talk, and the detail reads the live rate ("34 chunks/s").
- **Error / Fault** (speed 0.4): the brackets and the Earth turn amber, the bloom dims to 8% and the state word turns amber. It returns to standby after 4s.
- **Offline** (speed 0, applied instantly): rings, brackets and the context arc go greyscale at 55% brightness, the Earth stops and dims to amber, and the readout says "Offline · Backend unreachable" in amber.
- **Booting** (speed 2.5): the scan arc shows, and the readout says "Atlas · Initialising".

**Rotation coupling.** Base periods: ticks 140s clockwise and segments 90s counter-clockwise, both coupled to the state's speed. The scan arc turns at a fixed 1.1s per revolution. Ring speed eases 6% of the way to its target each frame, and the playback rate is updated only when it moves by more than 0.01. Each chunk adds 0.14 bloom energy (capped at 1), which decays ×0.9 per frame; the bloom scales to 0.95 + 0.15 × energy, and its opacity runs from 0.25 to 0.85. Each chunk adds 0.22 voice energy to the Earth (capped at 1), which fades over about half a second.

**The Coupled Rotation Rule.** The rings' speed and the Earth's voice are the app's state plus the measured stream: one chunk, one pulse. Never a decorative timer. A dead link stops the rings and the Earth dead.

### State readout
- **Style:** one centred line under the core: the state word (12px, 700, HUD voice, signal with glow), then the detail in meta ink 2, 12px apart. It is a polite live region.
- **Fault / Offline:** the word turns amber and loses its glow.

### Session log and messages
- **Frame:** a 1px line frame on a darker fill (rgba(2, 10, 16, 0.78)) with a diagonal pair of 14px brackets, at most 780px wide. The header row (10px 16px, 1px line rule below) holds the title, the message count and a New session ghost button.
- **Empty state:** one line in ink 2: "Channel open. Ask Atlas anything."
- **Speaker row:** a HUD-voice name (operator in ink 2, Atlas in signal with glow, Fault in amber), then meta (model · seconds · chunks/s), with the time on the right.
- **Operator message:** a raised-tint box with a 1px line frame, 10px 14px padding, whitespace preserved.
- **Atlas reply:** unframed body text with rendered markdown. List markers are signal; h3–h5 headings are 15px core white; strong text is white; links are signal; inline code sits on a 10% signal tint; code blocks have a bar (language and Copy) on 50% black; blockquotes get a line-strong rule.
- **Reasoning:** a dashed frame, collapsed by default, with a signal chevron that turns 90° (160ms) when opened. The body is 13.5px ink 2.
- **Streaming caret:** a 0.55em signal block with glow, blinking on 1s steps.
- **Error:** an amber-soft fill with a 40% amber frame and warm ink (#ffd9a1). It gives one plain sentence saying what to do, followed by the raw detail in mono (#d9a866).
- **Entrance:** messages fade up 8px over 260ms, 20px apart.

### Composer
- **Style:** a 1px line-strong frame on rgba(4, 18, 27, 0.9), square, docked at the foot of the chat box.
- **Focus:** a signal border, a 1px ring and a 26px glow (200ms).
- **Input:** a 15px textarea that grows to 200px, with a signal caret and an ink 3 placeholder. Enter sends; Shift+Enter adds a new line; "/" jumps here from anywhere.
- **Bar:** the Model select (28px tall, panel solid, 2px radius, signal chevron), the keyboard hint, and Transmit or Stop.

### Boot sequence
- **When:** once per browser session. Alt+Shift+B or Reboot replays it. The HUD is hidden before first paint so it never flashes in early.
- **Open:** the real core moves to the centre of the screen with a FLIP transform (60% of the smaller of the viewport width and 75% of its height, centred at 40% of the height). Its layers, the Earth included, open from the centre with circle clip-paths (1000ms expo, 90ms stagger) while the boot log prints real checks: backend link, model list, modules and operator. Lines show a HUD name with its mono route, and results in signal for ok and amber for warn. Pacing is a 900ms lead, at least 280ms per line and a 600ms tail. A click or any key skips the pacing.
- **Hand-off:** the overlay fades over 700ms, the core glides home (850ms ease-in-out), and the top bar, the state line and the chat box draw in left to right by clip-path (620ms expo, staggered 90ms).

### Motion grammar
- **Curves:** ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for responses, ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` for the core's glide home, ease-expo `cubic-bezier(0.16, 1, 0.3, 1)` for reveals and the boot ring opening, and ease-drawer `cubic-bezier(0.32, 0.72, 0, 1)` for the Systems drawer.
- **Durations:** 160ms for press, hover and chevrons; 200ms for composer focus; 240ms for the scrim; 260ms for message entrance; 300ms for the drawer slide and the scan arc's fade; 600–700ms for meters, the context arc, value flashes and the boot overlay fade; 620ms for the reveal; 850–1000ms for the boot glide and ring opening.
- **Reduced motion:** ring rotation pauses, the scan arc included. The Earth stops turning and its dots stop rippling outward, but crests still brighten with each chunk. The bloom stops scaling but still brightens. The boot skips the ring opening, the glide and the pacing (lines print at once), and the reveal becomes a 300ms fade. Message and boot-line entrances are off, the caret holds steady, log scrolling is instant, and the drawer and scrim switch in 1ms. Colour and opacity state changes stay, as does the 160ms press scale.

**The Still-But-Readable Rule.** With reduced motion nothing rotates or travels across the screen, but every state still reads through colour and brightness.

## Do's and Don'ts

### Do:
- **Do** draw every frame and divider in cyan light: line (rgba(90, 205, 255, 0.2)) by default, line-strong (rgba(110, 220, 255, 0.42)) for controls and the drawer's edge.
- **Do** set labels in Saira at 125% width, uppercase, 0.14em tracking, and set everything people read at normal width in sentence case.
- **Do** keep API routes and file paths in mono with their real casing.
- **Do** show a missing value as an em dash with a note naming the route and phase that will supply it, and label estimates as estimates.
- **Do** drive any new core or Earth behaviour from measured data through the state speed table and the per-chunk pulse, never from a decorative timer.
- **Do** use amber for anything that exists but isn't working yet, and keep red for a dead link.
- **Do** put new instruments, telemetry and module controls in the Systems drawer, as a panel or a tab, and keep the main column to the core, the state line and the chat.
- **Do** give floating layers an opaque fill and the dark drop shadow, and keep in-flow panels translucent and shadowless.
- **Do** keep hover styles inside `(hover: hover) and (pointer: fine)` and give buttons, the Systems button and tabs a 0.97 press scale.

### Don't:
- **Don't** add grey borders, grey text or an untinted neutral; every neutral in the world leans toward the cyan hue.
- **Don't** invent numbers, sparklines or simulated telemetry to fill a panel.
- **Don't** light a module cyan before its route answers.
- **Don't** add glow to body text, panel heads or static frames.
- **Don't** introduce rounded cards, pill buttons or large radii; the world is square, with a 2px concession on controls.
- **Don't** put status chips, module markers, suggested prompts or side panels back on the main screen; the owner chose a decluttered view, and the drawer is where they go.
- **Don't** let the core or anything above the chat push the session log and composer below the fold.
- **Don't** add a second display or body typeface; Saira's width axis carries the hierarchy, and mono is for code, routes and key caps only.
- **Don't** rebuild the chat as a conversation sidebar beside a centred transcript.
