import { useState } from "react";
import { addBookmark } from "../../services/bookmark.service";

interface BookmarkButtonProps {
  type: "note" | "pyq" | "opportunity";
  id: string;
}

export default function BookmarkButton({
  type,
  id,
}: BookmarkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleBookmark = async () => {
    try {
      setLoading(true);

      const payload =
        type === "note"
          ? { noteId: id }
          : type === "pyq"
          ? { pyqId: id }
          : { opportunityId: id };

      await addBookmark(payload);

      setSaved(true);
    } catch (error) {
      console.error("Bookmark failed:", error);
      alert("Unable to bookmark this item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBookmark}
      disabled={loading || saved}
    >
      {loading
        ? "Saving..."
        : saved
        ? "✓ Bookmarked"
        : "🔖 Bookmark"}
    </button>
  );
}