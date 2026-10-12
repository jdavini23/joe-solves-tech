export function initScrollEffects(reduceMotion, onFrameCallback) {
  const progress = document.getElementById("progress");
  let ticking = false;
  function onFrame() {
    ticking = false;
    if (onFrameCallback) onFrameCallback();
    const offset = window.pageYOffset;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(offset / max, 1) : 0) + ")";
  }
  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame, { passive: true });
  onFrame();
}
