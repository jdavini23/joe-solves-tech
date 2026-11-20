function sendEvent(name, parameters) {
  if (typeof window.gtag === "function") window.gtag("event", name, parameters);
}

function mailtoSubject(href) {
  const query = href.split("?")[1];
  if (!query) return "";
  return new URLSearchParams(query).get("subject") || "";
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

    if (href.startsWith("mailto:")) {
      sendEvent("contact_cta_click", { ...parameters, mailto_subject: mailtoSubject(href) });
      sendEvent("generate_lead", { ...parameters, method: "email" });
    }
  });
}
