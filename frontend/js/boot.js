// boot.js — the start-up sequence (once per browser session).
//
// The real core flies to the middle of the screen, its rings open from the
// centre outward while the boot log runs real checks (backend link, model
// list, modules), then it glides back to its place and the panels draw in
// around it. Click or press any key to skip; Alt+Shift+B replays it.
//
// The "fly to the middle and back" trick is called FLIP: measure where the
// element really is, move it somewhere else with a transform, then animate the
// transform back to nothing. Only `transform` moves, so it stays smooth.

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const EASE_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

export function hasBooted() {
  try {
    return sessionStorage.getItem("atlas.booted") === "1";
  } catch {
    return true; // storage blocked: don't trap the user in a boot every load
  }
}

let running = false;

/**
 * steps: [{ label, run: async () => ({ text, tone: "ok" | "warn" }) }]
 * core:  the controller from core.js (its readout says "Atlas · Initialising")
 * Resolves when the core is home and the panels have drawn in.
 */
export async function runBoot(steps, { core } = {}) {
  if (running) return;
  running = true;

  const html = document.documentElement;
  const boot = document.getElementById("boot");
  const logEl = document.getElementById("boot-log");
  const hud = document.getElementById("hud");
  const coreEl = document.getElementById("core");
  const rm = reduceMotion();

  document.body.classList.remove("systems-open");
  logEl.innerHTML = "";
  boot.classList.remove("is-leaving");
  html.classList.remove("will-boot");
  html.classList.add("booting");
  core?.setState("booting", "Initialising");

  // FLIP, step 1: where does the core live? Step 2: move it to the centre.
  coreEl.style.transform = "";
  const home = coreEl.getBoundingClientRect();
  const size = Math.min(innerWidth, innerHeight * 0.75) * 0.6;
  const scale = size / home.width;
  const dx = innerWidth / 2 - (home.left + home.width / 2);
  const dy = innerHeight * 0.4 - (home.top + home.height / 2);
  const centred = `translate(${dx}px, ${dy}px) scale(${scale})`;
  coreEl.style.transform = centred;

  // The rings open from the centre outward, one after another.
  if (!rm) {
    coreEl.querySelectorAll(".layer, .core__bloom, .core__readout").forEach((el, i) =>
      el.animate(
        [
          { clipPath: "circle(0% at 50% 50%)", opacity: 0 },
          { clipPath: "circle(75% at 50% 50%)", opacity: 1 },
        ],
        { duration: 1000, delay: 90 * i, easing: EASE_EXPO, fill: "backwards" },
      ),
    );
  }

  let skipped = false;
  const skip = () => {
    skipped = true;
  };
  window.addEventListener("keydown", skip, { once: true });
  boot.addEventListener("click", skip, { once: true });

  // Pace the lines so they can be read, unless skipped or reduced motion.
  const pace = (ms) => (skipped || rm ? Promise.resolve() : wait(ms));

  await pace(900);
  for (const step of steps) {
    const li = document.createElement("li");
    li.innerHTML = "<span></span><span>…</span>";
    // "Backend link · /api/health": the name is set in HUD capitals, the route
    // keeps its real (case-sensitive) spelling.
    const [name, path] = step.label.split(" · ");
    li.firstChild.textContent = name;
    if (path) {
      const code = document.createElement("code");
      code.textContent = path;
      li.firstChild.append(" ", code);
    }
    logEl.append(li);
    const [result] = await Promise.all([step.run(), pace(280)]);
    li.lastChild.textContent = result.text;
    li.lastChild.className = result.tone ?? "ok";
  }
  await pace(600);

  try {
    sessionStorage.setItem("atlas.booted", "1");
  } catch {
    /* fine */
  }

  // Hand-off: the overlay fades, the core glides home (FLIP step 3), and the
  // panels draw in around it, staggered.
  boot.classList.add("is-leaving");
  coreEl.style.zIndex = "60"; // stay above the fading overlay while moving
  coreEl.style.transform = "";
  if (!rm) {
    coreEl.animate([{ transform: centred }, { transform: "none" }], {
      duration: 850,
      easing: EASE_IN_OUT,
    });
  }
  hud.querySelectorAll("[data-reveal], .nodes, .beam").forEach((el, i) =>
    el.style.setProperty("--i", i + 4),
  );
  hud.classList.add("is-revealing");
  html.classList.remove("booting");
  window.removeEventListener("keydown", skip);

  await wait(rm ? 300 : 1500);
  boot.classList.remove("is-leaving");
  coreEl.style.zIndex = "";
  hud.classList.remove("is-revealing");
  running = false;
}
