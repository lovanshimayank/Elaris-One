import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import BookmarkButton from "../../components/bookmarks/BookmarkButton";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  company?: string | null;
  location?: string | null;
  type: "INTERNSHIP" | "JOB" | "HACKATHON" | "EVENT";
  applyLink?: string | null;
  deadline?: string | null;
  isActive: boolean;
  createdAt: string;
}

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/opportunities");
        setOpportunities(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch opportunities:", err);
        setError("Unable to load opportunities.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const filteredOpportunities = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return opportunities.filter((opportunity) => {
      const matchesSearch =
        !searchText ||
        opportunity.title.toLowerCase().includes(searchText) ||
        opportunity.description.toLowerCase().includes(searchText) ||
        opportunity.company?.toLowerCase().includes(searchText) ||
        opportunity.location?.toLowerCase().includes(searchText);

      const matchesType =
        type === "ALL" || opportunity.type === type;

      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" && opportunity.isActive) ||
        (status === "CLOSED" && !opportunity.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [opportunities, search, type, status]);

  const clearFilters = () => {
    setSearch("");
    setType("ALL");
    setStatus("ALL");
  };

  const getDeadlineInfo = (deadline?: string | null) => {
    if (!deadline) {
      return {
        text: "No deadline specified",
        color: "#64748b",
        background: "#f1f5f9",
      };
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (deadlineDate < now) {
      return {
        text: "Deadline passed",
        color: "#991b1b",
        background: "#fee2e2",
      };
    }

    const daysLeft = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 3) {
      return {
        text: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
        color: "#92400e",
        background: "#fef3c7",
      };
    }

    return {
      text: `${daysLeft} days left`,
      color: "#166534",
      background: "#dcfce7",
    };
  };

  if (loading) {
    return (
      <div className="opportunities-page">
        <div className="opportunities-loading">
          <div className="opportunities-loading-spinner" />
          <h2>Loading Opportunities</h2>
          <p>Finding the latest opportunities for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="opportunities-page">
      {/* HEADER */}
      <div className="opportunities-header">
        <div>
          <span className="opportunities-eyebrow">
            CAREER & CAMPUS OPPORTUNITIES
          </span>

          <h1>Opportunities</h1>

          <p>
            Discover internships, jobs, hackathons and events.
          </p>
        </div>

        <div className="opportunities-header-count">
          <strong>{opportunities.length}</strong>
          <span>Total Opportunities</span>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="opportunities-error">
          <span>!</span>
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="opportunities-filter-card">
        <div className="opportunities-search-wrapper">
          <span className="opportunities-search-icon">?</span>

          <input
            className="opportunities-search"
            type="text"
            placeholder="Search jobs, internships, hackathons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="opportunities-search-clear"
              onClick={() => setSearch("")}
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div className="opportunities-select-wrapper">
          <label>Type</label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="INTERNSHIP">Internships</option>
            <option value="JOB">Jobs</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="EVENT">Events</option>
          </select>
        </div>

        <div className="opportunities-select-wrapper">
          <label>Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {(search || type !== "ALL" || status !== "ALL") && (
          <button
            className="opportunities-clear-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* RESULT COUNT */}
      <div className="opportunities-results-bar">
        <span>
          <strong>{filteredOpportunities.length}</strong>{" "}
          opportunit
          {filteredOpportunities.length !== 1 ? "ies" : "y"} found
        </span>

        {(search || type !== "ALL" || status !== "ALL") && (
          <button onClick={clearFilters}>
            Reset all filters
          </button>
        )}
      </div>

      {/* EMPTY */}
      {filteredOpportunities.length === 0 ? (
        <div className="opportunities-empty">
          <div className="opportunities-empty-icon">?</div>

          <h3>No opportunities found</h3>

          <p>
            {opportunities.length === 0
              ? "New opportunities will appear here when they are posted."
              : "Try changing your search or filters."}
          </p>

          {opportunities.length > 0 && (
            <button onClick={clearFilters}>
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="opportunities-grid">
          {filteredOpportunities.map((opportunity) => {
            const deadline = getDeadlineInfo(
              opportunity.deadline
            );

            return (
              <article
                className="opportunity-card"
                key={opportunity.id}
              >
                {/* TOP */}
                <div className="opportunity-card-top">
                  <span
                    className={`opportunity-type opportunity-type-${opportunity.type.toLowerCase()}`}
                  >
                    {opportunity.type}
                  </span>

                  <BookmarkButton
                    type="opportunity"
                    id={opportunity.id}
                  />
                </div>

                {/* TITLE */}
                <h2 className="opportunity-title">
                  {opportunity.title}
                </h2>

                {/* COMPANY */}
                {opportunity.company && (
                  <p className="opportunity-company">
                    {opportunity.company}
                  </p>
                )}

                {/* DESCRIPTION */}
                <p className="opportunity-description">
                  {opportunity.description}
                </p>

                {/* LOCATION */}
                {opportunity.location && (
                  <div className="opportunity-location">
                    <span>Location</span>
                    <strong>{opportunity.location}</strong>
                  </div>
                )}

                {/* DEADLINE */}
                <div className="opportunity-deadline-row">
                  {opportunity.deadline && (
                    <span className="opportunity-deadline-date">
                      Deadline:{" "}
                      {new Date(
                        opportunity.deadline
                      ).toLocaleDateString()}
                    </span>
                  )}

                  <span
                    className="opportunity-deadline-badge"
                    style={{
                      color: deadline.color,
                      background: deadline.background,
                    }}
                  >
                    {deadline.text}
                  </span>
                </div>

                {/* STATUS */}
                <div className="opportunity-status-row">
                  {opportunity.isActive ? (
                    <span className="opportunity-status active">
                      <i />
                      Active
                    </span>
                  ) : (
                    <span className="opportunity-status closed">
                      <i />
                      Closed
                    </span>
                  )}
                </div>

                {/* APPLY */}
                {opportunity.applyLink &&
                  opportunity.isActive && (
                    <div className="opportunity-card-footer">
                      <a
                        href={opportunity.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opportunity-apply-button"
                      >
                        Apply Now
                        <span>?</span>
                      </a>
                    </div>
                  )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
