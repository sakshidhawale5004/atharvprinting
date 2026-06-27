const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('wc-product-export-26-6-2026-1782464797347.csv');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(sheet);

const products = [];

data.forEach(row => {
    const id = row['ID'];
    const name = row['Name'];
    let price = row['Regular price'];
    
    if (price === undefined && row['Sale price'] !== undefined) {
        price = row['Sale price'];
    }

    if (id && name && price !== undefined) {
        let image = row['Images'] || '';
        // Some products might have multiple images separated by commas, get the first one
        if (image && typeof image === 'string' && image.includes(',')) {
            image = image.split(',')[0].trim();
        }
        
        products.push({
            id: id,
            name: name,
            price: parseFloat(price) || 0,
            image: image
        });
    }
});

const fileContent = `const atharvProducts = ${JSON.stringify(products, null, 4)};`;
fs.writeFileSync('products.js', fileContent);
console.log(`Generated products.js with ${products.length} products.`);
