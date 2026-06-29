document.addEventListener('DOMContentLoaded', () => {
    
    function loadEnquiries() {
        const enquiriesRaw = localStorage.getItem('atharv_enquiries');
        let enquiries = [];
        
        if (enquiriesRaw) {
            try {
                enquiries = JSON.parse(enquiriesRaw);
            } catch(e) {
                console.error("Error parsing enquiries data", e);
            }
        }
        
        return enquiries;
    }

    function renderDashboard() {
        const enquiries = loadEnquiries();
        const tbody = document.getElementById('enquiriesBody');
        const emptyState = document.getElementById('emptyState');
        const totalEnquiries = document.getElementById('totalEnquiries');
        const recentEnquiries = document.getElementById('recentEnquiries');
        
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
                <td>${enq.date}</td>
                <td style="font-weight: bold;">${enq.name}</td>
                <td>${enq.phone}</td>
                <td>${enq.email}</td>
                <td style="color: navy; font-weight: bold;">${enq.amount}</td>
                <td>
                    <button class="btn btn-secondary delete-btn" data-id="${enq.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; border-color: var(--danger); color: var(--danger);">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        recentEnquiries.textContent = recentCount;
        
        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm("Are you sure you want to delete this enquiry?")) {
                    const idToDelete = parseInt(e.target.getAttribute('data-id'));
                    const filtered = enquiries.filter(enq => enq.id !== idToDelete);
                    localStorage.setItem('atharv_enquiries', JSON.stringify(filtered));
                    renderDashboard();
                }
            });
        });
    }

    function downloadCSV() {
        const enquiries = loadEnquiries();
        
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
        clearBtn.addEventListener('click', () => {
            if(confirm("WARNING: This will delete ALL enquiries permanently! Are you sure?")) {
                localStorage.removeItem('atharv_enquiries');
                renderDashboard();
            }
        });
    }
});
