import { SEED_RECORDS } from "./data.js";

const KEY = "northstar-demo-v1";
function cloneSeed() { return JSON.parse(JSON.stringify(SEED_RECORDS)); }

export function loadRecords() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : cloneSeed();
  } catch (error) { return cloneSeed(); }
}

export function saveRecords(records) {
  try { localStorage.setItem(KEY, JSON.stringify(records)); } catch (error) { /* private mode */ }
  window.dispatchEvent(new CustomEvent("northstar:update"));
}

export function addRecord(record) {
  const records = loadRecords();
  records.unshift(record);
  saveRecords(records);
  return record;
}

export function updateRecord(id, updates) {
  const records = loadRecords().map((record) => record.id === id ? { ...record, ...updates } : record);
  saveRecords(records);
  return records.find((record) => record.id === id);
}

export function resetRecords() { saveRecords(cloneSeed()); }

export function nextId() {
  const highest = loadRecords().reduce((max, record) => Math.max(max, Number(record.id.replace(/\D/g, "")) || 0), 1042);
  return `NS-${highest + 1}`;
}
