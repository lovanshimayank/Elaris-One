import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Layers3,
  Save,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface ProfileForm {
  fullName: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  semester: string;
  section: string;
  github: string;
  linkedin: string;
  bio: string;
  skills: string;
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    semester: "",
    section: "",
    github: "",
    linkedin: "",
    bio: "",
    skills: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      college: user.college || "",
      branch: user.branch || "",
      year: user.year?.toString() || "",
      semester: user.semester?.toString() || "",
      section: user.section || "",
      github: user.github || "",
      linkedin: user.linkedin || "",
      bio: user.bio || "",
      skills: user.skills?.join(", ") || "",
    });
  }, [user]);

  if (!user) {
    return (
      <div className="page-container profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const role =
    user.role === "ADMIN"
      ? "Administrator"
      : user.role === "FACULTY"
        ? "Faculty"
        : "Student";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.patch("/users/me", {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        college: form.college.trim() || null,
        branch: form.branch.trim() || null,
        year: form.year ? Number(form.year) : null,
        semester: form.semester ? Number(form.semester) : null,
        section: form.section.trim() || null,
        github: form.github.trim() || null,
        linkedin: form.linkedin.trim() || null,
        bio: form.bio.trim() || null,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        setMessage("Profile updated successfully.");
      } else {
        throw new Error("Profile update failed.");
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container profile-page">
      {/* HEADER */}
      <div className="profile-page-header">
        <div>
          <span className="page-eyebrow">ACCOUNT</span>
          <h1>My Profile</h1>
          <p>
            Manage your identity, academic information and professional
            presence.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* PROFILE HERO */}
        <section className="profile-hero-card">
          <div className="profile-hero-avatar">
            {initials}
          </div>

          <div className="profile-hero-info">
            <h2>{user.fullName}</h2>

            <div className="profile-hero-meta">
              <span className="profile-role-badge">
                {role}
              </span>

              {user.branch && (
                <span>
                  {user.branch}
                </span>
              )}
            </div>

            <div className="profile-hero-email">
              <Mail size={14} />
              {user.email}
            </div>
          </div>

          <div className="profile-member-badge">
            <span>ELARIS-ONE</span>
            <strong>Member Profile</strong>
          </div>
        </section>

        {/* PERSONAL */}
        <section className="profile-section-card">
          <div className="profile-section-title">
            <div className="profile-title-icon">
              <User size={18} />
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Basic information associated with your account.</p>
            </div>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="profile-field">
              <label>Email</label>
              <div className="profile-readonly">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <small>Email cannot be changed here.</small>
            </div>

            <div className="profile-field">
              <label>Enrollment Number</label>
              <div className="profile-readonly">
                <BookOpen size={16} />
                <span>{user.enrollmentNumber || "Not available"}</span>
              </div>
            </div>

            <div className="profile-field">
              <label>Phone</label>
              <div className="profile-input-icon">
                <Phone size={16} />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ACADEMIC */}
        <section className="profile-section-card">
          <div className="profile-section-title">
            <div className="profile-title-icon">
              <GraduationCap size={18} />
            </div>

            <div>
              <h2>Academic Identity</h2>
              <p>
                Used to personalize resources and AI recommendations.
              </p>
            </div>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>College</label>
              <input
                name="college"
                value={form.college}
                onChange={handleChange}
                placeholder="Your college"
              />
            </div>

            <div className="profile-field">
              <label>Branch</label>
              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="e.g. CSE (AI & ML)"
              />
            </div>

            <div className="profile-field">
              <label>Year</label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="profile-field">
              <label>Semester</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
              >
                <option value="">Select semester</option>
                {Array.from({ length: 8 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Semester {index + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-field">
              <label>Section</label>
              <input
                name="section"
                value={form.section}
                onChange={handleChange}
                placeholder="e.g. A"
              />
            </div>
          </div>
        </section>

        {/* PROFESSIONAL */}
        <section className="profile-section-card">
          <div className="profile-section-title">
            <div className="profile-title-icon">
              <Layers3 size={18} />
            </div>

            <div>
              <h2>Professional Profile</h2>
              <p>Showcase your skills and professional links.</p>
            </div>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>GitHub</label>
              <div className="profile-input-icon">
                
                <input
                  name="github"
                  value={form.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div className="profile-field">
              <label>LinkedIn</label>
              <div className="profile-input-icon">
                
                <input
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="profile-field profile-field-full">
              <label>Skills</label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Java, Python, React, SQL"
              />
              <small>Separate multiple skills using commas.</small>
            </div>

            <div className="profile-field profile-field-full">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us a little about yourself..."
                rows={5}
              />
            </div>
          </div>
        </section>

        {/* SAVE BAR */}
        <section className="profile-save-card">
          <div>
            <strong>Keep your profile updated</strong>
            <span>
              Your information helps Elaris-One personalize your experience.
            </span>
          </div>

          <button
            type="submit"
            className="profile-save-button"
            disabled={saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </section>

        {message && (
          <div className="profile-feedback success">
            Ã¢Å“â€œ {message}
          </div>
        )}

        {error && (
          <div className="profile-feedback error">
            ! {error}
          </div>
        )}
      </form>
    </div>
  );
}