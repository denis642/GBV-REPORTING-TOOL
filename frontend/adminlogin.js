document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = { email, password };

    try {
        const response = await fetch('http://localhost:3000/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        
        if (response.ok) {
            if (result.role === 'admin') {
                alert('Admin login successful!');
                console.log('Redirecting to admin dashboard...');
                setTimeout(() => {
                    window.location.href = 'http://127.0.0.1:5500/frontend/admin_dashboard.html'; // Redirect to dashboard
                }, 1000);
            } else {
                alert('Access denied: Admins only');
            }
        } else {
            alert(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
