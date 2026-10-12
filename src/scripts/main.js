import { initAnalytics } from "./analytics.js";
import { initNavigation } from "./navigation.js";
import { initReveals } from "./reveals.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
initAnalytics();
if (!("IntersectionObserver" in window)) {
  document.documentElement.classList.remove("js");
} else {
  initNavigation(document.getElementById("nav"));
  initReveals(reduceMotion);
}
