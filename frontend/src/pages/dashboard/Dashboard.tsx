import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Note {
  id: string;
  title: string;
  description?: string;
  semester: number;
  branch: string;
  createdAt: string;
}

interface PYQ {
  id: string;
  title: string;
  semester: number;
  branch: string;
  year: number;
  createdAt: string;
}

interface Opportunity {
  id: string;
  title: string;
  company?: string;
  type: string;
  deadline?: string;
}

interface DashboardData {
  user?: {
    id: string;
    fullName: string;
    enrollmentNumber: string;
    role: string;
    branch?: string;
    semester?: number;
  };
  stats: {
    notes: number;
    pyqs: number;
    opportunities: number;
    students: number;
  };
  latestNotes: Note[];
  latestPYQs: PYQ[];
  latestOpportunities: Opportunity[];
}

export default function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard");

        if (!response.data?.success) {
          throw new Error("Dashboard request failed");
        }

        setDashboard(response.data.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const displayUser = dashboard?.user || user;

  const firstName =
    displayUser?.fullName?.trim().split(/\s+/)[0] || "Student";

  const stats = dashboard?.stats || {
    notes: 0,
    pyqs: 0,
    opportunities: 0,
    students: 0,
  };

  const formatDate = (date?: string) => {
    if (!date) return "No deadline";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "No deadline";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ELARIS-ONE</p>

          <h1>
            Welcome back, {firstName} 👋
          </h1>

          <p className="dashboard-subtitle">
            Everything you need for your academic journey, in one place.
          </p>
        </div>

        <Link to="/ai" className="dashboard-ai-button">
          🤖 Ask Elaris AI
        </Link>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <Link to="/notes" className="stat-card">
          <span className="stat-icon">📚</span>
          <div>
            <h3>Notes</h3>
            <strong>{loading ? "..." : stats.notes}</strong>
            <p>Study resources</p>
          </div>
        </Link>

        <Link to="/pyqs" className="stat-card">
          <span className="stat-icon">📝</span>
          <div>
            <h3>PYQs</h3>
            <strong>{loading ? "..." : stats.pyqs}</strong>
            <p>Previous papers</p>
          </div>
        </Link>

        <Link to="/opportunities" className="stat-card">
          <span className="stat-icon">🚀</span>
          <div>
            <h3>Opportunities</h3>
            <strong>{loading ? "..." : stats.opportunities}</strong>
            <p>Internships & jobs</p>
          </div>
        </Link>

        <div className="stat-card">
          <span className="stat-icon">🎓</span>
          <div>
            <h3>Students</h3>
            <strong>{loading ? "..." : stats.students}</strong>
            <p>Elaris-One community</p>
          </div>
        </div>
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">STUDY MATERIAL</p>
              <h2>Latest Notes</h2>
            </div>

            <Link to="/notes">View all</Link>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              Loading notes...
            </div>
          ) : dashboard?.latestNotes?.length ? (
            <div className="dashboard-list">
              {dashboard.latestNotes.slice(0, 3).map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="dashboard-list-item"
                >
                  <div>
                    <h3>{note.title}</h3>
                    <p>
                      Semester {note.semester} • {note.branch}
                    </p>
                  </div>

                  <span>
                    {formatDate(note.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              No notes available yet.
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">EXAM PREPARATION</p>
              <h2>Latest PYQs</h2>
            </div>

            <Link to="/pyqs">View all</Link>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              Loading PYQs...
            </div>
          ) : dashboard?.latestPYQs?.length ? (
            <div className="dashboard-list">
              {dashboard.latestPYQs.slice(0, 3).map((pyq) => (
                <Link
                  key={pyq.id}
                  to={`/pyqs/${pyq.id}`}
                  className="dashboard-list-item"
                >
                  <div>
                    <h3>{pyq.title}</h3>
                    <p>
                      Semester {pyq.semester} • {pyq.branch} • {pyq.year}
                    </p>
                  </div>

                  <span>
                    {formatDate(pyq.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              No PYQs available yet.
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-section dashboard-opportunities">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">CAREER</p>
            <h2>Latest Opportunities</h2>
          </div>

          <Link to="/opportunities">View all</Link>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            Loading opportunities...
          </div>
        ) : dashboard?.latestOpportunities?.length ? (
          <div className="dashboard-list">
            {dashboard.latestOpportunities.slice(0, 3).map((opportunity) => (
              <Link
                key={opportunity.id}
                to="/opportunities"
                className="dashboard-list-item"
              >
                <div>
                  <h3>{opportunity.title}</h3>
                  <p>
                    {opportunity.company || "Opportunity"} •{" "}
                    {opportunity.type}
                  </p>
                </div>

                <span>
                  {formatDate(opportunity.deadline)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            No opportunities available yet.
          </div>
        )}
      </section>
    </div>
  );
}
