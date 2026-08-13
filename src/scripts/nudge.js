export function initNudge() {
  const nudge = document.getElementById("nudge");
  const pricing = document.getElementById("pricing");
  let hideTimer = null;
  let fired = false;
  try { fired = sessionStorage.getItem("jst-nudge") === "1"; } catch (error) { /* blocked */ }

  function dismiss() {
    if (!nudge) return;
    nudge.classList.remove("is-in");
    if (hideTimer) clearTimeout(hideTimer);
    try { sessionStorage.setItem("jst-nudge", "1"); } catch (error) { /* blocked */ }
  }
  function check() {
    if (fired || !nudge || !pricing) return;
    if (pricing.getBoundingClientRect().bottom > 0) return;
    fired = true;
    try { sessionStorage.setItem("jst-nudge", "1"); } catch (error) { /* blocked */ }
    nudge.classList.add("is-in");
    hideTimer = setTimeout(() => nudge.classList.remove("is-in"), 12000);
  }
  const closeButton = document.getElementById("nudge-close");
  if (closeButton) closeButton.addEventListener("click", dismiss);
  return { check };
}
