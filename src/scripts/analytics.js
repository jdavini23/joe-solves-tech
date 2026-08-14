function sendEvent(name, parameters) {
  if (typeof window.gtag === "function") window.gtag("event", name, parameters);
}

function linkLocation(link) {
  const container = link.closest("section, header, nav, footer, aside");
  return container?.id || container?.tagName.toLowerCase() || "page";
}

export function initAnalytics() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    const parameters = {
      link_text: link.textContent.trim().replace(/\s+/g, " ").slice(0, 100),
      link_location: linkLocation(link)
    };

    if (href === "#contact") sendEvent("contact_cta_click", parameters);
    if (href.startsWith("mailto:")) sendEvent("generate_lead", { ...parameters, method: "email" });
  });
}
