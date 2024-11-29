document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(form);

        try {
            const response = await fetch('http://localhost:3000/report', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json(); // Parse the response as JSON

                // Alert the user that the report has been successfully submitted
                alert('Report has been successfully submitted.');

                // Redirect the user to the report dashboard
                window.location.href = '/report_dashboard'; // Replace with your dashboard URL
            } else {
                const errorResponse = await response.json();
                alert(errorResponse.message || 'Failed to submit report.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your report. Please try again.');
        }
    });
});
