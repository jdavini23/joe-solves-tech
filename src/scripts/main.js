import { initCounters } from "./counters.js";
import { initNavigation } from "./navigation.js";
import { initNudge } from "./nudge.js";
import { initReveals } from "./reveals.js";
import { initScrollEffects } from "./scroll-effects.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!("IntersectionObserver" in window)) {
  document.documentElement.classList.remove("js");
} else {
  initNavigation(document.getElementById("nav"));
  initReveals(reduceMotion);
  initCounters(reduceMotion);
  const nudge = initNudge();
  initScrollEffects(reduceMotion, nudge.check);
}
