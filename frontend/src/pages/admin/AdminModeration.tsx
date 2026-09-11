import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Briefcase,
  AlertCircle,
  ExternalLink,
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

  const resolveItem = async (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setProcessingId(itemId);
      setError("");

      await api.post("/admin/moderation/resolve", {
        itemType,
        itemId,
        status,
        reasons:
          status === "REJECTED"
            ? ["Rejected by administrator"]
            : [],
        summary:
          status === "APPROVED"
            ? "Approved by administrator."
            : "Rejected by administrator.",
      });

      await loadQueue();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${status.toLowerCase()} item.`
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
          <RefreshCw size={28} className="admin-spin" />
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
                    onResolve={resolveItem}
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
                    onResolve={resolveItem}
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
                    onResolve={resolveItem}
                  />
                ))
              )}
            </div>
          )}
        </>
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

function ActionButtons({
  itemType,
  itemId,
  processing,
  onResolve,
}: {
  itemType: "note" | "pyq" | "opportunity";
  itemId: string;
  processing: boolean;
  onResolve: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    status: "APPROVED" | "REJECTED"
  ) => void;
}) {
  return (
    <div className="admin-actions">
      <button
        className="admin-reject"
        disabled={processing}
        onClick={() =>
          onResolve(itemType, itemId, "REJECTED")
        }
      >
        <XCircle size={17} />
        Reject
      </button>

      <button
        className="admin-approve"
        disabled={processing}
        onClick={() =>
          onResolve(itemType, itemId, "APPROVED")
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
  onResolve,
}: {
  item: NoteItem;
  processing: boolean;
  onResolve: ActionButtonsProps["onResolve"];
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
            processing={processing}
            onResolve={onResolve}
          />
        </div>
      </div>
    </article>
  );
}

function PYQCard({
  item,
  processing,
  onResolve,
}: {
  item: PYQItem;
  processing: boolean;
  onResolve: ActionButtonsProps["onResolve"];
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
            processing={processing}
            onResolve={onResolve}
          />
        </div>
      </div>
    </article>
  );
}

function OpportunityCard({
  item,
  processing,
  onResolve,
}: {
  item: OpportunityItem;
  processing: boolean;
  onResolve: ActionButtonsProps["onResolve"];
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
            processing={processing}
            onResolve={onResolve}
          />
        </div>
      </div>
    </article>
  );
}

type ActionButtonsProps = {
  onResolve: (
    itemType: "note" | "pyq" | "opportunity",
    itemId: string,
    status: "APPROVED" | "REJECTED"
  ) => void;
};

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