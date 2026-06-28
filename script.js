document.addEventListener('DOMContentLoaded', () => {
    
    // Set default dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    document.getElementById('quoteDate').valueAsDate = today;
    document.getElementById('validUntil').valueAsDate = nextWeek;

    const categories = [
        { name: "Binder Clip", url: "https://atharventerprises.co/product-category/binder-clip/" },
        { name: "Calculator", url: "https://atharventerprises.co/product-category/calculator/" },
        { name: "Envelop", url: "https://atharventerprises.co/product-category/envelop/" },
        { name: "File Folder", url: "https://atharventerprises.co/product-category/file-folder/" },
        { name: "Notebook", url: "https://atharventerprises.co/product-category/notebook/" },
        { name: "Pad", url: "https://atharventerprises.co/product-category/pad/" },
        { name: "Paper", url: "https://atharventerprises.co/product-category/paper/" },
        { name: "Pen and Pencil", url: "https://atharventerprises.co/product-category/pen-and-pencil/" },
        { name: "Register", url: "https://atharventerprises.co/product-category/register/" },
        { name: "Stationary", url: "https://atharventerprises.co/product-category/stationary/" },
        { name: "Tape", url: "https://atharventerprises.co/product-category/tape/" },
        { name: "Zip Lock Plastic Bags", url: "https://atharventerprises.co/product-category/zip-lock-plastic-bags/" }
    ];
    
    // Auto-close autocomplete lists when clicking outside
    document.addEventListener("click", function (e) {
        document.querySelectorAll('.autocomplete-list').forEach(list => {
            if (e.target !== list && !list.contains(e.target) && e.target !== list.previousElementSibling) {
                list.style.display = 'none';
            }
        });
    });

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
                    <div style="flex-grow: 1; position: relative;">
                        <input type="text" class="item-input desc-input" autocomplete="off" placeholder="Item description...">
                        <div class="autocomplete-list" style="display: none;"></div>
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

        function handleSelection(isCategory, data) {
            if (isCategory) {
                descInput.value = "Category: " + data.name;
                priceInput.value = "0.00";
                itemImage.style.display = 'none';
                itemImage.src = '';
                linkInput.value = data.url;
            } else {
                descInput.value = data.name;
                priceInput.value = data.price.toFixed(2);
                if (data.image) {
                    itemImage.src = data.image;
                    itemImage.style.display = 'block';
                } else {
                    itemImage.style.display = 'none';
                    itemImage.src = '';
                }
                const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                linkInput.value = 'https://atharventerprises.co/product/' + slug + '/';
            }
            updateLinkDisplay();
            updateRowTotal(tr);

            if (tr === itemsBody.lastElementChild) {
                addRow();
            }
        }

        const autocompleteList = tr.querySelector('.autocomplete-list');
        
        function updateAutocomplete() {
            const val = descInput.value.toLowerCase().trim();
            autocompleteList.innerHTML = '';
            
            if (!val) {
                autocompleteList.style.display = 'none';
                return;
            }

            let matches = 0;
            
            // 1. Search Categories first
            categories.forEach(cat => {
                if (cat.name.toLowerCase().includes(val) || (val === 'pen' && cat.name === 'Pen and Pencil')) {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-item category-item';
                    div.innerHTML = `📁 Category: <strong>${cat.name}</strong>`;
                    div.addEventListener('click', () => {
                        handleSelection(true, cat);
                        autocompleteList.style.display = 'none';
                    });
                    autocompleteList.appendChild(div);
                    matches++;
                }
            });

            // 2. Search Products
            if (typeof atharvProducts !== 'undefined') {
                for (let i = 0; i < atharvProducts.length; i++) {
                    const p = atharvProducts[i];
                    if (p.name.toLowerCase().includes(val)) {
                        const div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.textContent = p.name;
                        div.addEventListener('click', () => {
                            handleSelection(false, p);
                            autocompleteList.style.display = 'none';
                        });
                        autocompleteList.appendChild(div);
                        matches++;
                        if (matches >= 20) break; // Limit suggestions
                    }
                }
            }

            if (matches > 0) {
                autocompleteList.style.display = 'block';
            } else {
                autocompleteList.style.display = 'none';
            }
        }

        descInput.addEventListener('input', updateAutocomplete);
        descInput.addEventListener('focus', updateAutocomplete);

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
