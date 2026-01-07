// Enhanced Bill Calculator with Supabase
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication on page load
    const session = await initAuth();
    if (!session) return; // User was redirected to login

    const form = document.getElementById('billCalculatorForm');
    const resultCard = document.querySelector('.result-card');
    const saveBtn = document.querySelector('.save-result-btn');
    let currentCalculation = null;

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const inputs = document.querySelectorAll('.calculator-card input');
            const month = inputs[0].value.trim();
            const power_consumption = parseFloat(inputs[1].value);
            const cost_per_kwh = parseFloat(inputs[2].value);

            // Validation
            if (!month || !power_consumption || !cost_per_kwh) {
                alert('Please fill in all fields');
                return;
            }

            if (power_consumption <= 0 || cost_per_kwh <= 0) {
                alert('Please enter valid positive numbers');
                return;
            }

            // Calculate result
            const result_value = parseFloat((power_consumption * cost_per_kwh).toFixed(2));
            
            // Update display and show result card
            document.querySelector('.result-amount').textContent = '₱' + result_value.toFixed(2);
            if (resultCard) {
                resultCard.classList.add('show');
            }

            // Store current calculation
            currentCalculation = {
                month: month,
                power_consumption: power_consumption,
                cost_per_kwh: cost_per_kwh,
                result: result_value
            };
        });
    }

    // Real-time calculation as user types
    document.querySelectorAll('.calculator-card input').forEach(input => {
        input.addEventListener('input', function() {
            const inputs = document.querySelectorAll('.calculator-card input');
            const power_consumption = parseFloat(inputs[1].value) || 0;
            const cost_per_kwh = parseFloat(inputs[2].value) || 0;

            if (power_consumption > 0 && cost_per_kwh > 0) {
                const result_value = (power_consumption * cost_per_kwh).toFixed(2);
                document.querySelector('.result-amount').textContent = '₱' + result_value;
                if (resultCard) {
                    resultCard.classList.add('show');
                }
            }
        });
    });

    // Save Result button handler
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            if (!currentCalculation) {
                alert('Please calculate a bill first');
                return;
            }

            // Get current user
            const user = await getCurrentUser();
            if (!user) {
                alert('You must be logged in to save calculations');
                return;
            }

            // Show loading state
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            try {
                // Save to Supabase
                const { data, error } = await supabaseClient
                    .from('calculations')
                    .insert([
                        {
                            user_id: user.id,
                            month: currentCalculation.month,
                            power_consumption: currentCalculation.power_consumption,
                            cost_per_kwh: currentCalculation.cost_per_kwh,
                            result: currentCalculation.result
                        }
                    ])
                    .select();

                if (error) {
                    console.error('Error saving:', error);
                    alert('Failed to save: ' + error.message);
                    return;
                }

                console.log('Saved successfully:', data);
                alert('Bill saved to results!');
                
                // Clear current calculation
                currentCalculation = null;
                
                // Optionally redirect to results page
                // window.location.href = 'results_page.html';
            } catch (error) {
                console.error('Error saving calculation:', error);
                alert('Failed to save calculation. Please try again.');
            } finally {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }
        });
    }
});
