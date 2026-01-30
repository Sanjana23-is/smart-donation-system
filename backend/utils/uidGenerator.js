// utils/uidGenerator.js

function generateUID(type, inventoryId) {
  return `INV-${type}-${inventoryId}`;
}

function generateBarcode(inventoryId) {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BC-${inventoryId}-${rand}`;
}

module.exports = { generateUID, generateBarcode };
