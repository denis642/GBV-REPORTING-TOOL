// Select the registration form
const registerForm = document.querySelector('form');

// Add an event listener for form submission
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    // Create an object to hold the data
    const userData = {
        email: email,
        first_name: firstName, // Updated
        last_name: lastName,   // Updated
        phone: phone,
        password: password,
    };

    console.log('User Data:', userData); // Log user data to the console

    try {
        // Send a POST request to the backend API
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        // Check if the response is OK
        if (response.ok) {
            console.log('User successfully registered');
            alert('User successfully registered! Redirecting to login page...'); // Show success message
            
            // Redirect after a short delay to allow the user to read the message
            setTimeout(() => {
                window.location.href = './login.html'; // Redirect to login page
            }, 2000); // Redirect after 2 seconds
        } else {
            // Handle errors
            const errorData = await response.json();
            console.error('Error:', errorData.message);
            alert('Registration failed: ' + errorData.message); // Show the error message
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while registering. Please try again.'); // Show a generic error message
    }
});
