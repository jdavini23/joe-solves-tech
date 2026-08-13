export function initNavigation(nav) {
  const sentinel = document.getElementById("top-sentinel");
  new IntersectionObserver((entries) => {
    nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
  }, { threshold: 0 }).observe(sentinel);

  const links = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const visible = [];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const index = visible.indexOf(entry.target);
      if (entry.isIntersecting && index === -1) visible.push(entry.target);
      if (!entry.isIntersecting && index !== -1) visible.splice(index, 1);
    });
    const current = sections.filter((section) => visible.includes(section)).pop();
    links.forEach((link) => link.classList.toggle(
      "is-active",
      Boolean(current) && link.getAttribute("href") === "#" + current.id,
    ));
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
