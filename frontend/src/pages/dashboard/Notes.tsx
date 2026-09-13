import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import BookmarkButton from "../../components/bookmarks/BookmarkButton";

interface Note {
  id: string;
  title: string;
  description?: string | null;
  semester: number;
  branch: string;
  pdfUrl: string;
  createdAt?: string;
  subject?: {
    id: string;
    name: string;
    code?: string;
  };
  uploadedBy?: {
    id: string;
    fullName: string;
    role?: string;
  };
}

function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/notes");

        setNotes(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setError("Unable to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        note.title.toLowerCase().includes(searchText) ||
        note.description?.toLowerCase().includes(searchText) ||
        note.branch.toLowerCase().includes(searchText) ||
        note.subject?.name.toLowerCase().includes(searchText);

      const matchesSemester =
        semester === "ALL" ||
        note.semester.toString() === semester;

      return matchesSearch && matchesSemester;
    });
  }, [notes, search, semester]);

  if (loading) {
    return (
      <div className="dashboard-page notes-page">
        <div className="notes-loading">
          <div className="notes-loading-spinner"></div>
          <h2>Loading study material</h2>
          <p>Fetching notes from your campus library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page notes-page">

      {/* Header */}
      <div className="notes-header">
        <div>
          <div className="notes-eyebrow">ACADEMIC LIBRARY</div>
          <h1>Study Notes</h1>
          <p>
            Find notes and study material shared by your campus community.
          </p>
        </div>

        <div className="notes-header-count">
          <strong>{notes.length}</strong>
          <span>Total Notes</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="notes-error">
          <span className="notes-error-icon">!</span>
          <div>
            <strong>Unable to load notes</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="notes-filter-card">
        <div className="notes-search-wrapper">
          <span className="notes-search-icon">⌕</span>

          <input
            className="notes-search"
            type="text"
            placeholder="Search notes, subjects, branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="notes-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="notes-semester-wrapper">
          <span className="notes-filter-label">Semester</span>

          <select
            className="notes-semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="ALL">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>
      </div>

      {/* Result information */}
      <div className="notes-results-bar">
        <div>
          <strong>
            {filteredNotes.length}
          </strong>{" "}
          {filteredNotes.length === 1 ? "note" : "notes"} found
        </div>

        {(search || semester !== "ALL") && (
          <button
            type="button"
            className="notes-reset"
            onClick={() => {
              setSearch("");
              setSemester("ALL");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {filteredNotes.length === 0 ? (
        <div className="notes-empty">
          <div className="notes-empty-icon">📚</div>
          <h3>No notes found</h3>
          <p>
            {notes.length === 0
              ? "No study notes have been uploaded yet."
              : "Try changing your search or semester filter."}
          </p>

          {(search || semester !== "ALL") && (
            <button
              type="button"
              className="notes-empty-button"
              onClick={() => {
                setSearch("");
                setSemester("ALL");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              className="note-card"
            >
              {/* Card top */}
              <div className="note-card-top">
                <div className="note-file-icon">
                  <span>PDF</span>
                </div>

                <BookmarkButton
                  type="note"
                  id={note.id}
                />
              </div>

              {/* Title */}
              <div className="note-card-body">
                <h3 className="note-title">
                  {note.title}
                </h3>

                {note.subject && (
                  <div className="note-subject">
                    {note.subject.name}
                    {note.subject.code && (
                      <span>{note.subject.code}</span>
                    )}
                  </div>
                )}

                {note.description && (
                  <p className="note-description">
                    {note.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="note-meta">
                  <span className="note-meta-item">
                    <strong>Sem</strong>
                    {note.semester}
                  </span>

                  <span className="note-meta-divider"></span>

                  <span className="note-meta-item">
                    <strong>Branch</strong>
                    {note.branch}
                  </span>
                </div>

                {note.uploadedBy && (
                  <div className="note-uploader">
                    <div className="note-avatar">
                      {note.uploadedBy.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <span>Uploaded by</span>
                      <strong>{note.uploadedBy.fullName}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="note-card-footer">
                <a
                  className="note-open-button"
                  href={
                    note.pdfUrl.startsWith("http")
                      ? note.pdfUrl
                      : `http://localhost:5000${note.pdfUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Open PDF</span>
                  <span className="note-open-arrow">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notes;
