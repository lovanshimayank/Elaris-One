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
      <div className="dashboard-page">
        <h1>Notes</h1>
        <p>Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "20px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "6px" }}>Study Notes</h1>
          <p style={{ margin: 0 }}>
            Find notes and study material shared by your campus community.
          </p>
        </div>
      </div>

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

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search notes, subjects, branches..."
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
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          style={{
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: "white",
          }}
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

      {/* Results */}
      {filteredNotes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed #d1d5db",
            borderRadius: "12px",
          }}
        >
          <h3>No notes found</h3>
          <p>
            {notes.length === 0
              ? "No study notes have been uploaded yet."
              : "Try changing your search or semester filter."}
          </p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: "16px" }}>
            {filteredNotes.length} note
            {filteredNotes.length !== 1 ? "s" : ""} found
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 8px" }}>
                      {note.title}
                    </h3>

                    {note.subject && (
                      <p
                        style={{
                          margin: "0 0 10px",
                          fontWeight: 600,
                        }}
                      >
                        {note.subject.name}
                      </p>
                    )}
                  </div>

                  <BookmarkButton
                    type="note"
                    id={note.id}
                  />
                </div>

                {note.description && (
                  <p style={{ color: "#6b7280" }}>
                    {note.description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    margin: "14px 0",
                  }}
                >
                  <span>Semester {note.semester}</span>
                  <span>•</span>
                  <span>{note.branch}</span>
                </div>

                {note.uploadedBy && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Uploaded by {note.uploadedBy.fullName}
                  </p>
                )}

                <a
                  href={
                    note.pdfUrl.startsWith("http")
                      ? note.pdfUrl
                      : `http://localhost:5000${note.pdfUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    background: "#111827",
                    color: "white",
                    fontSize: "14px",
                  }}
                >
                  Open PDF
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Notes;