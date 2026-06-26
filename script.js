document.addEventListener('DOMContentLoaded', () => {
    
    // Set default dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    document.getElementById('quoteDate').valueAsDate = today;
    document.getElementById('validUntil').valueAsDate = nextWeek;

    // Populate Datalist with products
    const productList = document.getElementById('productList');
    if (typeof atharvProducts !== 'undefined') {
        atharvProducts.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.name;
            productList.appendChild(option);
        });
    }

    const itemsBody = document.getElementById('itemsBody');
    const addRowBtn = document.getElementById('addRowBtn');
    const printBtn = document.getElementById('printBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Add initial row
    addRow();

    // Event Listeners
    addRowBtn.addEventListener('click', addRow);
    
    printBtn.addEventListener('click', () => {
        window.print();
    });

    resetBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear all data?")) {
            itemsBody.innerHTML = '';
            addRow();
            document.querySelectorAll('.input-field').forEach(el => el.value = '');
            document.getElementById('subtotal').textContent = '₹0.00';
            document.getElementById('discountAmount').textContent = '-₹0.00';
            document.getElementById('taxAmount').textContent = '₹0.00';
            document.getElementById('grandTotal').textContent = '₹0.00';
        }
    });

    document.getElementById('discountRate').addEventListener('input', calculateTotals);
    document.getElementById('taxRate').addEventListener('input', calculateTotals);

    function addRow() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="text" class="item-input desc-input" list="productList" placeholder="Item description...">
            </td>
            <td>
                <input type="number" class="item-input qty-input" value="1" min="1">
            </td>
            <td>
                <input type="number" class="item-input price-input" value="0.00" min="0" step="0.01">
            </td>
            <td>
                <span class="item-total">₹0.00</span>
            </td>
            <td class="col-action">
                <button class="btn-icon delete-btn"><i class="ri-delete-bin-line"></i></button>
            </td>
        `;

        // Attach events to new row
        const descInput = tr.querySelector('.desc-input');
        const qtyInput = tr.querySelector('.qty-input');
        const priceInput = tr.querySelector('.price-input');
        const deleteBtn = tr.querySelector('.delete-btn');

        descInput.addEventListener('change', (e) => {
            const selected = atharvProducts.find(p => p.name === e.target.value);
            if(selected) {
                priceInput.value = selected.price.toFixed(2);
                updateRowTotal(tr);
            }
        });

        qtyInput.addEventListener('input', () => updateRowTotal(tr));
        priceInput.addEventListener('input', () => updateRowTotal(tr));

        deleteBtn.addEventListener('click', () => {
            if(itemsBody.children.length > 1) {
                tr.style.opacity = '0';
                setTimeout(() => {
                    tr.remove();
                    calculateTotals();
                }, 300);
            }
        });

        itemsBody.appendChild(tr);
        calculateTotals();
    }

    function updateRowTotal(row) {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const total = qty * price;
        row.querySelector('.item-total').textContent = '₹' + total.toFixed(2);
        calculateTotals();
    }

    function calculateTotals() {
        let subtotal = 0;
        document.querySelectorAll('.item-total').forEach(el => {
            subtotal += parseFloat(el.textContent.replace('₹', '')) || 0;
        });

        const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;
        const discountAmount = subtotal * (discountRate / 100);
        
        const afterDiscount = subtotal - discountAmount;
        
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const taxAmount = afterDiscount * (taxRate / 100);

        const grandTotal = afterDiscount + taxAmount;

        document.getElementById('subtotal').textContent = '₹' + subtotal.toFixed(2);
        document.getElementById('discountAmount').textContent = '-₹' + discountAmount.toFixed(2);
        document.getElementById('taxAmount').textContent = '₹' + taxAmount.toFixed(2);
        document.getElementById('grandTotal').textContent = '₹' + grandTotal.toFixed(2);
    }
});
