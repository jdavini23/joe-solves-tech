import { initAssistant, restartAssistant } from "./assistant.js";
import { initDashboard, renderDashboard } from "./dashboard.js";
import { initIntake } from "./intake.js";
import { resetRecords } from "./store.js";

const views = ["intake", "dashboard", "assistant"];
function currentView() { return views.includes(location.hash.slice(1)) ? location.hash.slice(1) : "intake"; }
function navigate(view) { location.hash = view; renderView(); }
function renderView() {
  const active = currentView();
  document.querySelectorAll("[data-view]").forEach((view) => { view.hidden = view.dataset.view !== active; });
  document.querySelectorAll("[data-view-link]").forEach((link) => link.classList.toggle("is-active", link.dataset.viewLink === active));
  if (active === "dashboard") renderDashboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2200);
}

initIntake(navigate);
initDashboard(showToast);
initAssistant();
document.getElementById("reset-demo").addEventListener("click", () => {
  resetRecords();
  restartAssistant();
  renderDashboard();
  showToast("Demo data reset");
});
window.addEventListener("hashchange", renderView);
renderView();
