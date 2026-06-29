document.addEventListener('DOMContentLoaded', () => {
    
    // Login Logic
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const mainDashboard = document.getElementById('mainDashboard');
    const loginError = document.getElementById('loginError');

    // Check if already logged in (using sessionStorage)
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        if(loginScreen) loginScreen.style.display = 'none';
        if(mainDashboard) mainDashboard.style.display = 'block';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            // Default admin credentials
            if (user === 'admin' && pass === 'admin123') {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                loginScreen.style.display = 'none';
                mainDashboard.style.display = 'block';
                loginError.style.display = 'none';
            } else {
                loginError.style.display = 'block';
            }
        });
    }
    async function loadEnquiries() {
        try {
            const data = JSON.parse(localStorage.getItem('enquiries')) || [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error loading enquiries:", error);
            return [];
        }
    }

    async function renderDashboard() {
        const tbody = document.getElementById('enquiriesBody');
        const emptyState = document.getElementById('emptyState');
        const totalEnquiries = document.getElementById('totalEnquiries');
        const recentEnquiries = document.getElementById('recentEnquiries');
        
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
        
        const enquiries = await loadEnquiries();
        
        totalEnquiries.textContent = enquiries.length;
        
        // Calculate recent (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        let recentCount = 0;
        
        if (enquiries.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            recentEnquiries.textContent = '0';
            return;
        }
        
        emptyState.style.display = 'none';
        tbody.innerHTML = '';
        
        // Render in reverse chronological order
        const sortedEnquiries = [...enquiries].sort((a, b) => b.id - a.id);
        
        sortedEnquiries.forEach((enq, index) => {
            const enqDate = new Date(enq.id); // Using the timestamp ID
            if (enqDate >= sevenDaysAgo) {
                recentCount++;
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <span style="display: block; font-weight: 500;">${enq.date.split(',')[0]}</span>
                    <span style="font-size: 0.85rem; color: #64748b;">${enq.date.split(',')[1] || ''}</span>
                </td>
                <td>
                    <span style="font-weight: 600; color: #0f172a;">${enq.name}</span>
                </td>
                <td>
                    <span style="display: block; margin-bottom: 4px;"><i class="ri-phone-line" style="color: #64748b; margin-right: 5px;"></i>${enq.phone}</span>
                    <span style="font-size: 0.85rem;"><i class="ri-mail-line" style="color: #64748b; margin-right: 5px;"></i>${enq.email}</span>
                </td>
                <td><span class="amount-highlight">${enq.amount}</span></td>
                <td style="text-align: right;">
                    <button class="btn-danger delete-btn" data-id="${enq.id}">
                        <i class="ri-delete-bin-line" style="pointer-events: none;"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        recentEnquiries.textContent = recentCount;
        
        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("Are you sure you want to delete this enquiry?")) {
                    const idToDelete = parseInt(e.target.getAttribute('data-id'));
                    try {
                        let enquiries = JSON.parse(localStorage.getItem('enquiries')) || [];
                        enquiries = enquiries.filter(enq => enq.id !== idToDelete);
                        localStorage.setItem('enquiries', JSON.stringify(enquiries));
                        renderDashboard();
                    } catch (error) {
                        console.error('Error deleting:', error);
                    }
                }
            });
        });
    }

    async function downloadCSV() {
        const enquiries = await loadEnquiries();
        
        if (enquiries.length === 0) {
            alert("No data to download!");
            return;
        }
        
        // CSV Headers
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date & Time,Client Name,Phone Number,Email,Total Amount\n";
        
        // CSV Rows
        enquiries.forEach(function(rowArray) {
            let row = [
                `"${rowArray.date}"`,
                `"${rowArray.name}"`,
                `"${rowArray.phone}"`,
                `"${rowArray.email}"`,
                `"${rowArray.amount}"`
            ];
            csvContent += row.join(",") + "\n";
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    }

    // Event Listeners
    renderDashboard();
    
    const downloadBtn = document.getElementById('downloadCsvBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCSV);
    }
    
    const clearBtn = document.getElementById('clearDataBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if(confirm("WARNING: This will delete ALL enquiries permanently! Are you sure?")) {
                try {
                    localStorage.removeItem('enquiries');
                    renderDashboard();
                } catch (error) {
                    console.error('Error clearing data:', error);
                }
            }
        });
    }
});
