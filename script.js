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
                        <input type="text" class="item-input desc-input" autocomplete="off" placeholder="Add your items">
                        <div class="autocomplete-list" style="display: none;"></div>
                        <input type="hidden" class="item-input link-input">
                        <a href="#" class="item-link-display" target="_blank" style="display: none; margin-top: 4px; font-size: 0.85em; color: var(--primary-color); text-decoration: none;"><i class="ri-link"></i> View Product</a>
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <button class="btn-icon qty-minus" style="width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center;">-</button>
                    <input type="number" class="item-input qty-input" value="1" min="1" style="width: 50px; text-align: center; padding: 4px;">
                    <button class="btn-icon qty-plus" style="width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center;">+</button>
                </div>
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
        const qtyMinus = tr.querySelector('.qty-minus');
        const qtyPlus = tr.querySelector('.qty-plus');
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
        
        qtyMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if(val > 1) {
                qtyInput.value = val - 1;
                updateRowTotal(tr);
            }
        });
        
        qtyPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 0;
            qtyInput.value = val + 1;
            updateRowTotal(tr);
        });

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
    
    // Add Row Button
    const addRowBtn = document.getElementById('addRowBtn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', () => {
            addRow();
        });
    }

    // Populate Sidebar
    const sidebarProductList = document.getElementById('sidebarProductList');
    const sidebarSearch = document.getElementById('sidebarSearch');
    const productCount = document.getElementById('productCount');

    function renderSidebarProducts(products) {
        if (!sidebarProductList) return;
        sidebarProductList.innerHTML = '';
        if (productCount) {
            productCount.textContent = products.length;
        }
        
        products.forEach(p => {
            const div = document.createElement('div');
            div.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;';
            
            // Allow clicking the product in sidebar to add it to the table
            div.onclick = () => {
                // Find an empty row or create a new one
                let emptyRow = null;
                const rows = itemsBody.querySelectorAll('tr');
                for (let row of rows) {
                    if (!row.querySelector('.desc-input').value) {
                        emptyRow = row;
                        break;
                    }
                }
                if (!emptyRow) {
                    addRow();
                    emptyRow = itemsBody.lastElementChild;
                }
                const descInput = emptyRow.querySelector('.desc-input');
                const priceInput = emptyRow.querySelector('.price-input');
                const itemImage = emptyRow.querySelector('.item-image');
                const linkInput = emptyRow.querySelector('.link-input');
                
                descInput.value = p.name;
                priceInput.value = p.price.toFixed(2);
                if (p.image && itemImage) {
                    itemImage.src = p.image;
                    itemImage.style.display = 'block';
                }
                const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                if(linkInput) {
                    linkInput.value = 'https://atharventerprises.co/product/' + slug + '/';
                }
                
                // Trigger events to update displays
                descInput.dispatchEvent(new Event('input'));
                if (linkInput) linkInput.dispatchEvent(new Event('input'));
                updateRowTotal(emptyRow);
                
                if (emptyRow === itemsBody.lastElementChild) {
                    addRow();
                }
            };
            
            div.innerHTML = `
                <img src="${p.image || 'https://via.placeholder.com/40'}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                <div style="flex-grow: 1;">
                    <div style="font-weight: 500; font-size: 0.9rem; line-height: 1.2;">${p.name}</div>
                    <div style="color: var(--primary); font-weight: bold; font-size: 0.85rem; margin-top: 4px;">₹${p.price.toFixed(2)}</div>
                </div>
                <button class="btn-icon" style="width: 24px; height: 24px; background: var(--primary); color: white;"><i class="ri-add-line"></i></button>
            `;
            sidebarProductList.appendChild(div);
        });
    }

    if (typeof atharvProducts !== 'undefined') {
        renderSidebarProducts(atharvProducts);
        
        if (sidebarSearch) {
            sidebarSearch.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = atharvProducts.filter(p => p.name.toLowerCase().includes(term));
                renderSidebarProducts(filtered);
            });
        }
    }
    
    // Enquire Now Button Logic
    const enquireBtn = document.getElementById('enquireBtn');
    if (enquireBtn) {
        enquireBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const clientName = document.getElementById('clientName').value || 'Unknown Client';
            const clientPhone = document.getElementById('clientPhone').value || 'N/A';
            const clientEmail = document.getElementById('clientEmail').value || 'N/A';
            const grandTotal = document.getElementById('grandTotal').textContent;
            
            const enquiry = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                name: clientName,
                phone: clientPhone,
                email: clientEmail,
                amount: grandTotal
            };
            
            let enquiries = JSON.parse(localStorage.getItem('atharv_enquiries')) || [];
            enquiries.push(enquiry);
            localStorage.setItem('atharv_enquiries', JSON.stringify(enquiries));
            
            // Redirect to WhatsApp
            let waText = `Hello, I have an enquiry from ${clientName}. Total Amount: ${grandTotal}.`;
            window.open(`https://wa.me/919819976369?text=${encodeURIComponent(waText)}`, '_blank');
        });
    }
});
