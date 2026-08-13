import { estimateRange, currency } from "./pricing.js";
import { escapeHTML } from "./escape.js";
import { addRecord, nextId } from "./store.js";

const flow = [
  { key: "service", prompt: "What kind of cleaning do you need?", options: [["Standard clean", "standard"], ["Deep clean", "deep"], ["Move-out clean", "moveout"]] },
  { key: "bedrooms", prompt: "How many bedrooms should we include?", type: "number" },
  { key: "bathrooms", prompt: "And how many bathrooms? You can enter 1.5 or 2.5.", type: "number" },
  { key: "frequency", prompt: "Is this one time or recurring?", options: [["One time", "once"], ["Weekly", "weekly"], ["Every two weeks", "biweekly"], ["Monthly", "monthly"]] },
  { key: "name", prompt: "Got it. What name should we put on the estimate?" },
  { key: "email", prompt: "Last step: what email should the owner use to follow up?", type: "email" },
];

let state;

function message(text, role = "bot") {
  const container = document.getElementById("chat-messages");
  const content = role === "user" ? escapeHTML(text) : text;
  container.insertAdjacentHTML("beforeend", `<div class="message message--${role}">${content}</div>`);
  container.scrollTop = container.scrollHeight;
}

function options(items, choose) {
  const container = document.getElementById("chat-messages");
  const element = document.createElement("div");
  element.className = "quick-replies";
  items.forEach(([label, value]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => { element.remove(); message(label, "user"); choose(value); });
    element.append(button);
  });
  container.append(element);
  container.scrollTop = container.scrollHeight;
}

function ask() {
  const step = flow[state.index];
  if (!step) return finish();
  message(step.prompt);
  const input = document.getElementById("chat-input");
  input.type = step.type === "email" ? "email" : step.type === "number" ? "number" : "text";
  input.step = step.key === "bathrooms" ? ".5" : "1";
  input.placeholder = step.type === "number" ? "Enter a number…" : "Type your answer…";
  if (step.options) {
    input.disabled = true;
    options(step.options, (value) => answer(value));
  } else {
    input.disabled = false;
    input.focus();
  }
}

function answer(value) {
  const step = flow[state.index];
  if (step.type === "number" && (!Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 8)) {
    message("Please enter a number between 1 and 8.");
    return;
  }
  if (step.type === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
    message("That email looks incomplete. Please try again.");
    return;
  }
  state.answers[step.key] = step.type === "number" ? Number(value) : value;
  state.index += 1;
  ask();
}

function finish() {
  const record = { id: nextId(), ...state.answers, addons: [], amount: 0, stage: "lead", source: "assistant", createdAt: new Date().toISOString() };
  const range = estimateRange(record);
  record.amount = Math.round((range.low + range.high) / 2);
  addRecord(record);
  message(`Based on Northstar's demo price sheet, your nonbinding estimate is <strong>${currency(range.low)}–${currency(range.high)}</strong>. Final pricing depends on the home's condition and availability.`);
  message(`I saved this as lead <strong>${record.id}</strong> for the owner to review. No appointment has been promised.`);
  document.getElementById("chat-input").disabled = true;
}

export function restartAssistant() {
  state = { index: 0, answers: {} };
  document.getElementById("chat-messages").innerHTML = "";
  document.getElementById("chat-input").disabled = false;
  message("Hi! I can estimate a home cleaning using Northstar's approved demo price sheet. This is not a binding quote.");
  ask();
}

export function initAssistant() {
  document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("chat-input");
    const value = input.value.trim();
    if (!value || input.disabled) return;
    message(value, "user");
    input.value = "";
    answer(value);
  });
  document.getElementById("restart-chat").addEventListener("click", restartAssistant);
  restartAssistant();
}
