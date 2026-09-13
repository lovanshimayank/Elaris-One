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

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      loadQueue();
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
          onClick={() => setActiveTab("notes")}
        >
          <FileText size={17} />
          Notes
          <span>{queue.notes.length}</span>
        </button>

        <button
          className={activeTab === "pyqs" ? "active" : ""}
          onClick={() => setActiveTab("pyqs")}
        >
          <FileText size={17} />
          PYQs
          <span>{queue.pyqs.length}</span>
        </button>

        <button
          className={
            activeTab === "opportunities" ? "active" : ""
          }
          onClick={() => setActiveTab("opportunities")}
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
