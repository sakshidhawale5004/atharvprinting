const XLSX = require('xlsx');

const workbook = XLSX.readFile('Stationery Product List.xlsx', { cellHyperlinks: true });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log("Headers:", data[1]);

// Let's check for hyperlinks
let hasHyperlinks = false;
for (const cellAddress in sheet) {
  if (cellAddress[0] === '!') continue;
  const cell = sheet[cellAddress];
  if (cell && cell.l && cell.l.Target) {
    console.log(`Cell ${cellAddress} has link:`, cell.l.Target);
    hasHyperlinks = true;
    break;
  }
}

if (!hasHyperlinks) {
    console.log("No hyperlinks found in the cells.");
}

console.log("Row 2:", data[2]);
console.log("Number of columns in Row 2:", data[2].length);
