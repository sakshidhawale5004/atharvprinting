const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('Stationery Product List.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(sheet);

const products = [];

data.forEach(row => {
    // Look at columns: ID, Name, Regular price
    const id = row['ID'];
    const name = row['Name'];
    let price = row['Regular price'];
    
    // Some products might have "Sale price", but let's assume Regular price.
    // If Regular price is undefined, check if we can find any other price
    if (price === undefined && row['Sale price'] !== undefined) {
        price = row['Sale price'];
    }

    if (id && name && price !== undefined) {
        products.push({
            id: id,
            name: name,
            price: parseFloat(price) || 0
        });
    }
});

const fileContent = `const atharvProducts = ${JSON.stringify(products, null, 4)};`;
fs.writeFileSync('products.js', fileContent);
console.log(`Generated products.js with ${products.length} products.`);
