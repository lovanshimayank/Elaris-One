import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const fullName = user?.fullName || "Student";
  const role = user?.role || "Student";
  const email = user?.email || "Not available";

  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const skills: string[] = user?.skills ?? [];

  return (
    <div className="page-container profile-page">
      {/* HEADER */}
      <div className="page-header">
        <span className="page-eyebrow">ACCOUNT</span>

        <h1>My Profile</h1>

        <p>
          Manage your academic identity and personal information.
        </p>
      </div>

      {/* PROFILE CARD */}
      <section className="profile-main-card">
        {/* LEFT */}
        <div className="profile-summary">
          <div className="profile-avatar-large">
            {initials}
          </div>

          <h2>{fullName}</h2>

          <span className="profile-role">
            {role}
          </span>

          <div className="profile-divider" />

          <p className="profile-member">
            Elaris-One Member
          </p>
        </div>

        {/* RIGHT */}
        <div className="profile-academic">
          <div className="profile-section-heading">
            <h2>Academic Identity</h2>

            <p>
              Your information across the Elaris-One platform.
            </p>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail-card">
              <span>Email</span>
              <strong>{email}</strong>
            </div>

            <div className="profile-detail-card">
              <span>Role</span>
              <strong>{role}</strong>
            </div>

            <div className="profile-detail-card">
              <span>College</span>
              <strong>
                {user?.college || "Not available"}
              </strong>
            </div>

            <div className="profile-detail-card">
              <span>Branch</span>
              <strong>
                {user?.branch || "Not available"}
              </strong>
            </div>

            <div className="profile-detail-card">
              <span>Year</span>
              <strong>
                {user?.year || "Not available"}
              </strong>
            </div>

            <div className="profile-detail-card">
              <span>Semester</span>
              <strong>
                {user?.semester || "Not available"}
              </strong>
            </div>
          </div>

          {/* SKILLS */}
          <div className="profile-skills-section">
            <span className="profile-skills-title">
              SKILLS
            </span>

            {skills.length > 0 ? (
              <div className="profile-skills">
                {skills.map((skill: string, index: number) => (
                  <span
                    className="profile-skill-tag"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-no-skills">
                No skills added yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}