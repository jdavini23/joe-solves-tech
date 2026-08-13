export function initScrollEffects(reduceMotion, onFrameCallback) {
  const progress = document.getElementById("progress");
  const parallax = reduceMotion ? null : document.querySelector("[data-parallax]");
  let ticking = false;
  function onFrame() {
    ticking = false;
    onFrameCallback();
    const offset = window.pageYOffset;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(offset / max, 1) : 0) + ")";
    if (parallax) {
      const shift = Math.max(Math.min(offset * 0.06, 48), -48);
      parallax.style.transform = "scale(1.08) translate3d(0," + shift + "px,0)";
    }
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
