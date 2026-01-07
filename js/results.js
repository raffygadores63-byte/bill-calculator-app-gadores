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
        // Fetch calculations from Supabase
        const { data, error } = await supabaseClient
            .from('calculations')
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
        data.forEach(calc => {
            const row = tableBody.insertRow();
            const date = new Date(calc.created_at).toLocaleString();
            
            row.innerHTML = `
                <td>${calc.month}</td>
                <td>${calc.power_consumption} KwH</td>
                <td>₱${calc.cost_per_kwh}</td>
                <td>₱${calc.result.toFixed(2)}</td>
                <td>${date}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn" data-id="${calc.id}">View</button>
                        <button class="delete-btn" data-id="${calc.id}">🗑️</button>
                    </div>
                </td>
            `;
        });

        // Find and display highest bill
        if (data.length > 0) {
            const highestBill = data.reduce((prev, current) => 
                (parseFloat(prev.result) > parseFloat(current.result)) ? prev : current
            );
            const highestBillCard = document.querySelector('.bill-card-amount');
            if (highestBillCard) {
                highestBillCard.textContent = '₱' + highestBill.result.toFixed(2) + ' ' + highestBill.month;
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
Month: ${bill.month}
Power Consumption: ${bill.power_consumption} KwH
Cost per kWh: ₱${bill.cost_per_kwh}
Result: ₱${bill.result.toFixed(2)}
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
                            .from('calculations')
                            .delete()
                            .eq('id', id)
                            .eq('user_id', user.id);

                        if (error) throw error;

                        alert('Bill record deleted successfully!');
                        loadCalculations(); // Reload table
                    } catch (error) {
                        console.error('Error deleting calculation:', error);
                        alert('Failed to delete calculation. Please try again.');
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
