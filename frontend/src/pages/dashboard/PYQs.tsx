import { useEffect, useState } from "react";
import api from "../../services/api";
import BookmarkButton from "../../components/bookmarks/BookmarkButton";

function PYQs() {
  const [pyqs, setPYQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPYQs = async () => {
      try {
        const response = await api.get("/pyqs");

        console.log("PYQS FROM BACKEND:", response.data);

        setPYQs(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch PYQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPYQs();
  }, []);

  if (loading) {
    return <div>Loading PYQs...</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Previous Year Questions</h1>

      {pyqs.length === 0 ? (
        <p>No PYQs available.</p>
      ) : (
        pyqs.map((pyq) => (
          <div key={pyq.id} style={{ marginBottom: "20px" }}>
            <h3>{pyq.title}</h3>
            <p>Semester: {pyq.semester}</p>
            <p>Branch: {pyq.branch}</p>
            <p>Year: {pyq.year}</p>
            <BookmarkButton
  type="pyq"
  id={pyq.id}
/>
          </div>
        ))
      )}
    </div>
  );
}

export default PYQs;