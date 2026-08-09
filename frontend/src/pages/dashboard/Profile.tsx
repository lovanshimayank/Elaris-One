export default function Profile() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="eyebrow">MY PROFILE</span>
          <h1>Profile</h1>
          <p>Manage your academic identity and personal information.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">M</div>

        <div className="profile-info">
          <h2>Mayank Lovanshi</h2>
          <p>Student</p>

          <div className="profile-details">
            <div>
              <span>Email</span>
              <strong>mayank@example.com</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>Student</strong>
            </div>

            <div>
              <span>Platform</span>
              <strong>Elaris-One</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}