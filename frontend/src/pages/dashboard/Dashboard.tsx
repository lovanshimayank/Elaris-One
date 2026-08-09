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

interface DashboardStats {
  notes: number;
  pyqs: number;
  opportunities: number;
  bookmarks: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    notes: 0,
    pyqs: 0,
    opportunities: 0,
    bookmarks: 0,
  });

  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentPYQs, setRecentPYQs] = useState<PYQ[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<
    Opportunity[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          notesResponse,
          pyqsResponse,
          opportunitiesResponse,
          bookmarksResponse,
        ] = await Promise.all([
          api.get("/notes"),
          api.get("/pyqs"),
          api.get("/opportunities"),
          api.get("/bookmarks"),
        ]);

        const notes = notesResponse.data?.data || [];
        const pyqs = pyqsResponse.data?.data || [];
        const opportunities = opportunitiesResponse.data?.data || [];
        const bookmarks = bookmarksResponse.data?.data || [];

        setStats({
          notes: notes.length,
          pyqs: pyqs.length,
          opportunities: opportunities.length,
          bookmarks: bookmarks.length,
        });

        setRecentNotes(notes.slice(0, 3));
        setRecentPYQs(pyqs.slice(0, 3));
        setRecentOpportunities(opportunities.slice(0, 3));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Unable to load some dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "Student";

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
      {/* HEADER */}
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

      {/* ERROR */}
      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* STATS */}
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
            <p>Previous year papers</p>
          </div>
        </Link>

        <Link to="/opportunities" className="stat-card">
          <span className="stat-icon">💼</span>
          <div>
            <h3>Opportunities</h3>
            <strong>
              {loading ? "..." : stats.opportunities}
            </strong>
            <p>Internships & jobs</p>
          </div>
        </Link>

        <Link to="/bookmarks" className="stat-card">
          <span className="stat-icon">🔖</span>
          <div>
            <h3>Bookmarks</h3>
            <strong>
              {loading ? "..." : stats.bookmarks}
            </strong>
            <p>Saved resources</p>
          </div>
        </Link>
      </section>

      {/* QUICK ACTIONS */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Quick Access</h2>
            <p>Jump directly to the resources you need.</p>
          </div>
        </div>

        <div className="quick-actions">
          <Link to="/notes" className="quick-action-card">
            <span>📚</span>
            <div>
              <strong>Browse Notes</strong>
              <p>Explore academic study material</p>
            </div>
          </Link>

          <Link to="/pyqs" className="quick-action-card">
            <span>📝</span>
            <div>
              <strong>Practice PYQs</strong>
              <p>Prepare using previous papers</p>
            </div>
          </Link>

          <Link
            to="/opportunities"
            className="quick-action-card"
          >
            <span>🚀</span>
            <div>
              <strong>Find Opportunities</strong>
              <p>Discover internships and jobs</p>
            </div>
          </Link>

          <Link to="/ai" className="quick-action-card ai-action">
            <span>🤖</span>
            <div>
              <strong>Ask Elaris AI</strong>
              <p>Get personalized academic help</p>
            </div>
          </Link>
        </div>
      </section>

      {/* RECENT RESOURCES */}
      <section className="dashboard-content-grid">
        {/* NOTES */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Notes</h2>
              <p>Latest study resources</p>
            </div>

            <Link to="/notes">View all →</Link>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              Loading notes...
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="dashboard-empty">
              No notes available yet.
            </div>
          ) : (
            <div className="resource-list">
              {recentNotes.map((note) => (
                <div className="resource-item" key={note.id}>
                  <div className="resource-icon">📚</div>

                  <div className="resource-info">
                    <strong>{note.title}</strong>

                    <span>
                      Semester {note.semester} • {note.branch}
                    </span>

                    {note.description && (
                      <p>
                        {note.description.length > 100
                          ? `${note.description.slice(0, 100)}...`
                          : note.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PYQS */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent PYQs</h2>
              <p>Practice previous papers</p>
            </div>

            <Link to="/pyqs">View all →</Link>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              Loading PYQs...
            </div>
          ) : recentPYQs.length === 0 ? (
            <div className="dashboard-empty">
              No PYQs available yet.
            </div>
          ) : (
            <div className="resource-list">
              {recentPYQs.map((pyq) => (
                <div className="resource-item" key={pyq.id}>
                  <div className="resource-icon">📝</div>

                  <div className="resource-info">
                    <strong>{pyq.title}</strong>

                    <span>
                      {pyq.year} • Semester {pyq.semester} •{" "}
                      {pyq.branch}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Latest Opportunities</h2>
            <p>Internships, jobs and other opportunities</p>
          </div>

          <Link to="/opportunities">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-empty">
            Loading opportunities...
          </div>
        ) : recentOpportunities.length === 0 ? (
          <div className="dashboard-empty">
            No opportunities available yet.
          </div>
        ) : (
          <div className="opportunity-grid">
            {recentOpportunities.map((opportunity) => (
              <div
                className="opportunity-card"
                key={opportunity.id}
              >
                <div className="opportunity-top">
                  <span className="opportunity-type">
                    {opportunity.type}
                  </span>
                </div>

                <h3>{opportunity.title}</h3>

                {opportunity.company && (
                  <p className="opportunity-company">
                    {opportunity.company}
                  </p>
                )}

                <p className="opportunity-deadline">
                  Deadline: {formatDate(opportunity.deadline)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI CTA */}
      <section className="dashboard-ai-banner">
        <div>
          <span className="ai-banner-icon">🤖</span>

          <div>
            <h2>Need help with your studies?</h2>

            <p>
              Ask Elaris AI about subjects, study plans,
              available campus resources, internships,
              programming concepts and more.
            </p>
          </div>
        </div>

        <Link to="/ai">
          Start chatting →
        </Link>
      </section>
    </div>
  );
}