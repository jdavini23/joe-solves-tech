import { SERVICES } from "./data.js";
import { escapeHTML } from "./escape.js";
import { currency } from "./pricing.js";
import { loadRecords } from "./store.js";

function summary(records) {
  const leads = records.filter((record) => record.stage === "lead").length;
  const quotes = records.filter((record) => record.stage === "quote").length;
  const jobs = records.filter((record) => record.stage === "job").length;
  const unpaid = records.filter((record) => record.stage === "invoice").reduce((total, record) => total + record.amount, 0);
  return `New leads: ${leads}\nQuotes waiting: ${quotes}\nJobs ready: ${jobs}\nUnpaid invoices: ${currency(unpaid)}\n\nStart with ${quotes ? "the quotes waiting for a reply" : leads ? "the new leads" : jobs ? "today's jobs" : "the unpaid invoices"}.`;
}

export function renderDashboard() {
  const records = loadRecords();
  const counts = { lead: 0, quote: 0, job: 0, invoice: 0 };
  records.forEach((record) => { if (counts[record.stage] !== undefined) counts[record.stage] += 1; });
  const pipeline = records.filter((record) => record.stage !== "paid").reduce((total, record) => total + record.amount, 0);
  document.getElementById("metric-grid").innerHTML = [
    ["New leads", counts.lead, "Ready to qualify"], ["Quotes waiting", counts.quote, "Needs follow-up"],
    ["Jobs ready", counts.job, "Next in line"], ["Open pipeline", currency(pipeline), "Across active work"],
  ].map(([label, value, note]) => `<article class="metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");

  const attention = records.filter((record) => ["lead", "quote", "invoice"].includes(record.stage)).slice(0, 5);
  document.getElementById("attention-list").innerHTML = attention.length ? attention.map((record) => `<div class="attention-item"><span class="attention-icon">${record.stage === "invoice" ? "$" : "!"}</span><p><strong>${escapeHTML(record.name)}</strong><br><small>${record.stage === "lead" ? "Qualify this new request" : record.stage === "quote" ? "Quote needs a reply" : `Invoice for ${currency(record.amount)} is unpaid`}</small></p></div>`).join("") : "<p>Nothing needs attention. Nice work.</p>";
  document.getElementById("activity-table").innerHTML = records.slice(0, 7).map((record) => `<tr><td><strong>${escapeHTML(record.name)}</strong><br><small>${SERVICES[record.service].label}</small></td><td><span class="stage">${record.stage}</span></td><td>${currency(record.amount)}</td></tr>`).join("");
  document.getElementById("daily-summary").textContent = summary(records);
}

export function initDashboard(showToast) {
  document.getElementById("copy-summary").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(document.getElementById("daily-summary").textContent); showToast("Daily summary copied"); }
    catch (error) { showToast("Select the summary to copy it"); }
  });
  window.addEventListener("northstar:update", renderDashboard);
}
