// Load calculations from Supabase
async function loadCalculations() {
    // Get current user
    const user = await getCurrentUser();
    if (!user) return;

    const tableBody = document.getElementById('billsTableBody');
    if (!tableBody) return;
    
    // Show loading
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading...</td></tr>';
    
    try {
        // Fetch bills from Supabase
        const { data, error } = await supabaseClient
            .from('bills')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading:', error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading bills. Please refresh the page.</td></tr>';
            return;
        }

        // Clear loading message
        tableBody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No bills saved yet. Calculate and save a bill to see it here.</td></tr>';
            
            // Clear highest bill display
            const highestBillCard = document.querySelector('.bill-card-amount');
            if (highestBillCard) {
                highestBillCard.textContent = '₱0.00';
            }
            return;
        }

        // Display data in table
        data.forEach(bill => {
            const row = tableBody.insertRow();
            const date = new Date(bill.created_at).toLocaleString();
            
            row.innerHTML = `
                <td>${bill.period}</td>
                <td>${bill.consumption} KwH</td>
                <td>₱${bill.rate}</td>
                <td>₱${bill.total.toFixed(2)}</td>
                <td>${date}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn" data-id="${bill.id}">View</button>
                        <button class="delete-btn" data-id="${bill.id}">🗑️</button>
                    </div>
                </td>
            `;
        });

        // Find and display highest bill
        if (data.length > 0) {
            const highestBill = data.reduce((prev, current) => 
                (parseFloat(prev.total) > parseFloat(current.total)) ? prev : current
            );
            const highestBillCard = document.querySelector('.bill-card-amount');
            if (highestBillCard) {
                highestBillCard.textContent = '₱' + highestBill.total.toFixed(2) + ' ' + highestBill.period;
            }
        }

        // Attach event listeners to View buttons
        document.querySelectorAll('.action-btn').forEach((btn) => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const bill = data.find(b => b.id == id);
                if (bill) {
                    const date = new Date(bill.created_at).toLocaleString();
                    const billInfo = `
Month: ${bill.period}
Power Consumption: ${bill.consumption} KwH
Cost per kWh: ₱${bill.rate}
Result: ₱${bill.total.toFixed(2)}
Date Saved: ${date}
                    `;
                    alert('Bill Details:\n' + billInfo);
                }
            });
        });

        // Attach event listeners to Delete buttons
        document.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', async function() {
                if (confirm('Are you sure you want to delete this bill record?')) {
                    const id = this.getAttribute('data-id');
                    
                    try {
                        const { error } = await supabaseClient
                            .from('bills')
                            .delete()
                            .eq('id', id)
                            .eq('user_id', user.id);

                        if (error) throw error;

                        alert('Bill record deleted successfully!');
                        loadCalculations(); // Reload table
                    } catch (error) {
                        console.error('Error deleting bill:', error);
                        alert('Failed to delete bill. Please try again.');
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error loading calculations:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading bills. Please refresh the page.</td></tr>';
    }
}

// Load on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication on page load
    const session = await initAuth();
    if (session) {
        // User is authenticated, load calculations
        loadCalculations();
    }
});
