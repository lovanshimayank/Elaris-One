
import { useEffect, useState } from "react";
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
  

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);

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

  if (loading) {
    return (
      <div className="page-container">
        <h1>Opportunities</h1>
        <p>Loading opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Opportunities</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Opportunities</h1>
          <p>Discover internships, jobs, hackathons and events.</p>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <div className="empty-state">
          <h3>No opportunities available</h3>
          <p>New opportunities will appear here when they are posted.</p>
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map((opportunity) => (
            <div className="opportunity-card" key={opportunity.id}>
              <div className="opportunity-top">
                <span className="opportunity-type">
                  {opportunity.type}
                </span>

                {opportunity.isActive && (
                  <span className="active-badge">Active</span>
                )}
              </div>

              <h2>{opportunity.title}</h2>

              {opportunity.company && (
                <p className="opportunity-company">
                  {opportunity.company}
                </p>
              )}

              <p className="opportunity-description">
                {opportunity.description}
              </p>

              {opportunity.location && (
                <p>
                  <strong>Location:</strong> {opportunity.location}
                </p>
              )}

              {opportunity.deadline && (
                <p>
                  <strong>Deadline:</strong>{" "}
                  {new Date(opportunity.deadline).toLocaleDateString()}
                </p>
              )}

              {opportunity.applyLink && (
                <a
                  href={opportunity.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apply-button"
                >
                  Apply Now
                </a>
              )}
              <BookmarkButton
  type="opportunity"
  id={opportunity.id}
/>
            </div>
          ))}
        </div>
      )}
      
    </div>
    
  );
};

export default Opportunities;