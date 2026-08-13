import { ADDONS, FREQUENCIES, SERVICES } from "./data.js";
import { escapeHTML } from "./escape.js";
import { calculatePrice, currency } from "./pricing.js";
import { addRecord, nextId, updateRecord } from "./store.js";

const steps = {
  quote: { next: "job", label: "Accept quote", heading: "Quote ready", note: "The customer and job details were carried forward automatically." },
  job: { next: "invoice", label: "Mark job complete", heading: "Job scheduled", note: "The accepted quote became a job without another form." },
  invoice: { next: "paid", label: "Mark test invoice paid", heading: "Invoice created", note: "In production, this is where Stripe would create and send the invoice." },
  paid: { next: null, label: null, heading: "Payment recorded", note: "The dashboard now reflects the completed workflow." },
};

function log(message, label = "Done") {
  const list = document.getElementById("automation-log");
  if (list.children.length === 1 && !list.querySelector(".is-done")) list.innerHTML = "";
  list.insertAdjacentHTML("beforeend", `<li class="is-done"><span>${label}</span><p>${message}</p></li>`);
}

function setFlow(stage) {
  const active = stage === "lead" ? "request" : stage === "paid" ? "invoice" : stage;
  document.querySelectorAll("[data-flow]").forEach((element) => element.classList.toggle("is-current", element.dataset.flow === active));
}

function render(record) {
  const result = document.getElementById("workflow-result");
  const state = steps[record.stage] || steps.quote;
  const addOnText = record.addons.length ? record.addons.map((key) => ADDONS[key].label).join(", ") : "No add-ons";
  result.hidden = false;
  result.innerHTML = `<div class="result-grid"><div><p class="eyebrow">${record.id} · ${record.stage}</p><h2>${state.heading}</h2><p>${state.note}</p><p>${SERVICES[record.service].label} · ${record.bedrooms} bed · ${record.bathrooms} bath · ${FREQUENCIES[record.frequency].label} · ${addOnText}</p></div><div class="result-price"><span>Current value</span><strong>${currency(record.amount)}</strong></div></div>${state.next ? `<div class="result-actions"><button class="button button--primary" type="button" data-advance="${record.id}" data-next="${state.next}">${state.label}</button><button class="button button--secondary" type="button" data-dashboard>See dashboard</button></div>` : `<div class="result-actions"><button class="button button--secondary" type="button" data-dashboard>See updated dashboard</button></div>`}`;
  setFlow(record.stage);
}

export function initIntake(navigate) {
  const form = document.getElementById("intake-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const record = {
      id: nextId(), name: formData.get("name").trim(), email: formData.get("email").trim(),
      service: formData.get("service"), frequency: formData.get("frequency"),
      bedrooms: Number(formData.get("bedrooms")), bathrooms: Number(formData.get("bathrooms")),
      addons: formData.getAll("addons"), notes: formData.get("notes").trim(), stage: "quote", createdAt: new Date().toISOString(),
    };
    record.amount = calculatePrice(record);
    addRecord(record);
    document.getElementById("automation-log").innerHTML = "";
    log(`Created lead ${record.id} for ${escapeHTML(record.name)}.`);
    log(`Calculated ${SERVICES[record.service].label.toLowerCase()} from the approved price sheet.`);
    log(`Generated a ${currency(record.amount)} quote using the same customer record.`);
    render(record);
    resultScroll();
  });

  document.getElementById("workflow-result").addEventListener("click", (event) => {
    const advance = event.target.closest("[data-advance]");
    if (advance) {
      const stage = advance.dataset.next;
      const record = updateRecord(advance.dataset.advance, { stage, paid: stage === "paid" });
      const messages = { job: "Accepted the quote and created the job.", invoice: "Completed the job and generated a test invoice.", paid: "Recorded the test payment and closed the workflow." };
      log(messages[stage]);
      render(record);
    }
    if (event.target.closest("[data-dashboard]")) navigate("dashboard");
  });
}

function resultScroll() {
  document.getElementById("workflow-result").scrollIntoView({ behavior: "smooth", block: "center" });
}
