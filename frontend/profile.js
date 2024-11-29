document.addEventListener('DOMContentLoaded', function () {
    // Fetch admin profile details
    fetch('http://localhost:3000/admin/profile')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            return response.json();
        })
        .then(admin => {
            const profileInfo = document.getElementById('profile-info');
            profileInfo.innerHTML = `
                <div class="profile-item">
                    <label>First Name:</label>
                    <span>${admin.first_name}</span>
                </div>
                <div class="profile-item">
                    <label>Last Name:</label>
                    <span>${admin.last_name}</span>
                </div>
                <div class="profile-item">
                    <label>Email:</label>
                    <span>${admin.email}</span>
                </div>
                <div class="profile-item">
                    <label>Role:</label>
                    <span>${admin.role}</span>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error fetching admin profile:', error);
            alert('Error fetching admin profile');
        });
});
