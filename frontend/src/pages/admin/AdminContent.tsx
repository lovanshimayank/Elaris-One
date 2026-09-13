import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CheckSquare,
  FileQuestion,
  FileText,
  RefreshCw,
  Square,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import api from "../../api/axios";

type ContentType = "notes" | "pyqs" | "opportunities";

interface ContentItem {
  id: string;
  title: string;
  createdAt: string;
  [key: string]: any;
}

interface ContentResponse {
  notes: ContentItem[];
  pyqs: ContentItem[];
  opportunities: ContentItem[];
}

export default function AdminContent() {
  const [activeTab, setActiveTab] =
    useState<ContentType>("notes");

  const [content, setContent] =
    useState<ContentResponse>({
      notes: [],
      pyqs: [],
      opportunities: [],
    });

  const [selected, setSelected] = useState<Set<string>>(
    new Set()
  );

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    type: ContentType;
    ids: string[];
    title?: string;
  } | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/content");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load content."
        );
      }

      setContent(response.data.data);

      setSelected(new Set());
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load admin content."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const currentItems = useMemo(() => {
    return content[activeTab];
  }, [content, activeTab]);

  const allSelected =
    currentItems.length > 0 &&
    currentItems.every((item) =>
      selected.has(item.id)
    );

  const selectedCount = currentItems.filter((item) =>
    selected.has(item.id)
  ).length;

  const toggleItem = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (allSelected) {
        currentItems.forEach((item) =>
          next.delete(item.id)
        );
      } else {
        currentItems.forEach((item) =>
          next.add(item.id)
        );
      }

      return next;
    });
  };

  const requestSingleDelete = (
    item: ContentItem
  ) => {
    setConfirmDelete({
      type: activeTab,
      ids: [item.id],
      title: item.title,
    });
  };

  const requestBulkDelete = () => {
    if (selectedCount === 0) return;

    setConfirmDelete({
      type: activeTab,
      ids: Array.from(selected),
    });
  };

  const performDelete = async () => {
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      setError("");

      const { type, ids } = confirmDelete;

      if (ids.length === 1) {
        let endpoint = "";

        if (type === "notes") {
          endpoint = `/admin/notes/${ids[0]}`;
        }

        if (type === "pyqs") {
          endpoint = `/admin/pyqs/${ids[0]}`;
        }

        if (type === "opportunities") {
          endpoint = `/admin/opportunities/${ids[0]}`;
        }

        await api.delete(endpoint);
      } else {
        let endpoint = "";

        if (type === "notes") {
          endpoint = "/admin/notes/bulk";
        }

        if (type === "pyqs") {
          endpoint = "/admin/pyqs/bulk";
        }

        if (type === "opportunities") {
          endpoint = "/admin/opportunities/bulk";
        }

        await api.delete(endpoint, {
          data: { ids },
        });
      }

      setConfirmDelete(null);

      await loadContent();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete content."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getTypeLabel = () => {
    if (activeTab === "notes") return "Notes";
    if (activeTab === "pyqs") return "PYQs";
    return "Opportunities";
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-dashboard-loading">
          <RefreshCw
            size={28}
            className="admin-spin"
          />
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* HEADER */}
      <div className="admin-content-header">
        <div>
          <span className="admin-eyebrow">
            CONTENT MANAGEMENT
          </span>

          <h1>Content Management</h1>

          <p>
            Review and permanently manage Notes, PYQs and
            Opportunities across Elaris-One.
          </p>
        </div>

        <button
          type="button"
          className="admin-dashboard-refresh"
          onClick={loadContent}
          disabled={loading || deleting}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="admin-dashboard-error-banner">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* TABS */}
      <div className="admin-content-tabs">
        <button
          type="button"
          className={
            activeTab === "notes"
              ? "admin-content-tab active"
              : "admin-content-tab"
          }
          onClick={() => {
            setActiveTab("notes");
            setSelected(new Set());
          }}
        >
          <FileText size={18} />
          Notes
          <span>{content.notes.length}</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "pyqs"
              ? "admin-content-tab active"
              : "admin-content-tab"
          }
          onClick={() => {
            setActiveTab("pyqs");
            setSelected(new Set());
          }}
        >
          <FileQuestion size={18} />
          PYQs
          <span>{content.pyqs.length}</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "opportunities"
              ? "admin-content-tab active"
              : "admin-content-tab"
          }
          onClick={() => {
            setActiveTab("opportunities");
            setSelected(new Set());
          }}
        >
          <Briefcase size={18} />
          Opportunities
          <span>
            {content.opportunities.length}
          </span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="admin-content-toolbar">
        <button
          type="button"
          className="admin-select-all"
          onClick={toggleSelectAll}
          disabled={currentItems.length === 0 || deleting}
        >
          {allSelected ? (
            <CheckSquare size={18} />
          ) : (
            <Square size={18} />
          )}

          {allSelected
            ? "Deselect All"
            : "Select All"}
        </button>

        <div className="admin-content-toolbar-right">
          {selectedCount > 0 && (
            <span className="admin-selected-count">
              {selectedCount} selected
            </span>
          )}

          <button
            type="button"
            className="admin-delete-selected"
            onClick={requestBulkDelete}
            disabled={
              selectedCount === 0 || deleting
            }
          >
            <Trash2 size={17} />
            Delete Selected
          </button>
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="admin-content-list">
        {currentItems.length === 0 ? (
          <div className="admin-content-empty">
            <FileText size={38} />

            <h3>
              No {getTypeLabel().toLowerCase()} found
            </h3>

            <p>
              There is currently no content available in
              this section.
            </p>
          </div>
        ) : (
          currentItems.map((item) => {
            const isSelected = selected.has(item.id);

            return (
              <div
                className={
                  isSelected
                    ? "admin-content-item selected"
                    : "admin-content-item"
                }
                key={item.id}
              >
                {/* CHECKBOX */}
                <button
                  type="button"
                  className="admin-content-checkbox"
                  onClick={() =>
                    toggleItem(item.id)
                  }
                  disabled={deleting}
                  aria-label={
                    isSelected
                      ? "Deselect item"
                      : "Select item"
                  }
                >
                  {isSelected ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                {/* INFO */}
                <div className="admin-content-item-info">
                  <h3>{item.title}</h3>

                  <div className="admin-content-meta">
                    {activeTab === "notes" && (
                      <>
                        <span>
                          {item.subject?.name ||
                            "Unknown Subject"}
                        </span>

                        <span>
                          Semester {item.semester}
                        </span>

                        <span>
                          {item.branch || "All Branches"}
                        </span>
                      </>
                    )}

                    {activeTab === "pyqs" && (
                      <>
                        <span>
                          {item.subject?.name ||
                            "Unknown Subject"}
                        </span>

                        <span>
                          Year {item.year}
                        </span>

                        <span>
                          Semester {item.semester}
                        </span>
                      </>
                    )}

                    {activeTab ===
                      "opportunities" && (
                      <>
                        <span>
                          {item.company ||
                            "Independent"}
                        </span>

                        <span>
                          {item.type || "Opportunity"}
                        </span>

                        {item.location && (
                          <span>
                            {item.location}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="admin-content-submeta">
                    Uploaded by{" "}
                    {item.uploadedBy?.fullName ||
                      item.postedBy?.fullName ||
                      "Unknown user"}

                    {" • "}

                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}
                  </div>
                </div>

                {/* STATUS */}
                <div className="admin-content-status">
                  <span
                    className={`admin-status ${String(
                      item.moderationStatus ||
                        "PENDING"
                    ).toLowerCase()}`}
                  >
                    {item.moderationStatus ||
                      "PENDING"}
                  </span>
                </div>

                {/* DELETE */}
                <button
                  type="button"
                  className="admin-delete"
                  onClick={() =>
                    requestSingleDelete(item)
                  }
                  disabled={deleting}
                  title="Permanently delete"
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmDelete && (
        <div
          className="admin-delete-modal-overlay"
          onClick={() => {
            if (!deleting) {
              setConfirmDelete(null);
            }
          }}
        >
          <div
            className="admin-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-delete-modal-icon">
              <AlertTriangle size={26} />
            </div>

            <h2>
              Permanently delete{" "}
              {confirmDelete.ids.length === 1
                ? "this item"
                : `${confirmDelete.ids.length} items`}
              ?
            </h2>

            <p>
              {confirmDelete.ids.length === 1 &&
              confirmDelete.title ? (
                <>
                  <strong>
                    "{confirmDelete.title}"
                  </strong>{" "}
                  will be permanently deleted.
                </>
              ) : (
                <>
                  The selected{" "}
                  {getTypeLabel().toLowerCase()} will
                  be permanently deleted.
                </>
              )}
            </p>

            <p className="admin-delete-warning">
              This action cannot be undone.
            </p>

            <div className="admin-delete-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={() =>
                  setConfirmDelete(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-modal-confirm-delete"
                onClick={performDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="admin-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}