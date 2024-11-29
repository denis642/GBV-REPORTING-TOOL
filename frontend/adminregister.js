document.getElementById('adminRegisterForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get input values
    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = 'admin'; // Set role as 'admin' for admin registration

    // Data object to be sent to the server
    const data = { firstName, lastName, email, password, role };

    try {
        // Sending request to the server
        const response = await fetch('http://localhost:3000/admin/register', { // Adjust the endpoint as needed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Handling the server's response
        if (response.ok) {
            const contentType = response.headers.get('Content-Type');

            // Check if the response contains JSON
            if (contentType && contentType.includes('application/json')) {
                const jsonResult = await response.json();
                alert(jsonResult.message || 'Admin registered successfully! Proceed to the login page.');
            } else {
                // If there's no JSON, show a generic success message
                alert('Admin registered successfully! Proceed to the login page.');
            }

            // Redirect to the admin login page after success
            window.location.href = 'http://127.0.0.1:5500/frontend/adminlogin.html'; // Full path to admin login page
        } else {
            // If registration fails, handle the error
            const errorData = await response.json();
            alert(errorData.message || 'Error registering admin');
        }
    } catch (error) {
        // Catch any network errors or unexpected issues
        console.error('Error:', error);
        alert('An error occurred while registering admin');
    }
});
