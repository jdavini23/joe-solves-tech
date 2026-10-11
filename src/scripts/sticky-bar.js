// The bar duplicates the hero's own CTAs, so it waits until the hero leaves
// the viewport. Without JS (or IntersectionObserver) it stays CSS-only and
// always visible.
export function initStickyBar() {
  const bar = document.querySelector(".bar");
  const hero = document.querySelector(".hero");
  if (!bar || !hero) return;
  bar.classList.add("is-docked");
  new IntersectionObserver(([entry]) => {
    bar.classList.toggle("is-docked", entry.isIntersecting);
  }, { rootMargin: "0px 0px -35% 0px" }).observe(hero);
}
