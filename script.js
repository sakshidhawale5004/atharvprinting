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
    const printBtn = document.getElementById('printBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Add initial row
    addRow();

    // Event Listeners
    
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
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <img class="item-image" src="" alt="Product Image" style="width: 50px; height: 50px; object-fit: cover; display: none; border-radius: 4px; border: 1px solid #ddd; margin-top: 5px;">
                    <div style="flex-grow: 1;">
                        <input type="text" class="item-input desc-input" list="productList" placeholder="Item description...">
                        <input type="url" class="item-input link-input" placeholder="Product URL (Optional)" style="margin-top: 4px; font-size: 0.85em; padding: 6px;">
                        <a href="#" class="item-link-display" target="_blank" style="display: none; margin-top: 4px; font-size: 0.85em; color: var(--primary-color); text-decoration: none;"><i class="ri-link"></i> View Product</a>
                    </div>
                </div>
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
        const linkInput = tr.querySelector('.link-input');
        const linkDisplay = tr.querySelector('.item-link-display');
        const itemImage = tr.querySelector('.item-image');
        const qtyInput = tr.querySelector('.qty-input');
        const priceInput = tr.querySelector('.price-input');
        const deleteBtn = tr.querySelector('.delete-btn');

        function updateLinkDisplay() {
            if(linkInput.value.trim() !== '') {
                linkDisplay.href = linkInput.value.trim();
                linkDisplay.innerHTML = `<i class="ri-link"></i> ${linkInput.value.trim().replace(/^https?:\/\//, '')}`;
                linkDisplay.style.display = 'inline-block';
            } else {
                linkDisplay.style.display = 'none';
            }
        }

        linkInput.addEventListener('input', updateLinkDisplay);

        descInput.addEventListener('change', (e) => {
            const selected = atharvProducts.find(p => p.name === e.target.value);
            if(selected) {
                priceInput.value = selected.price.toFixed(2);
                
                if (selected.image) {
                    itemImage.src = selected.image;
                    itemImage.style.display = 'block';
                } else {
                    itemImage.style.display = 'none';
                    itemImage.src = '';
                }
                
                // Auto-generate link slug
                const slug = selected.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                linkInput.value = 'https://atharventerprises.co/product/' + slug + '/';
                updateLinkDisplay();
                
                updateRowTotal(tr);

                // Auto-add next row if this is the last row
                if (tr === itemsBody.lastElementChild) {
                    addRow();
                }
            } else {
                itemImage.style.display = 'none';
                itemImage.src = '';
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
