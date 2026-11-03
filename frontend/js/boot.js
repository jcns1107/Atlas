// boot.js — the start-up sequence (once per browser session).
//
// The real core lifts out of its place to the middle of the screen, its rings
// and the Earth open from the centre outward while the boot log runs real
// checks (backend link, model list, chats), then it glides back home and the
// app draws in around it. Click or press any key to skip; Alt+Shift+B replays.
//
// The core is lifted into <body> at its full boot size (so the Earth's canvas
// stays sharp) and the glide home is one transform: move to where the slot is
// and scale down to the slot's size. Only `transform` animates, so it's smooth.
// Its home may be the presence panel or the small orb in the chat header.

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
 * Resolves when the core is home and the app has drawn in.
 */
export async function runBoot(steps, { core } = {}) {
  if (running) return;
  running = true;

  const html = document.documentElement;
  const boot = document.getElementById("boot");
  const logEl = document.getElementById("boot-log");
  const app = document.getElementById("app");
  const coreEl = document.getElementById("core");
  const slot = coreEl.parentElement;
  const rm = reduceMotion();

  logEl.innerHTML = "";
  boot.classList.remove("is-leaving");
  html.classList.remove("will-boot");
  html.classList.add("booting");
  core?.setState("booting", "Initialising");

  // Lift the core: fixed, centred at 40% of the height, at its boot size.
  const size = Math.round(Math.min(innerWidth, innerHeight * 0.75) * 0.6);
  const cx = innerWidth / 2;
  const cy = innerHeight * 0.4;
  Object.assign(coreEl.style, {
    position: "fixed",
    left: `${cx - size / 2}px`,
    top: `${cy - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    zIndex: "60",
  });
  coreEl.classList.add("is-lifted");
  document.body.append(coreEl);

  // The rings open from the centre outward, one after another.
  if (!rm) {
    coreEl.querySelectorAll(".layer, .core__bloom").forEach((el, i) =>
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

  // Hand-off: the overlay fades, the app draws in, and the core glides home.
  boot.classList.add("is-leaving");
  app.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--i", i + 2));
  app.classList.add("is-revealing");
  html.classList.remove("booting");
  window.removeEventListener("keydown", skip);

  const home = slot.getBoundingClientRect();
  const goHome = () => {
    slot.append(coreEl);
    coreEl.removeAttribute("style");
    coreEl.classList.remove("is-lifted");
  };
  if (rm || !home.width) {
    // Reduced motion, or no visible home: a short fade instead of the glide.
    await coreEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: rm ? 200 : 400, fill: "forwards" }).finished;
    goHome();
    coreEl.getAnimations().forEach((a) => a.cancel());
  } else {
    const dx = home.left + home.width / 2 - cx;
    const dy = home.top + home.height / 2 - cy;
    const scale = Math.min(home.width, home.height) / size;
    const glide = coreEl.animate(
      [{ transform: "none" }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }],
      { duration: 850, easing: EASE_IN_OUT, fill: "forwards" },
    );
    await glide.finished;
    goHome();
    glide.cancel();
  }

  await wait(rm ? 100 : 500);
  boot.classList.remove("is-leaving");
  app.classList.remove("is-revealing");
  running = false;
}
