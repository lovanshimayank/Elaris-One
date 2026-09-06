import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import BookmarkButton from "../../components/bookmarks/BookmarkButton";

interface PYQ {
  id: string;
  title: string;
  semester: number;
  branch: string;
  year: number;
  pdfUrl?: string | null;
  downloads?: number;
  subject?: {
    id: string;
    name: string;
    code?: string;
  };
  uploadedBy?: {
    id: string;
    fullName: string;
  };
}

function PYQs() {
  const [pyqs, setPYQs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("ALL");
  const [branch, setBranch] = useState("ALL");
  const [year, setYear] = useState("ALL");

  useEffect(() => {
    const fetchPYQs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/pyqs");

        setPYQs(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch PYQs:", err);
        setError("Unable to load previous year questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPYQs();
  }, []);

  const branches = useMemo(() => {
    return Array.from(
      new Set(pyqs.map((pyq) => pyq.branch).filter(Boolean))
    ).sort();
  }, [pyqs]);

  const years = useMemo(() => {
    return Array.from(
      new Set(pyqs.map((pyq) => pyq.year).filter(Boolean))
    ).sort((a, b) => b - a);
  }, [pyqs]);

  const filteredPYQs = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return pyqs.filter((pyq) => {
      const matchesSearch =
        !searchText ||
        pyq.title.toLowerCase().includes(searchText) ||
        pyq.branch.toLowerCase().includes(searchText) ||
        pyq.subject?.name?.toLowerCase().includes(searchText) ||
        pyq.subject?.code?.toLowerCase().includes(searchText);

      const matchesSemester =
        semester === "ALL" ||
        pyq.semester.toString() === semester;

      const matchesBranch =
        branch === "ALL" || pyq.branch === branch;

      const matchesYear =
        year === "ALL" || pyq.year.toString() === year;

      return (
        matchesSearch &&
        matchesSemester &&
        matchesBranch &&
        matchesYear
      );
    });
  }, [pyqs, search, semester, branch, year]);

  const clearFilters = () => {
    setSearch("");
    setSemester("ALL");
    setBranch("ALL");
    setYear("ALL");
  };

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h1>Previous Year Questions</h1>
        <p>Loading PYQs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "6px" }}>
          Previous Year Questions
        </h1>

        <p style={{ margin: 0, color: "#6b7280" }}>
          Practice with previous examination papers from your
          campus community.
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
          placeholder="Search PYQs, subjects, branches..."
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
          {Array.from({ length: 8 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              Semester {index + 1}
            </option>
          ))}
        </select>

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          style={{
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: "white",
          }}
        >
          <option value="ALL">All Branches</option>

          {branches.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            background: "white",
          }}
        >
          <option value="ALL">All Years</option>

          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {(search ||
          semester !== "ALL" ||
          branch !== "ALL" ||
          year !== "ALL") && (
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
          marginBottom: "16px",
          color: "#6b7280",
        }}
      >
        {filteredPYQs.length} PYQ
        {filteredPYQs.length !== 1 ? "s" : ""} found
      </p>

      {/* RESULTS */}
      {filteredPYQs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed #d1d5db",
            borderRadius: "12px",
          }}
        >
          <h3>No PYQs found</h3>

          <p style={{ color: "#6b7280" }}>
            {pyqs.length === 0
              ? "No previous year questions have been uploaded yet."
              : "Try changing your search or filters."}
          </p>

          {pyqs.length > 0 && (
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
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredPYQs.map((pyq) => (
            <div
              key={pyq.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                background: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* CARD HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {pyq.title}
                  </h3>

                  {pyq.subject && (
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {pyq.subject.name}
                      {pyq.subject.code
                        ? ` (${pyq.subject.code})`
                        : ""}
                    </p>
                  )}
                </div>

                <BookmarkButton
                  type="pyq"
                  id={pyq.id}
                />
              </div>

              {/* DETAILS */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  margin: "16px 0",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    padding: "5px 9px",
                    borderRadius: "6px",
                    background: "#f3f4f6",
                  }}
                >
                  Semester {pyq.semester}
                </span>

                <span
                  style={{
                    padding: "5px 9px",
                    borderRadius: "6px",
                    background: "#f3f4f6",
                  }}
                >
                  {pyq.branch}
                </span>

                <span
                  style={{
                    padding: "5px 9px",
                    borderRadius: "6px",
                    background: "#f3f4f6",
                  }}
                >
                  {pyq.year}
                </span>
              </div>

              {pyq.uploadedBy && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "14px",
                  }}
                >
                  Uploaded by {pyq.uploadedBy.fullName}
                </p>
              )}

              {/* PDF */}
              {pyq.pdfUrl && (
                <a
                  href={
                    pyq.pdfUrl.startsWith("http")
                      ? pyq.pdfUrl
                      : `http://localhost:5000${pyq.pdfUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    background: "#111827",
                    color: "white",
                    fontSize: "14px",
                  }}
                >
                  Open PYQ PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PYQs;