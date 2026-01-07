// Load dashboard data
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication on page load
    const session = await initAuth();
    if (!session) return; // User was redirected to login

    const user = await getCurrentUser();
    if (!user) return;

    // Load user data from Supabase auth metadata
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || 'User';
    
    // Update header
    const headerH1 = document.querySelector('.header-section h1');
    if (headerH1) {
        headerH1.textContent = 'Hello, ' + firstName;
    }

    // Load recent bills from Supabase
    try {
        const { data: billHistory, error } = await supabaseClient
            .from('calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) throw error;

        const tbody = document.querySelector('table tbody');
        if (tbody) {
            tbody.innerHTML = '';

            if (billHistory && billHistory.length > 0) {
                billHistory.forEach((bill) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${bill.month}</td>
                        <td>${bill.power_consumption} KwH</td>
                        <td>${bill.power_consumption} KwH</td>
                        <td>₱${bill.cost_per_kwh}</td>
                        <td>₱${bill.result.toFixed(2)}</td>
                    `;
                    tbody.appendChild(row);
                });

                // Update last month bill
                const latestBill = billHistory[0];
                const billAmount = document.querySelector('.bill-amount');
                if (billAmount) {
                    billAmount.textContent = '₱' + latestBill.result.toFixed(2);
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No bills yet. Calculate your first bill!</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        const tbody = document.querySelector('table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Error loading bills.</td></tr>';
        }
    }
});

// View All button - already links to results.html
// Quick action cards - already linked to respective pages

// Logout handler
document.addEventListener('DOMContentLoaded', function() {
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(logoutLink => {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();
            await logout();
        });
    });
});
