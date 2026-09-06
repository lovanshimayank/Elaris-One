import { useEffect, useState } from "react";
import api from "../../services/api";

interface Bookmark {
  id: string;

  note?: {
    id: string;
    title: string;
    description?: string | null;
    pdfUrl?: string;
  } | null;

  pyq?: {
    id: string;
    title: string;
    semester: number;
    branch: string;
    year: number;
    pdfUrl?: string;
  } | null;

  opportunity?: {
    id: string;
    title: string;
    description: string;
    company?: string | null;
    location?: string | null;
    type: string;
    applyLink?: string | null;
  } | null;
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookmarks");
      setBookmarks(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
      setError("Unable to load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const removeBookmark = async (id: string) => {
    try {
      await api.delete(`/bookmarks/${id}`);

      setBookmarks((current) =>
        current.filter((bookmark) => bookmark.id !== id)
      );
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
      alert("Unable to remove bookmark.");
    }
  };

  const getResourceType = (bookmark: Bookmark) => {
    if (bookmark.note) return "NOTE";
    if (bookmark.pyq) return "PYQ";
    return "OPPORTUNITY";
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <span className="page-eyebrow">SAVED RESOURCES</span>
          <h1>Bookmarks</h1>
          <p>Your saved campus resources.</p>
        </div>

        <div className="empty-state">
          <h3>Loading bookmarks...</h3>
          <p>Fetching your saved resources.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <span className="page-eyebrow">SAVED RESOURCES</span>
          <h1>Bookmarks</h1>
          <p>Your saved campus resources.</p>
        </div>

        <div className="empty-state">
          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button
            className="primary-button"
            onClick={fetchBookmarks}
            style={{ marginTop: "16px" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-eyebrow">SAVED RESOURCES</span>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1>Bookmarks</h1>
            <p>Quick access to your saved campus resources.</p>
          </div>

          {bookmarks.length > 0 && (
            <span
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#eef2ff",
                color: "#4f46e5",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {bookmarks.length} saved
            </span>
          )}
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              margin: "0 auto 16px",
              display: "grid",
              placeItems: "center",
              background: "#eef2ff",
              fontSize: "24px",
            }}
          >
            ★
          </div>

          <h3>No bookmarks yet</h3>

          <p>
            Save notes, PYQs and opportunities to access them quickly later.
          </p>
        </div>
      ) : (
        <div className="opportunities-grid">
          {bookmarks.map((bookmark) => {
            const resource =
              bookmark.note ||
              bookmark.pyq ||
              bookmark.opportunity;

            if (!resource) return null;

            const type = getResourceType(bookmark);

            return (
              <div className="opportunity-card" key={bookmark.id}>
                <div className="opportunity-top">
                  <span className="opportunity-type">
                    {type}
                  </span>

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                    }}
                  >
                    ★ Saved
                  </span>
                </div>

                <h2>{resource.title}</h2>

                {bookmark.opportunity?.company && (
                  <p className="opportunity-company">
                    {bookmark.opportunity.company}
                  </p>
                )}

                {"description" in resource &&
                  resource.description && (
                    <p className="opportunity-description">
                      {resource.description}
                    </p>
                  )}

                {bookmark.pyq && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      margin: "14px 0",
                    }}
                  >
                    <span className="resource-tag">
                      Semester {bookmark.pyq.semester}
                    </span>

                    <span className="resource-tag">
                      {bookmark.pyq.branch}
                    </span>

                    <span className="resource-tag">
                      {bookmark.pyq.year}
                    </span>
                  </div>
                )}

                {bookmark.opportunity?.location && (
                  <p className="opportunity-meta">
                    <strong>Location:</strong>{" "}
                    {bookmark.opportunity.location}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                  }}
                >
                  {bookmark.opportunity?.applyLink && (
                    <a
                      href={bookmark.opportunity.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-button"
                    >
                      Apply Now →
                    </a>
                  )}

                  {bookmark.note?.pdfUrl && (
                    <a
                      href={
                        bookmark.note.pdfUrl.startsWith("http")
                          ? bookmark.note.pdfUrl
                          : `http://localhost:5000${bookmark.note.pdfUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-button"
                    >
                      Open Note →
                    </a>
                  )}

                  {bookmark.pyq?.pdfUrl && (
                    <a
                      href={
                        bookmark.pyq.pdfUrl.startsWith("http")
                          ? bookmark.pyq.pdfUrl
                          : `http://localhost:5000${bookmark.pyq.pdfUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-button"
                    >
                      Open PYQ →
                    </a>
                  )}

                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    style={{
                      padding: "10px 15px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      color: "#6b7280",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;