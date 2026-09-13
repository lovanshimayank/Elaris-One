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
      <div className="bookmarks-page">
        <div className="bookmarks-header">
          <span className="bookmarks-eyebrow">SAVED RESOURCES</span>
          <h1>Bookmarks</h1>
          <p>Your saved campus resources, all in one place.</p>
        </div>

        <div className="bookmarks-loading">
          <div className="bookmarks-spinner" />
          <h3>Loading bookmarks</h3>
          <p>Fetching your saved resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-header">
          <span className="bookmarks-eyebrow">SAVED RESOURCES</span>
          <h1>Bookmarks</h1>
          <p>Your saved campus resources, all in one place.</p>
        </div>

        <div className="bookmarks-empty bookmarks-error">
          <div className="bookmarks-empty-icon">!</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button
            className="bookmarks-primary-button"
            onClick={fetchBookmarks}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-header">
        <div>
          <span className="bookmarks-eyebrow">SAVED RESOURCES</span>
          <h1>Bookmarks</h1>
          <p>Quick access to your saved campus resources.</p>
        </div>

        {bookmarks.length > 0 && (
          <div className="bookmarks-count">
            <span>{bookmarks.length}</span>
            saved
          </div>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="bookmarks-empty">
          <div className="bookmarks-empty-icon">â˜…</div>

          <h3>No bookmarks yet</h3>

          <p>
            Save notes, PYQs and opportunities to access them quickly later.
          </p>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {bookmarks.map((bookmark) => {
            const resource =
              bookmark.note ||
              bookmark.pyq ||
              bookmark.opportunity;

            if (!resource) return null;

            const type = getResourceType(bookmark);

            return (
              <article className="bookmark-card" key={bookmark.id}>
                <div className="bookmark-card-top">
                  <span
                    className={`bookmark-type bookmark-type-${type.toLowerCase()}`}
                  >
                    {type}
                  </span>

                  <span className="bookmark-saved">
                    â˜… Saved
                  </span>
                </div>

                <div className="bookmark-content">
                  <h2>{resource.title}</h2>

                  {bookmark.opportunity?.company && (
                    <p className="bookmark-company">
                      {bookmark.opportunity.company}
                    </p>
                  )}

                  {"description" in resource &&
                    resource.description && (
                      <p className="bookmark-description">
                        {resource.description}
                      </p>
                    )}

                  {bookmark.pyq && (
                    <div className="bookmark-tags">
                      <span>
                        Semester {bookmark.pyq.semester}
                      </span>
                      <span>{bookmark.pyq.branch}</span>
                      <span>{bookmark.pyq.year}</span>
                    </div>
                  )}

                  {bookmark.opportunity?.location && (
                    <div className="bookmark-location">
                      <span>Location</span>
                      {bookmark.opportunity.location}
                    </div>
                  )}
                </div>

                <div className="bookmark-footer">
                  <div className="bookmark-actions">
                    {bookmark.opportunity?.applyLink && (
                      <a
                        href={bookmark.opportunity.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bookmark-action-primary"
                      >
                        Apply Now <span>â†’</span>
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
                        className="bookmark-action-primary"
                      >
                        Open Note <span>â†’</span>
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
                        className="bookmark-action-primary"
                      >
                        Open PYQ <span>â†’</span>
                      </a>
                    )}

                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="bookmark-remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;