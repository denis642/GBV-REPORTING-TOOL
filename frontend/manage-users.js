// Fetch and display all users
// Fetch and display all users
function fetchUsers() {
    fetch('http://localhost:3000/admin/users')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        })
        .then(users => {
            const usersTable = document.getElementById('users-table');
            usersTable.innerHTML = ''; // Clear existing rows
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td> <!-- Display the full name here -->
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                `;
                usersTable.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}


// Add a new user
// Add a new user
document.getElementById('add-user-form').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;  // Capture password

    fetch('http://localhost:3000/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, role, password }),  // Include password in the request body
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add user');
            alert('User added successfully!');
            fetchUsers(); // Refresh the user list
        })
        .catch(error => console.error('Error adding user:', error));
});


// Delete a user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`http://localhost:3000/admin/users/${userId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete user');
                alert('User deleted successfully!');
                fetchUsers(); // Refresh the user list
            })
            .catch(error => console.error('Error deleting user:', error));
    }
}

// Fetch users on page load
window.onload = fetchUsers;
