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
      {/* Hero */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-badge">
            <span className="dashboard-hero-dot" />
            ELARIS-ONE • CAMPUS INTELLIGENCE
          </div>

          <h1>
            Welcome back, <span>{firstName}</span>
          </h1>

          <p>
            Your academic resources, exam preparation and career opportunities
            are all in one place.
          </p>

          <div className="dashboard-hero-actions">
            <Link to="/ai" className="dashboard-ai-button">
              <span className="dashboard-ai-icon">✦</span>
              Ask Elaris AI
              <span className="dashboard-ai-arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-hero-decoration">
          <div className="dashboard-orbit dashboard-orbit-one" />
          <div className="dashboard-orbit dashboard-orbit-two" />
          <div className="dashboard-orbit dashboard-orbit-three" />

          <div className="dashboard-hero-mark">
            <span>E</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="dashboard-stats-grid">
        <Link to="/notes" className="dashboard-stat-card dashboard-stat-notes">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">▤</div>
            <span className="dashboard-stat-arrow">↗</span>
          </div>

          <div className="dashboard-stat-number">
            {loading ? "..." : stats.notes}
          </div>

          <div className="dashboard-stat-title">Study Notes</div>
          <div className="dashboard-stat-description">
            Academic resources
          </div>
        </Link>

        <Link to="/pyqs" className="dashboard-stat-card dashboard-stat-pyqs">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">▣</div>
            <span className="dashboard-stat-arrow">↗</span>
          </div>

          <div className="dashboard-stat-number">
            {loading ? "..." : stats.pyqs}
          </div>

          <div className="dashboard-stat-title">Previous Papers</div>
          <div className="dashboard-stat-description">
            Exam preparation
          </div>
        </Link>

        <Link
          to="/opportunities"
          className="dashboard-stat-card dashboard-stat-opportunities"
        >
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">↗</div>
            <span className="dashboard-stat-arrow">↗</span>
          </div>

          <div className="dashboard-stat-number">
            {loading ? "..." : stats.opportunities}
          </div>

          <div className="dashboard-stat-title">Opportunities</div>
          <div className="dashboard-stat-description">
            Internships & jobs
          </div>
        </Link>

        <div className="dashboard-stat-card dashboard-stat-community">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">◎</div>
            <span className="dashboard-stat-live">LIVE</span>
          </div>

          <div className="dashboard-stat-number">
            {loading ? "..." : stats.students}
          </div>

          <div className="dashboard-stat-title">Students</div>
          <div className="dashboard-stat-description">
            Elaris-One community
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="dashboard-main-grid">
        {/* Notes */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div className="dashboard-panel-heading">
              <div className="dashboard-panel-icon dashboard-panel-icon-notes">
                ▤
              </div>

              <div>
                <p className="dashboard-panel-eyebrow">STUDY MATERIAL</p>
                <h2>Latest Notes</h2>
              </div>
            </div>

            <Link to="/notes" className="dashboard-view-all">
              View all <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="dashboard-state">
              <div className="dashboard-spinner" />
              <span>Loading notes...</span>
            </div>
          ) : dashboard?.latestNotes?.length ? (
            <div className="dashboard-resource-list">
              {dashboard.latestNotes.slice(0, 3).map((note, index) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="dashboard-resource"
                >
                  <div className="dashboard-resource-number">
                    0{index + 1}
                  </div>

                  <div className="dashboard-resource-main">
                    <h3>{note.title}</h3>

                    <div className="dashboard-resource-meta">
                      <span>Semester {note.semester}</span>
                      <span className="dashboard-meta-dot" />
                      <span>{note.branch}</span>
                    </div>
                  </div>

                  <div className="dashboard-resource-date">
                    {formatDate(note.createdAt)}
                  </div>

                  <span className="dashboard-resource-arrow">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-state dashboard-state-empty">
              <div className="dashboard-empty-icon">▤</div>
              <strong>No notes available yet</strong>
              <span>Study resources will appear here.</span>
            </div>
          )}
        </div>

        {/* PYQs */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div className="dashboard-panel-heading">
              <div className="dashboard-panel-icon dashboard-panel-icon-pyqs">
                ▣
              </div>

              <div>
                <p className="dashboard-panel-eyebrow">EXAM PREPARATION</p>
                <h2>Latest PYQs</h2>
              </div>
            </div>

            <Link to="/pyqs" className="dashboard-view-all">
              View all <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="dashboard-state">
              <div className="dashboard-spinner" />
              <span>Loading PYQs...</span>
            </div>
          ) : dashboard?.latestPYQs?.length ? (
            <div className="dashboard-resource-list">
              {dashboard.latestPYQs.slice(0, 3).map((pyq, index) => (
                <Link
                  key={pyq.id}
                  to={`/pyqs/${pyq.id}`}
                  className="dashboard-resource"
                >
                  <div className="dashboard-resource-number">
                    0{index + 1}
                  </div>

                  <div className="dashboard-resource-main">
                    <h3>{pyq.title}</h3>

                    <div className="dashboard-resource-meta">
                      <span>Semester {pyq.semester}</span>
                      <span className="dashboard-meta-dot" />
                      <span>{pyq.branch}</span>
                      <span className="dashboard-meta-dot" />
                      <span>{pyq.year}</span>
                    </div>
                  </div>

                  <div className="dashboard-resource-date">
                    {formatDate(pyq.createdAt)}
                  </div>

                  <span className="dashboard-resource-arrow">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-state dashboard-state-empty">
              <div className="dashboard-empty-icon">▣</div>
              <strong>No PYQs available yet</strong>
              <span>Previous papers will appear here.</span>
            </div>
          )}
        </div>
      </section>

      {/* Opportunities */}
      <section className="dashboard-panel dashboard-opportunities-panel">
        <div className="dashboard-panel-header">
          <div className="dashboard-panel-heading">
            <div className="dashboard-panel-icon dashboard-panel-icon-opportunities">
              ↗
            </div>

            <div>
              <p className="dashboard-panel-eyebrow">CAREER</p>
              <h2>Latest Opportunities</h2>
            </div>
          </div>

          <Link to="/opportunities" className="dashboard-view-all">
            Explore opportunities <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-state">
            <div className="dashboard-spinner" />
            <span>Loading opportunities...</span>
          </div>
        ) : dashboard?.latestOpportunities?.length ? (
          <div className="dashboard-opportunity-list">
            {dashboard.latestOpportunities.slice(0, 3).map((opportunity) => (
              <Link
                key={opportunity.id}
                to="/opportunities"
                className="dashboard-opportunity"
              >
                <div className="dashboard-opportunity-icon">↗</div>

                <div className="dashboard-opportunity-main">
                  <h3>{opportunity.title}</h3>

                  <div className="dashboard-opportunity-meta">
                    <span>
                      {opportunity.company || "Opportunity"}
                    </span>

                    <span className="dashboard-meta-dot" />

                    <span>{opportunity.type}</span>
                  </div>
                </div>

                <div className="dashboard-opportunity-deadline">
                  <span>DEADLINE</span>
                  <strong>{formatDate(opportunity.deadline)}</strong>
                </div>

                <span className="dashboard-resource-arrow">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="dashboard-state dashboard-state-empty">
            <div className="dashboard-empty-icon">↗</div>
            <strong>No opportunities available yet</strong>
            <span>Career opportunities will appear here.</span>
          </div>
        )}
      </section>
    </div>
  );
}