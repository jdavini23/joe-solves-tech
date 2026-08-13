function runCounter(element) {
  const original = element.textContent.trim();
  const parts = original.match(/^([\d,.]+)(.*)$/);
  if (!parts) return;
  const target = Number.parseFloat(parts[1].replace(/,/g, ""));
  const tail = parts[2];
  if (!Number.isFinite(target)) return;

  let started = null;
  const duration = 1100;
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    element.textContent = original;
  }
  function loop(time) {
    if (done) return;
    if (started === null) started = time;
    const progress = Math.min((time - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    if (progress < 1) {
      element.textContent = Math.round(target * eased).toLocaleString() + tail;
      requestAnimationFrame(loop);
    } else {
      finish();
    }
  }
  setTimeout(finish, duration + 400);
  requestAnimationFrame(loop);
}

export function initCounters(reduceMotion) {
  if (reduceMotion) return;
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      currentObserver.unobserve(entry.target);
      runCounter(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((element) => observer.observe(element));
}
