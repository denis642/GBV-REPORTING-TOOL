// Select the login form
const loginForm = document.querySelector('form');

// Add an event listener for form submission
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Create an object to hold the data
    const loginData = {
        email: email,
        password: password,
    };

    console.log('Login Data:', loginData); // Log login data to the console

    try {
        // Send a POST request to the backend API
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        // Check if the response is OK
        if (response.ok) {
            const data = await response.json(); // Parse the response JSON
            const userId = data.userId; // Get user ID from the response (adjust if backend sends it differently)

            console.log('User successfully logged in');
            alert('Login successful! Redirecting to your dashboard...'); // Show success message

            // Store user ID in localStorage
            localStorage.setItem('userId', userId);

            // Redirect after a short delay to allow the user to read the message
            setTimeout(() => {
                window.location.href = './report_dashboard.html'; // Redirect to dashboard
            }, 1000); // Redirect after 1 second
        } else {
            // Handle errors
            const errorData = await response.json();
            console.error('Error:', errorData.message);
            alert('Login failed: ' + errorData.message); // Show the error message
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in. Please try again.'); // Show a generic error message
    }
});
