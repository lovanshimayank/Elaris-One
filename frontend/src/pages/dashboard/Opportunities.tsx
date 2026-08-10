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
        color: "#6b7280",
        background: "#f3f4f6",
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
      <div style={{ padding: "30px" }}>
        <h1>Opportunities</h1>
        <p>Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "6px" }}>
          Opportunities
        </h1>

        <p
          style={{
            margin: 0,
            color: "#6b7280",
          }}
        >
          Discover internships, jobs, hackathons and events.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search jobs, internships, hackathons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "260px",
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: "white",
          }}
        >
          <option value="ALL">All Types</option>
          <option value="INTERNSHIP">Internships</option>
          <option value="JOB">Jobs</option>
          <option value="HACKATHON">Hackathons</option>
          <option value="EVENT">Events</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: "white",
          }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="CLOSED">Closed</option>
        </select>

        {(search ||
          type !== "ALL" ||
          status !== "ALL") && (
          <button
            onClick={clearFilters}
            style={{
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* RESULT COUNT */}
      <p
        style={{
          marginBottom: "18px",
          color: "#6b7280",
        }}
      >
        {filteredOpportunities.length} opportunit
        {filteredOpportunities.length !== 1 ? "ies" : "y"} found
      </p>

      {/* RESULTS */}
      {filteredOpportunities.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed #d1d5db",
            borderRadius: "12px",
          }}
        >
          <h3>No opportunities found</h3>

          <p style={{ color: "#6b7280" }}>
            {opportunities.length === 0
              ? "New opportunities will appear here when they are posted."
              : "Try changing your search or filters."}
          </p>

          {opportunities.length > 0 && (
            <button
              onClick={clearFilters}
              style={{
                marginTop: "10px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                background: "#111827",
                color: "white",
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredOpportunities.map((opportunity) => {
            const deadline = getDeadlineInfo(
              opportunity.deadline
            );

            return (
              <div
                className="opportunity-card"
                key={opportunity.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "20px",
                  background: "white",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "999px",
                      background: "#eef2ff",
                      color: "#3730a3",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {opportunity.type}
                  </span>

                  <BookmarkButton
                    type="opportunity"
                    id={opportunity.id}
                  />
                </div>

                {/* TITLE */}
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: "20px",
                  }}
                >
                  {opportunity.title}
                </h2>

                {/* COMPANY */}
                {opportunity.company && (
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontWeight: 600,
                    }}
                  >
                    {opportunity.company}
                  </p>
                )}

                {/* DESCRIPTION */}
                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "16px",
                  }}
                >
                  {opportunity.description}
                </p>

                {/* LOCATION */}
                {opportunity.location && (
                  <p
                    style={{
                      margin: "8px 0",
                      fontSize: "14px",
                    }}
                  >
                    📍 <strong>Location:</strong>{" "}
                    {opportunity.location}
                  </p>
                )}

                {/* DEADLINE */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    margin: "14px 0",
                  }}
                >
                  {opportunity.deadline && (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#4b5563",
                      }}
                    >
                      Deadline:{" "}
                      {new Date(
                        opportunity.deadline
                      ).toLocaleDateString()}
                    </span>
                  )}

                  <span
                    style={{
                      padding: "5px 9px",
                      borderRadius: "6px",
                      background: deadline.background,
                      color: deadline.color,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {deadline.text}
                  </span>
                </div>

                {/* STATUS */}
                <div style={{ marginBottom: "16px" }}>
                  {opportunity.isActive ? (
                    <span
                      style={{
                        color: "#166534",
                        background: "#dcfce7",
                        padding: "5px 9px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      ● Active
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#991b1b",
                        background: "#fee2e2",
                        padding: "5px 9px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      ● Closed
                    </span>
                  )}
                </div>

                {/* APPLY */}
                {opportunity.applyLink &&
                  opportunity.isActive && (
                    <a
                      href={opportunity.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        width: "100%",
                        boxSizing: "border-box",
                        textAlign: "center",
                        padding: "11px 16px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        background: "#111827",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Apply Now →
                    </a>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Opportunities;