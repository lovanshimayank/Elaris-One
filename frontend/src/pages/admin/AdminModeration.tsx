import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ModerationBase {
  id: string;
  title: string;
  createdAt: string;
  moderationStatus: ModerationStatus;
  moderationCategories: string[];
  moderationReasons: string[];
  moderationScore?: number | null;
  moderationSummary?: string | null;
}

interface NoteItem extends ModerationBase {
  description?: string | null;
  pdfUrl: string;
  semester: number;
  branch: string;
  subject?: {
    name: string;
    code: string;
  };
  uploadedBy?: {
    fullName: string;
    email: string;
  };
}

interface PYQItem extends ModerationBase {
  pdfUrl: string;
  semester: number;
  branch: string;
  year: number;
  subject?: {
    name: string;
    code: string;
  };
  uploadedBy?: {
    fullName: string;
    email: string;
  };
}

interface OpportunityItem extends ModerationBase {
  description: string;
  company?: string | null;
  applyLink?: string | null;
  deadline?: string | null;
  location?: string | null;
  type: string;
  postedBy?: {
    fullName: string;
    email: string;
  };
}

interface ModerationQueue {
  notes: NoteItem[];
  pyqs: PYQItem[];
  opportunities: OpportunityItem[];
}
interface AllContentItem {
  id: string;
  title: string;
  createdAt: string;
  moderationStatus?: ModerationStatus;
  subject?: {
    name: string;
    code?: string;
  };
  semester?: number;
  branch?: string;
  year?: number;
  company?: string | null;
  type?: string;
  location?: string | null;
  uploadedBy?: {
    fullName: string;
    email?: string;
  };
  postedBy?: {
    fullName: string;
    email?: string;
  };
}

type Tab = "notes" | "pyqs" | "opportunities";

type RejectTarget = {
  itemType: "note" | "pyq" | "opportunity";
  itemId: string;
  title: string;
} | null;

const REJECTION_REASONS = [
  "Inappropriate content",
  "Incorrect or irrelevant content",
  "Duplicate submission",
  "Poor-quality or incomplete document",
  "Invalid academic material",
  "Misleading information",
  "Promotional or spam content",
  "Other",
];

export default function AdminModeration() {
  const { user, loading: authLoading } = useAuth();

  const [queue, setQueue] = useState<ModerationQueue>({
    notes: [],
    pyqs: [],
    opportunities: [],
  });
  // All content management data
  const [allContent, setAllContent] =
  useState<{
    notes: AllContentItem[];
    pyqs: AllContentItem[];
    opportunities: AllContentItem[];
  }>({
    notes: [],
    pyqs: [],
    opportunities: [],
  });

  const [selectedContentIds, setSelectedContentIds] =
    useState<Set<string>>(new Set());

  const [contentDeleting, setContentDeleting] =
    useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [rejectTarget, setRejectTarget] =
    useState<RejectTarget>(null);

  const [selectedReasons, setSelectedReasons] =
    useState<string[]>([]);

  const [adminNote, setAdminNote] = useState("");

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/moderation");

      if (response.data?.success) {
        setQueue({
          notes: response.data.data?.notes || [],
          pyqs: response.data.data?.pyqs || [],
          opportunities: response.data.data?.opportunities || [],
        });
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load moderation queue."
      );
    } finally {
      setLoading(false);
    }
  };
  const loadAllContent = async () => {
    try {
      const response = await api.get("/admin/content");

      if (response.data?.success) {
        setAllContent({
          notes: response.data.data?.notes || [],
          pyqs: response.data.data?.pyqs || [],
          opportunities:
            response.data.data?.opportunities || [],
        });
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load all content."
      );
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      loadQueue();
      loadAllContent();
    }
  }, [authLoading, user]);

  const deleteItem = async (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => {
    const confirmed = window.confirm(
      `Delete "${title}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(itemId);
      setError("");

      const endpointMap = {
        note: `/admin/notes/${itemId}`,
        pyq: `/admin/pyqs/${itemId}`,
        opportunity: `/admin/opportunities/${itemId}`,
      };

      await api.delete(endpointMap[itemType]);

      await loadQueue();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete item."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const currentContentItems =
    allContent[activeTab];

  const selectedContentCount =
    currentContentItems.filter((item) =>
      selectedContentIds.has(item.id)
    ).length;

  const allContentSelected =
    currentContentItems.length > 0 &&
    currentContentItems.every((item) =>
      selectedContentIds.has(item.id)
    );

  const toggleContentSelection = (id: string) => {
    setSelectedContentIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleContentSelectAll = () => {
    setSelectedContentIds((previous) => {
      const next = new Set(previous);

      if (allContentSelected) {
        currentContentItems.forEach((item) => {
          next.delete(item.id);
        });
      } else {
        currentContentItems.forEach((item) => {
          next.add(item.id);
        });
      }

      return next;
    });
  };

  const deleteSelectedContent = async () => {
    if (selectedContentCount === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedContentCount} selected ${activeTab} permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setContentDeleting(true);
      setError("");

      const endpointMap = {
        notes: "/admin/notes/bulk",
        pyqs: "/admin/pyqs/bulk",
        opportunities:
          "/admin/opportunities/bulk",
      };

      const ids = Array.from(selectedContentIds);

      await api.delete(endpointMap[activeTab], {
        data: { ids },
      });

      setSelectedContentIds(new Set());

      await loadAllContent();
      await loadQueue();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete selected content."
      );
    } finally {
      setContentDeleting(false);
    }
  };

  const deleteAllContentItem = async (
    itemType: Tab,
    itemId: string,
    title: string
  ) => {
    const endpointMap = {
      notes: `/admin/notes/${itemId}`,
      pyqs: `/admin/pyqs/${itemId}`,
      opportunities:
        `/admin/opportunities/${itemId}`,
    };

    const confirmed = window.confirm(
      `Delete "${title}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setContentDeleting(true);
      setError("");

      await api.delete(endpointMap[itemType]);

      setSelectedContentIds((previous) => {
        const next = new Set(previous);
        next.delete(itemId);
        return next;
      });

      await loadAllContent();
      await loadQueue();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to delete content."
      );
    } finally {
      setContentDeleting(false);
    }
  };

  const approveItem = async (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string
  ) => {
    try {
      setProcessingId(itemId);
      setError("");

      await api.post("/admin/moderation/resolve", {
        itemType,
        itemId,
        status: "APPROVED",
        reasons: [],
        summary: "Approved by administrator.",
      });

      await loadQueue();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to approve item."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => {
    setRejectTarget({
      itemType,
      itemId,
      title,
    });

    setSelectedReasons([]);
    setAdminNote("");
    setError("");
  };

  const closeRejectModal = () => {
    if (processingId) return;

    setRejectTarget(null);
    setSelectedReasons([]);
    setAdminNote("");
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  };

  const rejectItem = async () => {
    if (!rejectTarget || selectedReasons.length === 0) {
      return;
    }

    try {
      setProcessingId(rejectTarget.itemId);
      setError("");

      const summary =
        adminNote.trim() ||
        `Rejected by administrator: ${selectedReasons.join(", ")}`;

      await api.post("/admin/moderation/resolve", {
        itemType: rejectTarget.itemType,
        itemId: rejectTarget.itemId,
        status: "REJECTED",
        reasons: selectedReasons,
        summary,
      });

      closeRejectModal();
      await loadQueue();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to reject item."
      );
    } finally {
      setProcessingId(null);
    }
  };
if (authLoading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <AlertCircle size={42} />
          <h2>Access Denied</h2>
          <p>
            You do not have permission to access the Admin
            Moderation Panel.
          </p>
        </div>
      </div>
    );
  }

  const totalPending =
    queue.notes.length +
    queue.pyqs.length +
    queue.opportunities.length;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">
            ADMIN CONTROL CENTER
          </span>

          <h1>Moderation Panel</h1>

          <p>
            Review and manage content submitted by the
            Elaris-One community.
          </p>
        </div>

        <button
          className="admin-refresh"
          onClick={loadQueue}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "admin-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="admin-summary">
        <div className="admin-summary-card">
          <span>Total Pending</span>
          <strong>{totalPending}</strong>
        </div>

        <div className="admin-summary-card">
          <span>Notes</span>
          <strong>{queue.notes.length}</strong>
        </div>

        <div className="admin-summary-card">
          <span>PYQs</span>
          <strong>{queue.pyqs.length}</strong>
        </div>

        <div className="admin-summary-card">
          <span>Opportunities</span>
          <strong>{queue.opportunities.length}</strong>
        </div>
      </div>

      {error && (
        <div className="admin-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === "notes" ? "active" : ""}
          onClick={() => {
  setActiveTab("notes");
  setSelectedContentIds(new Set());
}}
        >
          <FileText size={17} />
          Notes
          <span>{queue.notes.length}</span>
        </button>

        <button
          className={activeTab === "pyqs" ? "active" : ""}
          onClick={() => {
  setActiveTab("pyqs");
  setSelectedContentIds(new Set());
}}
        >
          <FileText size={17} />
          PYQs
          <span>{queue.pyqs.length}</span>
        </button>

        <button
          className={
            activeTab === "opportunities" ? "active" : ""
          }
          onClick={() => {
  setActiveTab("opportunities");
  setSelectedContentIds(new Set());
}}
        >
          <Briefcase size={17} />
          Opportunities
          <span>{queue.opportunities.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="admin-empty">
          <RefreshCw size={28}
className="admin-spin" />
          <p>Loading moderation queue...</p>
        </div>
      ) : (
        <>
          {activeTab === "notes" && (
            <div className="admin-list">
              {queue.notes.length === 0 ? (
                <EmptyState message="No pending notes." />
              ) : (
                queue.notes.map((item) => (
                  <NoteCard
                    key={item.id}
                    item={item}
                    processing={processingId === item.id}
                    onApprove={approveItem}
                    onReject={openRejectModal}
                    onDelete={deleteItem}
                    />
                ))
              )}
            </div>
          )}

          {activeTab === "pyqs" && (
            <div className="admin-list">
              {queue.pyqs.length === 0 ? (
                <EmptyState message="No pending PYQs." />
              ) : (
                queue.pyqs.map((item) => (
                  <PYQCard
                    key={item.id}
                    item={item}
                    processing={processingId === item.id}
                    onApprove={approveItem}
                    onReject={openRejectModal}
                    onDelete={deleteItem}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="admin-list">
              {queue.opportunities.length === 0 ? (
                <EmptyState message="No pending opportunities." />
              ) : (
                queue.opportunities.map((item) => (
                  <OpportunityCard
                    key={item.id}
                    item={item}
                    processing={processingId === item.id}
                    onApprove={approveItem}
                    onReject={openRejectModal}
                    onDelete={deleteItem}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* ALL CONTENT MANAGEMENT */}
      <section className="admin-all-content">
        <div className="admin-section-header">
          <div>
            <span className="admin-eyebrow">
              CONTENT MANAGEMENT
            </span>

            <h2>All Content</h2>

            <p>
              Manage and permanently delete content
              across Elaris-One.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh"
            onClick={loadAllContent}
            disabled={contentDeleting}
          >
            <RefreshCw
              size={17}
              className={
                contentDeleting
                  ? "admin-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* CONTENT TABS */}
        <div className="admin-tabs">
          <button
            className={
              activeTab === "notes" ? "active" : ""
            }
            onClick={() => {
              setActiveTab("notes");
              setSelectedContentIds(new Set());
            }}
          >
            <FileText size={17} />
            Notes
            <span>{allContent.notes.length}</span>
          </button>

          <button
            className={
              activeTab === "pyqs" ? "active" : ""
            }
            onClick={() => {
              setActiveTab("pyqs");
              setSelectedContentIds(new Set());
            }}
          >
            <FileText size={17} />
            PYQs
            <span>{allContent.pyqs.length}</span>
          </button>

          <button
            className={
              activeTab === "opportunities"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveTab("opportunities");
              setSelectedContentIds(new Set());
            }}
          >
            <Briefcase size={17} />
            Opportunities
            <span>
              {allContent.opportunities.length}
            </span>
          </button>
        </div>

        {/* BULK ACTION BAR */}
        <div className="admin-bulk-toolbar">
          <label className="admin-select-all">
            <input
              type="checkbox"
              checked={allContentSelected}
              onChange={toggleContentSelectAll}
              disabled={
                currentContentItems.length === 0 ||
                contentDeleting
              }
            />

            <span>
              {selectedContentCount > 0
                ? `${selectedContentCount} selected`
                : "Select all"}
            </span>
          </label>

          {selectedContentCount > 0 && (
            <button
              type="button"
              className="admin-bulk-delete"
              onClick={deleteSelectedContent}
              disabled={contentDeleting}
            >
              <Trash2 size={17} />

              {contentDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedContentCount})`}
            </button>
          )}
        </div>

        {/* ALL CONTENT LIST */}
        <div className="admin-content-list">
          {currentContentItems.length === 0 ? (
            <div className="admin-content-empty">
              <FileText size={38} />

              <h3>
                No{" "}
                {activeTab === "notes"
                  ? "notes"
                  : activeTab === "pyqs"
                  ? "PYQs"
                  : "opportunities"}{" "}
                found
              </h3>

              <p>
                There is currently no content
                available in this section.
              </p>
            </div>
          ) : (
            currentContentItems.map((item) => {
              const isSelected =
                selectedContentIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={
                    isSelected
                      ? "admin-content-item selected"
                      : "admin-content-item"
                  }
                >
                  <label className="admin-content-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleContentSelection(
                          item.id
                        )
                      }
                      disabled={contentDeleting}
                    />
                  </label>

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
                            Semester{" "}
                            {item.semester}
                          </span>

                          <span>
                            {item.branch ||
                              "All Branches"}
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
                            Semester{" "}
                            {item.semester}
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
                            {item.type ||
                              "Opportunity"}
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

                  <button
                    type="button"
                    className="admin-delete"
                    onClick={() =>
                      deleteAllContentItem(
                        activeTab,
                        item.id,
                        item.title
                      )
                    }
                    disabled={contentDeleting}
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {rejectTarget && (
        <RejectModal
          target={rejectTarget}
          selectedReasons={selectedReasons}
          adminNote={adminNote}
          processing={processingId === rejectTarget.itemId}
          onToggleReason={toggleReason}
          onAdminNoteChange={setAdminNote}
          onCancel={closeRejectModal}
          onConfirm={rejectItem}
        />
      )}
    </div>
  );
}

function AIInfo({
  item,
}: {
  item: ModerationBase;
}) {
  return (
    <div className="admin-ai">
      <div>
        <span>AI STATUS</span>
        <strong>{item.moderationStatus}</strong>
      </div>

      {item.moderationScore !== null &&
        item.moderationScore !== undefined && (
          <div>
            <span>AI SCORE</span>
            <strong>
              {(item.moderationScore * 100).toFixed(0)}%
            </strong>
          </div>
        )}

      {item.moderationSummary && (
        <div className="admin-ai-summary">
          <span>AI SUMMARY</span>
          <p>{item.moderationSummary}</p>
        </div>
      )}

      {item.moderationReasons?.length > 0 && (
        <div className="admin-reasons">
          <span>AI REASONS</span>
          <ul>
            {item.moderationReasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {item.moderationCategories?.length > 0 && (
        <div className="admin-categories">
          {item.moderationCategories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      )}
    </div>
  );
}
type ActionButtonsProps = {
  itemType: "note" | "pyq" | "opportunity";
  itemId: string;
  title: string;
  processing: boolean;
  onApprove: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string
  ) => void;
  onReject: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => void;
  onDelete: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => void;
};

function ActionButtons({
  itemType,
  itemId,
  title,
  processing,
  onApprove,
  onReject,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div className="admin-actions">
      <button
        className="admin-delete"
        disabled={processing}
        onClick={() =>
          onDelete(itemType, itemId, title)
        }
        title="Permanently delete"
      >
        <Trash2 size={17} />
        Delete
      </button>
      <button
        className="admin-reject"
        disabled={processing}
        onClick={() =>
          onReject(itemType, itemId, title)
        }
      >
        <XCircle size={17} />
        Reject
      </button>

      <button
        className="admin-approve"
        disabled={processing}
        onClick={() =>
          onApprove(itemType, itemId)
        }
      >
        <CheckCircle size={17} />
        {processing ? "Processing..." : "Approve"}
      </button>
    </div>
  );
}

function NoteCard({
  item,
  processing,
  onApprove,
  onReject,
onDelete,
}: {
  item: NoteItem;
  processing: boolean;
  onApprove: ActionButtonsProps["onApprove"];
  onReject: ActionButtonsProps["onReject"];
  onDelete: ActionButtonsProps["onDelete"];
}) {
  return (
    <article className="admin-card">
      <div className="admin-card-main">
        <div className="admin-card-title">
          <FileText size={21} />
          <div>
            <h3>{item.title}</h3>
            <p>
              {item.subject?.name || "Unknown subject"}{" "}
              {item.subject?.code
                ? `(${item.subject.code})`
                : ""}
            </p>
          </div>
        </div>

        <div className="admin-meta">
          <span>Semester {item.semester}</span>
          <span>{item.branch}</span>
          <span>
            {item.uploadedBy?.fullName ||
              "Unknown uploader"}
          </span>
        </div>

        {item.description && (
          <p className="admin-description">
            {item.description}
          </p>
        )}

        <AIInfo item={item} />

        <div className="admin-card-footer">
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            Open PDF
          </a>

          <ActionButtons
            itemType="note"
            itemId={item.id}
            title={item.title}
            processing={processing}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}

function PYQCard({
  item,
  processing,
  onApprove,
  onReject,
  onDelete,
}: {
  item: PYQItem;
  processing: boolean;
  onApprove: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string
  ) => void;
  onReject: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => void;
  onDelete: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => void;
}) {  return (
    <article className="admin-card">
      <div className="admin-card-main">
        <div className="admin-card-title">
          <FileText size={21} />
          <div>
            <h3>{item.title}</h3>
            <p>
              {item.subject?.name || "Unknown subject"}{" "}
              {item.subject?.code
                ? `(${item.subject.code})`
                : ""}
            </p>
          </div>
        </div>

        <div className="admin-meta">
          <span>Semester {item.semester}</span>
          <span>{item.branch}</span>
          <span>Year {item.year}</span>
          <span>
            {item.uploadedBy?.fullName ||
              "Unknown uploader"}
          </span>
        </div>

        <AIInfo item={item} />

        <div className="admin-card-footer">
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            Open PDF
          </a>

          <ActionButtons
            itemType="pyq"
            itemId={item.id}
            title={item.title}
            processing={processing}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}
function OpportunityCard({
  item,
  processing,
  onApprove,
  onReject,
  onDelete,
}: {
  item: OpportunityItem;
  processing: boolean;
  onApprove: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string
  ) => void;
  onReject: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => void;
  onDelete: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    title: string
  ) => void;
}) {
    return (
    <article className="admin-card">
      <div className="admin-card-main">
        <div className="admin-card-title">
          <Briefcase size={21} />
          <div>
            <h3>{item.title}</h3>
            <p>
              {item.company || "Company not specified"}
            </p>
          </div>
        </div>

        <div className="admin-meta">
          <span>{item.type}</span>

          {item.location && (
            <span>{item.location}</span>
          )}

          <span>
            {item.postedBy?.fullName ||
              "Unknown uploader"}
          </span>
        </div>

        <p className="admin-description">
          {item.description}
        </p>

        {item.deadline && (
          <div className="admin-deadline">
            Deadline:{" "}
            {new Date(item.deadline).toLocaleDateString()}
          </div>
        )}

        <AIInfo item={item} />

        <div className="admin-card-footer">
          {item.applyLink && (
            <a
              href={item.applyLink}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} />
              View Application Link
            </a>
          )}

          <ActionButtons
            itemType="opportunity"
            itemId={item.id}
            title={item.title}
            processing={processing}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}

function RejectModal({
  target,
  selectedReasons,
  adminNote,
  processing,
  onToggleReason,
  onAdminNoteChange,
  onCancel,
  onConfirm,
}: {
  target: NonNullable<RejectTarget>;
  selectedReasons: string[];
  adminNote: string;
  processing: boolean;
  onToggleReason: (reason: string) => void;
  onAdminNoteChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
      >
        <div className="admin-modal-header">
          <div className="admin-modal-icon">
            <ShieldAlert size={22} />
          </div>

          <div>
            <h2 id="reject-modal-title">
              Reject submission
            </h2>
            <p>
              Select at least one reason for rejecting this
              content.
            </p>
          </div>

          <button
            type="button"
            className="admin-modal-close"
            onClick={onCancel}
            disabled={processing}
            aria-label="Close"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="admin-modal-content">
          <div className="admin-modal-item">
            <span>SUBMISSION</span>
            <strong>{target.title}</strong>
          </div>

          <div className="admin-rejection-reasons">
            <span className="admin-modal-label">
              REJECTION REASONS
            </span>

            {REJECTION_REASONS.map((reason) => {
              const selected =
                selectedReasons.includes(reason);

              return (
                <label
                  key={reason}
                  className={`admin-reason-option ${
                    selected ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      onToggleReason(reason)
                    }
                  />

                  <span>{reason}</span>
                </label>
              );
            })}
          </div>

          <div className="admin-modal-field">
            <label htmlFor="admin-rejection-note">
              Admin note
              <span>Optional</span>
            </label>

            <textarea
              id="admin-rejection-note"
              value={adminNote}
              onChange={(event) =>
                onAdminNoteChange(event.target.value)
              }
              placeholder="Add additional context for this decision..."
              rows={4}
              maxLength={500}
            />

            <small>{adminNote.length}/500</small>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-modal-cancel"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-modal-confirm"
            onClick={onConfirm}
            disabled={
              processing || selectedReasons.length === 0
            }
          >
            <XCircle size={17} />
            {processing
              ? "Rejecting..."
              : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="admin-empty">
      <CheckCircle size={32} />
      <h3>All clear</h3>
      <p>{message}</p>
    </div>
  );
}
