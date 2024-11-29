document.addEventListener("DOMContentLoaded", function() {
    const caseId = getCaseIdFromUrl();

    if (!caseId) {
        console.error('No case ID found in URL.');
        return;
    }

    // Load initial case details
    loadCaseDetails(caseId);

    // Attach event listeners for admin actions
    document.getElementById('updateStatus').addEventListener('click', () => updateStatus(caseId));
    document.getElementById('markResolved').addEventListener('click', () => markAsResolved(caseId));
    document.getElementById('deleteCase').addEventListener('click', () => deleteCase(caseId));
    document.getElementById('saveComment').addEventListener('click', () => addComment(caseId));
});

// Helper function to get case ID from URL
function getCaseIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('caseId');
}

// Function to fetch case details
function loadCaseDetails(caseId) {
    fetch(`http://localhost:3000/admin/case-details/${caseId}`)
        .then(response => response.json())
        .then(caseDetails => {
            const caseDetailsDiv = document.getElementById('caseDetails');
            caseDetailsDiv.innerHTML = `
                <h2>Case ID: ${caseDetails.id}</h2>
                <p><strong>Name of the Affected:</strong> ${caseDetails.name}</p>
                <p><strong>Description:</strong> ${caseDetails.description}</p>
                <p><strong>Date Reported:</strong> ${caseDetails.created_at}</p>
                <p><strong>County:</strong> ${caseDetails.county}</p>
                <p><strong>Incident Type:</strong> ${caseDetails.incident_type}</p>
                <p><strong>Gender:</strong> ${caseDetails.gender}</p>
                <p><strong>Age:</strong> ${caseDetails.age}</p>
                <p><strong>Incident Date:</strong> ${caseDetails.incident_date}</p>
            `;
        });
}

// Update the status of the case
function updateStatus(caseId) {
    const newStatus = prompt("Enter new status (e.g., Investigating, In Progress):");

    if (newStatus) {
        fetch(`http://localhost:3000/admin/case-details/${caseId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        })
        .then(response => response.json())
        .then(data => {
            alert('Status updated successfully.');

            // Log the table and its rows to inspect
            const casesTable = document.querySelector('#casesTable');
            console.log(casesTable); // Check if table is found
            
            const tableRows = document.querySelectorAll('#casesTable tbody tr');
            console.log(tableRows); // Check the rows in the table

            // Find the status cell
            const statusCell = document.querySelector(`#casesTable tbody tr td:nth-child(4)`);
            if (statusCell) {
                statusCell.textContent = newStatus; // Update the status cell
            } else {
                console.error('Status cell not found in the table.');
            }
        })
        .catch(error => {
            console.error('Error updating status:', error);
        });
    }
}


// Mark the case as resolved
function markAsResolved(caseId) {
    if (confirm('Are you sure you want to mark this case as resolved?')) {
        fetch(`http://localhost:3000/admin/case-details/${caseId}/resolve`, {
            method: 'PUT',
        })
        .then(response => response.json())
        .then(data => {
            alert('Case marked as resolved.');
        })
        .catch(error => {
            console.error('Error marking case as resolved:', error);
        });
    }
}

// Delete the case
function deleteCase(caseId) {
    const url = `http://localhost:3000/admin/case-details/${caseId}`;
    console.log('Requesting DELETE for:', url);

    if (confirm('Are you sure you want to delete this case? This action is irreversible.')) {
        fetch(url, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert('Case deleted successfully.');

                // Remove the case row dynamically from the table
                const caseRow = document.getElementById(`case-row-${caseId}`);
                if (caseRow) {
                    caseRow.remove();
                }

                // Redirect to the admin dashboard
                console.log('Redirecting to admin dashboard...');
                window.location.href = '/frontend/admin_dashboard.html';
            })
            .catch(error => {
                console.error('Error deleting case:', error);
            });
    }
}


// Add an admin comment to the case
function addComment(caseId) {
    const comment = document.getElementById('adminComments').value;

    if (comment) {
        fetch(`http://localhost:3000/admin/case-details/${caseId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment }),
        })
        .then(response => response.json())
        .then(data => {
            alert('Comment added successfully.');
            document.getElementById('adminComments').value = ''; // Clear the comment box
        })
        .catch(error => {
            console.error('Error adding comment:', error);
        });
    } else {
        alert('Please enter a comment before saving.');
    }
}
