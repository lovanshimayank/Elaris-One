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

  if (loading) {
    return (
      <div className="page-container">
        <h1>Bookmarks</h1>
        <p>Loading bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Bookmarks</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Bookmarks</h1>
          <p>Your saved campus resources.</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state">
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

            const isNote = !!bookmark.note;
            const isPYQ = !!bookmark.pyq;
            const isOpportunity = !!bookmark.opportunity;

            return (
              <div className="opportunity-card" key={bookmark.id}>
                <div className="opportunity-top">
                  <span className="opportunity-type">
                    {isNote
                      ? "NOTE"
                      : isPYQ
                      ? "PYQ"
                      : "OPPORTUNITY"}
                  </span>
                </div>

                <h2>{resource.title}</h2>

                {isOpportunity && bookmark.opportunity?.company && (
                  <p>{bookmark.opportunity.company}</p>
                )}

                {"description" in resource && resource.description && (
                  <p>{resource.description}</p>
                )}

                {isPYQ && bookmark.pyq && (
                  <>
                    <p>
                      Semester: {bookmark.pyq.semester}
                    </p>

                    <p>
                      Branch: {bookmark.pyq.branch}
                    </p>

                    <p>
                      Year: {bookmark.pyq.year}
                    </p>
                  </>
                )}

                {isOpportunity && bookmark.opportunity?.location && (
                  <p>
                    Location: {bookmark.opportunity.location}
                  </p>
                )}

                <div style={{ marginTop: "15px" }}>
                  {isOpportunity &&
                    bookmark.opportunity?.applyLink && (
                      <a
                        href={bookmark.opportunity.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply Now
                      </a>
                    )}

                  {isNote && bookmark.note?.pdfUrl && (
                    <a
                      href={`http://localhost:5000${bookmark.note.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Note
                    </a>
                  )}

                  {isPYQ && bookmark.pyq?.pdfUrl && (
                    <a
                      href={`http://localhost:5000${bookmark.pyq.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open PYQ
                    </a>
                  )}

                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    style={{ marginLeft: "15px" }}
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