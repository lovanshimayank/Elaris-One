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
        semester === "ALL" || pyq.semester.toString() === semester;

      const matchesBranch =
        branch === "ALL" || pyq.branch === branch;

      const matchesYear =
        year === "ALL" || pyq.year.toString() === year;

      return matchesSearch && matchesSemester && matchesBranch && matchesYear;
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
      <div className="pyqs-page">
        <div className="pyqs-loading">
          <div className="pyqs-loading-spinner" />
          <h2>Loading Previous Year Questions</h2>
          <p>Preparing your question paper library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pyqs-page">
      {/* HEADER */}
      <div className="pyqs-header">
        <div>
          <span className="pyqs-eyebrow">EXAM PREPARATION</span>
          <h1>Previous Year Questions</h1>
          <p>
            Practice with previous examination papers from your campus
            community.
          </p>
        </div>

        <div className="pyqs-header-count">
          <strong>{pyqs.length}</strong>
          <span>Total Papers</span>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="pyqs-error">
          <span>!</span>
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className="pyqs-filter-card">
        <div className="pyqs-search-wrapper">
          <span className="pyqs-search-icon">?</span>
          <input
            className="pyqs-search"
            type="text"
            placeholder="Search PYQs, subjects, branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="pyqs-search-clear"
              onClick={() => setSearch("")}
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div className="pyqs-select-wrapper">
          <label>Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="ALL">All Semesters</option>
            {Array.from({ length: 8 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                Semester {index + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="pyqs-select-wrapper">
          <label>Branch</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="ALL">All Branches</option>
            {branches.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="pyqs-select-wrapper">
          <label>Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="ALL">All Years</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {(search ||
          semester !== "ALL" ||
          branch !== "ALL" ||
          year !== "ALL") && (
          <button className="pyqs-clear-button" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* RESULTS BAR */}
      <div className="pyqs-results-bar">
        <span>
          <strong>{filteredPYQs.length}</strong>{" "}
          {filteredPYQs.length === 1 ? "paper" : "papers"} found
        </span>

        {(search ||
          semester !== "ALL" ||
          branch !== "ALL" ||
          year !== "ALL") && (
          <button onClick={clearFilters}>Reset all filters</button>
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredPYQs.length === 0 ? (
        <div className="pyqs-empty">
          <div className="pyqs-empty-icon">??</div>
          <h3>No PYQs found</h3>
          <p>
            {pyqs.length === 0
              ? "No previous year questions have been uploaded yet."
              : "Try changing your search or filters."}
          </p>

          {pyqs.length > 0 && (
            <button onClick={clearFilters}>Reset Filters</button>
          )}
        </div>
      ) : (
        /* RESULTS */
        <div className="pyqs-grid">
          {filteredPYQs.map((pyq) => (
            <article className="pyq-card" key={pyq.id}>
              <div className="pyq-card-top">
                <div className="pyq-file-icon">
                  <span>PDF</span>
                </div>

                <BookmarkButton type="pyq" id={pyq.id} />
              </div>

              <div className="pyq-card-body">
                <h3 className="pyq-title">{pyq.title}</h3>

                {pyq.subject && (
                  <p className="pyq-subject">
                    {pyq.subject.name}
                    {pyq.subject.code ? ` · ${pyq.subject.code}` : ""}
                  </p>
                )}

                <div className="pyq-tags">
                  <span>Sem {pyq.semester}</span>
                  <span>{pyq.branch}</span>
                  <span>{pyq.year}</span>
                </div>

                {pyq.uploadedBy && (
                  <div className="pyq-uploader">
                    <div className="pyq-avatar">
                      {pyq.uploadedBy.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <small>Uploaded by</small>
                      <strong>{pyq.uploadedBy.fullName}</strong>
                    </div>
                  </div>
                )}
              </div>

              {pyq.pdfUrl && (
                <div className="pyq-card-footer">
                  <a
                    href={
                      pyq.pdfUrl.startsWith("http")
                        ? pyq.pdfUrl
                        : `http://localhost:5000${pyq.pdfUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pyq-open-button"
                  >
                    Open PYQ PDF
                    <span>?</span>
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PYQs;
