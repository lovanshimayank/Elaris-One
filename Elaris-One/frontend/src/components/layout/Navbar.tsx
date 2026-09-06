import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

interface SearchResult {
  id: string;
  title: string;
  type: "Note" | "PYQ" | "Opportunity";
  path: string;
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchResources = async () => {
      const keyword = query.trim().toLowerCase();

      if (!keyword) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const [
          notesResponse,
          pyqsResponse,
          opportunitiesResponse,
        ] = await Promise.all([
          api.get("/notes"),
          api.get("/pyqs"),
          api.get("/opportunities"),
        ]);

        const notes = notesResponse.data.data || [];
        const pyqs = pyqsResponse.data.data || [];
        const opportunities = opportunitiesResponse.data.data || [];

        const noteResults: SearchResult[] = notes
          .filter((note: any) =>
            `${note.title} ${note.description || ""}`
              .toLowerCase()
              .includes(keyword)
          )
          .map((note: any) => ({
            id: note.id,
            title: note.title,
            type: "Note",
            path: `/notes/${note.id}`,
          }));

        const pyqResults: SearchResult[] = pyqs
          .filter((pyq: any) =>
            `${pyq.title} ${pyq.branch || ""}`
              .toLowerCase()
              .includes(keyword)
          )
          .map((pyq: any) => ({
            id: pyq.id,
            title: pyq.title,
            type: "PYQ",
            path: `/pyqs/${pyq.id}`,
          }));

        const opportunityResults: SearchResult[] = opportunities
          .filter((opportunity: any) =>
            `${opportunity.title} ${opportunity.company || ""} ${
              opportunity.description || ""
            }`
              .toLowerCase()
              .includes(keyword)
          )
          .map((opportunity: any) => ({
            id: opportunity.id,
            title: opportunity.title,
            type: "Opportunity",
            path: `/opportunities/${opportunity.id}`,
          }));

        setResults([
          ...noteResults,
          ...pyqResults,
          ...opportunityResults,
        ].slice(0, 8));
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchResources, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="navbar">
      <div className="search-container">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search notes, PYQs, opportunities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query.trim() && (
          <div className="search-results">
            {loading ? (
              <div className="search-message">
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.path}
                  className="search-result"
                  onClick={() => setQuery("")}
                >
                  <div>
                    <strong>{result.title}</strong>
                    <span>{result.type}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="search-message">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <button className="icon-button">
          <Bell size={19} />
        </button>

        <div className="user-mini">
          <div className="avatar">M</div>

          <div>
            <strong>Mayank Lovanshi</strong>
            <span>Student</span>
          </div>
        </div>
      </div>
    </header>
  );
}