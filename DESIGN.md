---
name: Atlas
description: A holographic heads-up display for a self-hosted local-AI workspace, where the core is the model and every readout is real.
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
    fontSize: "30px"
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
    fontSize: "clamp(11px, 2.9cqi, 18px)"
    fontWeight: 700
    letterSpacing: "0.18em"
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
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.square}"
    padding: "0 12px"
    height: "30px"
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
  popover:
    backgroundColor: "{colors.panel-solid}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "14px 16px"
    width: "280px"
  systems-sheet:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.square}"
    padding: "12px"
    width: "min(360px, calc(100vw - 32px))"
  session-log:
    backgroundColor: "rgba(2, 10, 16, 0.72)"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
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
  prompt-suggestion:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "10px 12px"
  composer:
    backgroundColor: "rgba(4, 18, 27, 0.9)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "12px 14px 6px"
  node-online:
    textColor: "{colors.core}"
  node-stub:
    textColor: "{colors.amber}"
  node-offline:
    textColor: "{colors.ink-3}"
  core:
    width: "min(100% - 120px, 100dvh - 220px, 640px)"
  core-phone:
    width: "96px"
  core-state-label:
    textColor: "#02121a"
    typography: "{typography.core-state}"
---

# Design System: Atlas

## Overview

**Creative North Star: "The Honest Hologram"**

Atlas is a heads-up display projected onto a blue-black table: a faint 32px grid, light falling off from just left of centre, and every structure drawn in translucent cyan light rather than grey. At its centre sits the core, a stack of concentric rings that is the model made visible. It sweeps a scan arc while the model thinks, surges with every streamed chunk, spins faster with the measured stream rate, and stops dead when the backend is gone. Ten module nodes sit on its outer ring and light up only when their backend routes really exist. The spectacle is real telemetry in costume.

Density is instrument-panel high at the edges (telemetry rail, status chips, a strip of traffic numbers) and calm where reading happens. The session log on the right is a darker, quieter frame with normal-width 15px type, so a reply stays comfortable to read beside the turning core. The owner's binding reference is the cinematic holographic HUD: cyan on black, a circular core, dense panels and a boot sequence. Atlas builds its own HUD from that grammar and copies no film props or studio marks.

The world rejects the category default for chat, a conversation sidebar beside a centred transcript. Chat is the job, and it lives in the right-hand log next to the instrument that shows the model working.

**Key Characteristics:**
- One hue family (cyan, roughly 209–239° in OKLCH) on a near-black ground; amber and red are status voices only.
- Structure in light: 1px translucent cyan frames, with brighter 2px corner brackets on instrument regions.
- One variable typeface, Saira, in two widths: expanded tracked capitals for labels, normal width for reading.
- Glow is emission. It belongs to the core, the identity marks, the clock, live values and lit status.
- The core's ring speed is coupled to app state and to the measured stream rate.
- Every number is measured, labelled as an estimate, or an em dash that names the route it is waiting for.

## Colors

A single cyan light source on a blue-black ground, with amber and red held back as status voices.

### Primary
- **Signal Cyan** (#3ad8ff): the hologram's own light. It fills the primary button and colours lit status dots (with an 8px glow), the context arc, panel and log corner brackets, the 2px focus outline, the composer's focus border, Atlas's name in the log, list markers and links.
- **Signal Soft** (rgba(58, 216, 255, 0.55)): latency and chunk-arrival bars, and the hover border on ghost buttons and suggested prompts.
- **Core White** (#eafcff): the hottest light. Used for the wordmark, clock, readout values, the Session log and popover titles, online node names, the data-ring arc, the scan arc and the listening inner ring.

### Secondary
- **Stub Amber** (#ffb84d): anything that exists but isn't working yet. Used for stub module nodes and their leader ticks, warn chips (model list still a stub), the Hardware waiting note, the Stop button, the core's Fault and Offline labels, the error core's brackets, warn results in the boot log, and the Link readout when a health check fails.
- **Amber Soft** (rgba(255, 184, 77, 0.14)): fill for error messages, failed latency bars and the Stop button's hover.

### Tertiary
- **Fault Red** (#ff6b76): used in one place only, the Link chip's dot and value when the backend doesn't answer. In-flow failures (the Fault message, the error core) speak amber.

### Neutral
- **Projection Ground** (#02060a): the page ground (under a radial glow and a 32px grid at 3.5% line alpha), the boot overlay, the Systems sheet on narrow screens, and the browser theme colour.
- **Panel Glass** (rgba(8, 28, 40, 0.42)): telemetry panels and status chips. It is translucent so the projection grid shows through.
- **Panel Solid** (#06131c): opaque floating surfaces, the module popover and the model select.
- **Raised Tint** (rgba(57, 213, 255, 0.07)): the operator's own message box and the suggested prompts.
- **Line** (rgba(90, 205, 255, 0.2)): the default 1px frame and divider, used on panels, chips, the top-bar and strip rules, the log header, code blocks and the reasoning block's dashes.
- **Line Strong** (rgba(110, 220, 255, 0.42)): frames that must read as controls or as floating, such as buttons, the composer at rest, the popover, the Systems sheet, the plate and an expanded node.
- **Ink** (#d8f6ff): reading text, message bodies and key-value values.
- **Ink 2** (#8fc7da): secondary text, including panel heads, key-value labels, the operator's speaker name, reasoning text and the date.
- **Ink 3** (#6fa3b6): meta text, including timestamps, chip labels, placeholders, offline nodes, captions and notes.

### Named Rules
**The Structure-in-Light Rule.** Frames, dividers, meter tracks and scrollbars are cyan at reduced alpha (line at 20%, line-strong at 42%). There are no grey borders anywhere in the world.

**The Status Voice Rule.** Cyan means live and answering. Amber means it exists but isn't working (stub, waiting, warning, fault, offline core). Red is only a dead Link chip. Amber and red are never decorative.

**The Contrast Floor Rule.** Every ink token clears 4.5:1 on the ground and on panel glass. Ink 3, the faintest, measures about 7.3:1 on the ground and 5.4:1 on the raised tint. New text colours meet the same floor.

## Typography

**Display Font:** Saira (variable: weight 100–900, width 50–125%), self-hosted WOFF2 in latin and latin-ext subsets under the SIL OFL, with system-ui, Segoe UI, sans-serif fallback
**Body Font:** Saira at normal width (the same family)
**Label/Mono Font:** ui-monospace, Cascadia Mono, Cascadia Code, Consolas, SFMono-Regular, monospace, for code, API routes and file paths only

**Character:** One family with two voices. The HUD voice is expanded width (`font-stretch: 125%`, the `wdth` axis) in uppercase with 0.14em tracking. The reading voice is normal width in sentence case. Numbers are tabular everywhere (`tabular-nums` is set on body), so clocks, latencies and counters never jitter.

### Hierarchy
- **Readout** (300, 34px, line-height 1, width 112%, glow): live values in the telemetry rail, such as Link latency. Drops to 28px on desktop screens under 840px tall.
- **Clock** (300, 30px, width 110%, 0.04em, glow): the top-bar clock, 20px on phones. Its date line below is 11px HUD voice in ink 2.
- **Wordmark** (600, 18px, width 125%, 0.32em, uppercase, glow): "ATLAS" in the top bar only.
- **Core state** (700, clamp(11px, 2.9cqi, 18px), width 125%, 0.18em, uppercase): the state word on the core's disc, scaled to the core's own width. It becomes 14px core white with glow beside the phone instrument.
- **Title** (600, 13px, HUD voice): the Session log title and the popover title.
- **Label** (600, 11px, HUD voice): panel heads and buttons.
- **Body** (400, 15px, line-height 1.55): message bodies and the composer input. Empty-state copy is capped at 46ch.
- **Meta** (400, 12.5px): key-value labels, chip values, notes, the message count and the bottom strip.
- **Mono** (13px in code blocks; 11–12px for routes in panel heads, popover paths and the boot log).

Off-scale sizes exist in the build: 10px, 10.5px, 11.5px, 12px, 13.5px and 14px on individual elements (chip and node labels, speaker names, the code bar, timestamps, popover text, key-value values). Each sits within a pixel of a step above. They are not part of the scale, and new work snaps to the steps listed.

### Named Rules
**The Two Widths Rule.** Expanded tracked capitals are for labels only: panel heads, chip labels, buttons, speaker names, node names, the core state, the wordmark and the plate. Anything a person reads as a sentence is normal width and sentence case.

**The Real Spelling Rule.** API routes and file paths keep their real, case-sensitive spelling in mono, even inside an uppercase HUD label (panel subheads, boot log lines, popover paths).

## Layout

Atlas is a full-viewport app shell (`100dvh`, page overflow hidden). Regions scroll internally; the page never scrolls.

**Desktop (wider than 1180px).** A three-column grid with a 12px gap and 12px / 16px outer padding:
- **Rail** (clamp(244px, 19vw, 288px)): telemetry panels stacked at the 12px gap (Link, Stream, Session, Hardware).
- **Stage** (minmax(0, 1fr)): the core, centred, with two horizontal beams at its centre ±34px. The beams run from the stage's left edge across the gutter to the log's frame.
- **Comms** (clamp(380px, 31vw, 560px)): the session log with the composer at its foot.
- The top bar spans all columns (min-height 56px, 1px line rule below): wordmark, status chips, operator, clock. The bottom strip also spans all columns, in three columns (1fr auto 1fr) for traffic, the plate and Reboot, with a 1px rule above.
- The core is square at min(100% − 120px, 100dvh − 220px, 640px).
- **Short desktop.** Under 940px tall, panel padding tightens to 11px 14px 12px and two explanatory notes hide. Under 840px tall, the chunk-arrival caption hides and readouts drop to 28px.

**Systems drawer (1180px and narrower).** The grid becomes two columns, stage minmax(0, 1fr) and comms minmax(360px, 46vw). The rail leaves the grid and becomes the Systems sheet. It is fixed at top 76px and right and bottom 16px, min(360px, 100vw − 32px) wide, with an opaque ground fill, a line-strong frame and the sheet shadow. A Systems ghost button in the top bar opens it; its label switches to "Close", and Escape closes it. The sheet also gains a Modules list panel. Operator, OS version and the Modules chip hide, and the core caps at 560px and 100dvh − 230px.

**Phone (760px and narrower).** One column: top bar, stage, log. The gap is 8px, with 8px 12px padding plus the bottom safe area. Status chips, the version, the date, the bottom strip, the beams and the module nodes hide. The core shrinks to a 96px status instrument at the left, with its state and detail set to its right. The log runs edge to edge with no side borders. The Systems sheet fills the screen below 60px, borderless.

**Container queries.** When the core is 440px wide or narrower, node labels drop their phase line. When the composer is 560px wide or narrower, the keyboard hint hides.

**Rhythm.** 12px between regions and panels (gap), 16px inside frames (pad), and internal steps of 6, 8 and 10px between rows and label pairs.

**The Log Keeps Its Height Rule.** When width runs out, telemetry moves into the Systems sheet before the session log gives up any height. The log and composer are never pushed below the fold.

## Elevation & Depth

Depth comes from light, not lift. Panels are flat, translucent glass over the projection grid. Hierarchy comes from frame strength (line or line-strong), ink brightness and glow, which is emission rather than elevation. Only floating layers cast a dark shadow, and they turn opaque when they do.

### Shadow Vocabulary
- **Glow** (`text-shadow: 0 0 14px rgba(58, 216, 255, 0.55)`, the `--glow` token): the wordmark, clock, readout values, online node names, Atlas's speaker name, the plate and the phone core state.
- **Lit dot** (`box-shadow: 0 0 8px #3ad8ff`): status dots, the meter fill, the streaming caret and the newest latency bar. Chips use amber and red versions for warn and bad.
- **Warn readout** (`text-shadow: 0 0 12px rgba(255, 184, 77, 0.45)`): the Link value when the health check fails.
- **Composer focus** (`box-shadow: 0 0 0 1px rgba(58, 216, 255, 0.4), 0 0 26px rgba(58, 216, 255, 0.14)`): the composer while focused.
- **Log receiving** (`box-shadow: 0 0 18px rgba(58, 216, 255, 0.25)` on a 1px signal frame at 55%): flashes on the log's frame when a reply pulse lands.
- **Popover** (`box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55)`): the module popover.
- **Sheet** (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6)`): the Systems sheet.
- **Core light** (SVG drop-shadows): disc 30px at 45%, scan arc 8px, context arc 6px and data arc 5px. The brand mark gets 6px.

### Named Rules
**The Emission-Not-Elevation Rule.** Cyan glow marks light that is live: the core, the identity marks, the clock, measured values and online modules. Body text, panel heads and static frames never glow.

**The Floating-Goes-Opaque Rule.** Only the popover and the Systems sheet carry a dark drop shadow, and both switch to an opaque fill (panel solid or ground) so their text never sits over the turning rings.

## Shapes

The world is square. Panels, chips, the log, the composer, the popover, messages and code blocks have no radius. Buttons and the model select get a barely-there 2px. Circles are reserved for status dots (6–7px) and the core itself.

- **Bracketed frame:** a 1px line frame plus two 10×10px corner brackets in 2px signal cyan, at top-left and bottom-right only (a diagonal pair). Used on telemetry panels.
- **Log frame:** a 1px line frame with a single 14×14px bracket at top-left.
- **Core brackets:** four 3px signal arcs on the core's diagonals, curved rather than square.
- **Plate:** a trapezoid made from an open-topped 1px line-strong frame tilted with `perspective(40px) rotateX(-6deg)`, centred in the bottom strip.
- **Dashed frame:** a 1px dashed line around the reasoning block. Dashes mark the model's working, not its answer.
- **Icons:** inline SVG at a 1.5px stroke (brand mark, reasoning chevron, select caret). No icon font.

**The Bracket Placement Rule.** Corner brackets mark instrument regions: a diagonal pair on telemetry panels, one top-left bracket on the session log, arcs on the core. Chips, buttons, messages and the popover carry plain 1px frames.

## Components

### Buttons
- **Shape:** square-cornered with a 2px radius, 34px minimum height and 0 14px padding, in the HUD-voice label (11px, 600, width 125%, 0.14em, uppercase).
- **Primary (Transmit):** signal cyan fill and border with near-black ink (#01131c). Hover is a brighter cyan (#7be6ff). Disabled while the composer is empty: transparent, ink 3 text, line border and a not-allowed cursor.
- **Ghost (New session, Systems):** transparent with a 1px line-strong frame and ink 2 text. Hover moves to ink text and a signal-soft border. The open Systems toggle takes a signal border and core-white text.
- **Stop:** amber border and text, with an amber-soft fill on hover. It replaces Transmit while a reply streams.
- **Link (Reboot):** borderless, ink 2.
- **Press / Focus:** every button scales to 0.97 on press (160ms ease-out). Hover rules apply only under `(hover: hover) and (pointer: fine)`. Focus is the global 2px signal outline at a 2px offset.

### Status chips
- **Style:** 30px tall, 0 12px padding, a 1px line frame on panel glass, square. Each holds a 7px dot, a HUD label in ink 3 and a meta-size value in ink that truncates at 180px.
- **State:** pending (ink 3 dot), ok (signal dot with glow), warn (amber dot with glow, amber value), bad (red dot with glow, red value). The three chips are Link (latency), Model (the chosen model) and Modules (online / total).

### Telemetry panels
- **Corner Style:** square, with a bracketed frame (see Shapes).
- **Background:** panel glass. No shadow.
- **Internal Padding:** 14px 16px 16px.
- **Head:** a HUD label in ink 2 with a right-aligned sub, either a mono route (`/api/health`) or 12px Saira text ("last reply").
- **Readout:** the 34px value with a meta-size unit. In the warn state it turns amber with an amber glow.
- **Key-value rows:** labels in meta ink 2, values at 14px in ink. A changed value flashes white with a signal glow for 700ms.
- **Bars:** link latency (40 bars, the newest brightest with glow, failed checks full-height in amber soft) and a chunk-arrival histogram for the last reply (32 bins).
- **Meter:** a 4px track (signal at 12%) with a glowing signal fill that grows by scaleX over 600ms.
- **Waiting panel:** a panel with no data source keeps its rows, shows em dashes in ink 3, and ends with an amber note naming the route and phase that will fill it.

**The Honest Readout Rule.** A value is measured; or labelled as an estimate ("≈", "estimated", "(browser)"); or an em dash with a note naming the route and phase that will supply it. There are no placeholder numbers and no simulated graphs.

### The core (signature component)
Each ring is its own SVG layer, so the compositor can rotate it with a transform. In a 600-unit viewBox, from the outside in:
- a faint ring (r292), module leader ticks (r268–280) and four bracket arcs (r270);
- the tick ring: 120 ticks from r246 to r256, with every tenth running long to r266;
- a dark well (r236), then the segmented ring (r224): a 14px stroke with a dashed base at 16% and a brighter broken pattern at 70%;
- the data ring (r200): a 1px thin circle plus a broken core-white arc with glow;
- the context arc (r178): a 5px signal arc that fills to the estimated share of the context window over 700ms;
- the iris (r152–166, 60 static blades), then the scan arc (r142): a short core-white arc with round caps;
- the disc (r118): a radial gradient from #f2fdff through #9beeff and #2bb6e0 to transparent, with dotted and solid inner rings (r74, r96) and a screen-blended bloom over it.

The readout sits on the bright disc in dark ink: the state word in #02121a and the detail line in #063346 (600). On phones it moves out beside the 96px core.

**States** (the root's `data-state`; ring speed is a multiple of the base speed):
- **Standby** (speed 1): "Standby · Awaiting command".
- **Listening** (speed 1.6): set while the composer has focus. The inner ring brightens to core white.
- **Thinking** (speed 3): waiting for the first token. The scan arc shows, and the detail counts up ("Waiting for first token · 2.4 s").
- **Streaming** (speed 2 + min(chunks/s ÷ 8, 6)): each chunk pulses the disc and bloom, and the detail reads the live rate ("33 chunks/s").
- **Error / Fault** (speed 0.4): the brackets turn amber, the disc dims to 16% and the label turns amber. It returns to standby after 4s.
- **Offline** (speed 0, applied instantly): rings go greyscale at 55% brightness, the disc drops to 16%, and the label reads "Offline · Backend unreachable" in amber.
- **Booting** (speed 2.5): the scan arc shows, and the readout reads "Atlas · Initialising".

**Rotation coupling.** Base periods: ticks 140s clockwise, segments 90s counter-clockwise, data 46s clockwise. These three are coupled to the state's speed. The scan arc turns at a fixed 1.1s per revolution and only shows while thinking or booting. Speed eases 6% of the way to its target each frame, and the playback rate is updated only when it moves by more than 0.01. Each chunk adds 0.14 energy (capped at 1), which decays ×0.9 per frame. The disc scales to 1 + 0.05 × energy, and its opacity runs from 0.82 to 1. The bloom scales to 0.92 + 0.3 × energy, and its opacity runs from 0.18 to 0.88.

**The Coupled Rotation Rule.** The core's speed is the app's state plus the measured stream rate, never a decorative speed-up. A dead link stops the rings dead.

### Module nodes
- **Placement:** ten nodes spaced evenly from the top, clockwise, at 46.5% of the core's width. Each has a leader tick on the ring, and its label is pushed outward so it never sits on the ticks.
- **Style:** a transparent button with a transparent 1px frame (line on hover, line-strong when expanded) and 5px 8px padding. It holds a HUD-voice name with a 6px dot and a phase line ("Phase 4") below.
- **Online:** core-white name with glow, a filled signal dot with glow, and the phase and leader tick in signal.
- **Stub:** amber name, phase, filled dot and leader.
- **Offline:** ink 3 name and phase, a hollow dot, and the leader in ink 3 at 60%.
- **Status source:** a route missing from `/openapi.json` is offline; a registered route whose GET answers 501 is a stub; anything else is online.
- **Popover:** 280px wide, panel solid, a line-strong frame and the popover shadow. It shows the title, a status line (signal "Online", amber "Stub · route answers 501", or ink 2 "Not built yet · Phase N"), the blurb and the mono build path. It grows from the node over 160ms (scale 0.96 to 1). Side nodes open outward and top or bottom nodes open toward the centre. Escape closes it and returns focus.
- **Phone:** the ring is replaced by a Modules list in the Systems sheet, using the same status colours.

**The Lit-Only-When-Built Rule.** A node turns cyan only when its route answers. There is no "coming soon" glow.

### Session log and messages
- **Frame:** a 1px line frame on a darker fill (rgba(2, 10, 16, 0.72)) with a single top-left bracket. The header row holds the title, the message count and a New session ghost button.
- **Speaker row:** a HUD-voice name (operator in ink 2, Atlas in signal with glow, Fault in amber), then meta (model · seconds · chunks/s), with the time on the right.
- **Operator message:** a raised-tint box with a 1px line frame, 10px 14px padding, whitespace preserved.
- **Atlas reply:** unframed body text with rendered markdown. List markers are signal; h3–h5 headings are 15px core white; strong text is white; links are signal; inline code sits on a 10% signal tint; code blocks have a bar (language and Copy) on 50% black; blockquotes get a line-strong rule.
- **Reasoning:** a dashed frame, collapsed by default, with a signal chevron that rotates 90° (160ms) when opened. The body is 13.5px ink 2.
- **Streaming caret:** a 0.55em signal block with glow, blinking on 1s steps.
- **Error:** an amber-soft fill with a 40% amber frame and warm ink (#ffd9a1). It gives one plain sentence saying what to do, followed by the raw detail in mono (#d9a866).
- **Entrance:** messages fade up 8px over 260ms.
- **Empty state:** a 17px title, a 46ch line naming the route, and three suggested prompts (raised tint, line frame, signal-soft on hover, 0.985 on press).

### Composer
- **Style:** a 1px line-strong frame on rgba(4, 18, 27, 0.9), square, docked at the foot of the log.
- **Focus:** a signal border, a 1px ring and a 26px glow (200ms).
- **Input:** a 15px textarea that grows to 200px, with a signal caret and an ink 3 placeholder. Enter sends; Shift+Enter adds a new line.
- **Bar:** the Model select (28px tall, panel solid, 2px radius, signal chevron), the keyboard hint, and Transmit or Stop.

### Beams and plate
- **Beams:** 1px hairlines with a soft blurred 5px band; the second beam sits at 60% opacity. A 140×3px core-white pulse travels them. It runs out (log to core) when a message is sent, then pulses the core. It runs in (core to log) while a reply streams, at most every 700ms, and the log's frame flashes as it lands. Beams are hidden on phones.
- **Plate:** "ATLAS · LOCAL INTELLIGENCE" at 12px in the HUD voice, tracked to 0.3em with glow, inside the trapezoid.

### Boot sequence
- **When:** once per browser session. Alt+Shift+B or Reboot replays it. The HUD is hidden before first paint so it never flashes in early.
- **Open:** the real core moves to the centre of the screen with a FLIP transform (60% of the smaller of the viewport width and 75% of its height, centred at 40% of the height). Its layers open from the centre with circle clip-paths (1000ms expo, 90ms stagger) while the boot log prints real checks: backend link, model list, modules and operator. Results show in signal for ok and amber for warn. Pacing is a 900ms lead, at least 280ms per line and a 600ms tail. A click or any key skips the pacing.
- **Hand-off:** the overlay fades over 700ms, the core glides home (850ms ease-in-out), and the panels draw in left to right by clip-path (620ms expo, staggered 70ms each).

### Motion grammar
- **Curves:** ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for responses, ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` for travel (beam pulses, the core's glide home), and ease-expo `cubic-bezier(0.16, 1, 0.3, 1)` for reveals and the boot ring opening.
- **Durations:** 160ms for press, hover and the popover; 200–220ms for composer focus and the Systems sheet; 260ms for message entrance; 600–700ms for meters, the context arc, value flashes and the boot overlay fade; 620ms for the panel reveal and beam travel; 850–1000ms for the boot glide and ring opening.
- **Reduced motion:** all ring rotation pauses, the scan arc included. The disc and bloom stop scaling but still brighten with each chunk. Beam pulses are off. The boot skips the ring opening, the glide and the pacing (lines print at once), and the panel reveal becomes a 300ms fade. Message and boot-line entrances are off, the caret holds steady, and log scrolling is instant. Colour and opacity state changes stay, as do the small 160–220ms transitions (press scale, popover scale, sheet rise).

**The Still-But-Readable Rule.** With reduced motion nothing rotates or travels across the screen, but every state still reads through colour and brightness.

## Do's and Don'ts

### Do:
- **Do** draw every frame and divider in cyan light: line (rgba(90, 205, 255, 0.2)) by default, line-strong (rgba(110, 220, 255, 0.42)) for controls and floating layers.
- **Do** set labels in Saira at 125% width, uppercase, 0.14em tracking, and set everything people read at normal width in sentence case.
- **Do** keep API routes and file paths in mono with their real casing.
- **Do** show a missing value as an em dash with a note naming the route and phase that will supply it, and label estimates as estimates.
- **Do** drive any new core behaviour from measured data through the state speed table, never from a decorative timer.
- **Do** use amber for anything that exists but isn't working yet, and keep red for a dead link.
- **Do** give floating layers an opaque fill and the dark drop shadow, and keep in-flow panels translucent and shadowless.
- **Do** keep hover styles inside `(hover: hover) and (pointer: fine)` and give every pressable element a press scale (0.97 for buttons and nodes).

### Don't:
- **Don't** add grey borders, grey text or an untinted neutral; every neutral in the world leans toward the cyan hue.
- **Don't** invent numbers, sparklines or simulated telemetry to fill a panel.
- **Don't** light a module node cyan before its route answers.
- **Don't** add glow to body text, panel heads or static frames.
- **Don't** introduce rounded cards, pill buttons or large radii; the world is square, with a 2px concession on controls.
- **Don't** let the spectacle cover the log: the session log and composer never lose height to telemetry, and rings, beams and pulses stop at the log's frame.
- **Don't** add a second display or body typeface; Saira's width axis carries the hierarchy, and mono is for code and routes only.
- **Don't** rebuild the chat as a conversation sidebar beside a centred transcript.
