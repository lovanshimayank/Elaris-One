import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { UploadCloud, FileText, FileQuestion, Briefcase, CheckCircle2, Clock3, XCircle } from "lucide-react";
import api from "../../services/api";

type UploadType = "NOTES" | "PYQS" | "OPPORTUNITIES";

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  departmentId: string;
}

interface UploadResult {
  status: "APPROVED" | "PENDING" | "REJECTED";
  message: string;
}

function UploadCenter() {
  const [activeTab, setActiveTab] = useState<UploadType>("NOTES");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  // -----------------------------
  // Notes
  // -----------------------------
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteSemester, setNoteSemester] = useState("");
  const [noteBranch, setNoteBranch] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);

  // -----------------------------
  // PYQ
  // -----------------------------
  const [pyqTitle, setPyqTitle] = useState("");
  const [pyqSubject, setPyqSubject] = useState("");
  const [pyqSemester, setPyqSemester] = useState("");
  const [pyqBranch, setPyqBranch] = useState("");
  const [pyqYear, setPyqYear] = useState("");
  const [pyqFile, setPyqFile] = useState<File | null>(null);

  // -----------------------------
  // Opportunity
  // -----------------------------
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [opportunityDescription, setOpportunityDescription] = useState("");
  const [opportunityCompany, setOpportunityCompany] = useState("");
  const [opportunityType, setOpportunityType] = useState("INTERNSHIP");
  const [opportunityLocation, setOpportunityLocation] = useState("");
  const [opportunityApplyLink, setOpportunityApplyLink] = useState("");
  const [opportunityDeadline, setOpportunityDeadline] = useState("");

  // -----------------------------
  // Fetch subjects
  // -----------------------------
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);

        const response = await api.get("/subjects");

        const data = response.data?.data;

        if (Array.isArray(data)) {
          setSubjects(data);
        } else if (Array.isArray(data?.subjects)) {
          setSubjects(data.subjects);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // -----------------------------
  // Reset messages
  // -----------------------------
  const resetMessages = () => {
    setError("");
    setResult(null);
  };

  const switchTab = (tab: UploadType) => {
    setActiveTab(tab);
    resetMessages();
  };

  // -----------------------------
  // Upload file
  // -----------------------------
  const uploadFile = async (
    file: File,
    folder: "notes" | "pyqs"
  ) => {
    const formData = new FormData();

    // IMPORTANT:
    // folder comes before file because multer
    // uses req.body.folder in destination()
    formData.append("folder", folder);
    formData.append("file", file);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.data?.url as string;
  };

  // -----------------------------
  // Notes submit
  // -----------------------------
  const submitNote = async (event: FormEvent) => {
    event.preventDefault();

    resetMessages();

    if (!noteTitle.trim()) {
      setError("Please enter a note title.");
      return;
    }

    if (!noteSubject) {
      setError("Please select a subject.");
      return;
    }

    if (!noteSemester) {
      setError("Please select a semester.");
      return;
    }

    if (!noteBranch.trim()) {
      setError("Please enter the branch.");
      return;
    }

    if (!noteFile) {
      setError("Please select a PDF file.");
      return;
    }

    if (noteFile.type !== "application/pdf") {
      setError("Notes must be uploaded as a PDF.");
      return;
    }

    try {
      setUploading(true);

      const pdfUrl = await uploadFile(noteFile, "notes");

      const response = await api.post("/notes", {
        title: noteTitle.trim(),
        description: noteDescription.trim() || undefined,
        subjectId: noteSubject,
        semester: Number(noteSemester),
        branch: noteBranch.trim(),
        pdfUrl,
      });

      const data = response.data?.data;

      const moderationStatus =
        data?.moderationStatus || "PENDING";

      if (moderationStatus === "APPROVED") {
        setResult({
          status: "APPROVED",
          message:
            response.data?.message ||
            "Note uploaded and approved by AI moderation.",
        });
      } else if (moderationStatus === "REJECTED") {
        setResult({
          status: "REJECTED",
          message:
            response.data?.message ||
            "Note was rejected by AI content moderation.",
        });
      } else {
        setResult({
          status: "PENDING",
          message:
            response.data?.message ||
            "Note uploaded successfully and is awaiting moderation.",
        });
      }

      setNoteTitle("");
      setNoteDescription("");
      setNoteSubject("");
      setNoteSemester("");
      setNoteBranch("");
      setNoteFile(null);
    } catch (err: any) {
      console.error("Note upload failed:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to upload note. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // PYQ submit
  // -----------------------------
  const submitPYQ = async (event: FormEvent) => {
    event.preventDefault();

    resetMessages();

    if (!pyqTitle.trim()) {
      setError("Please enter a PYQ title.");
      return;
    }

    if (!pyqSubject) {
      setError("Please select a subject.");
      return;
    }

    if (!pyqSemester) {
      setError("Please select a semester.");
      return;
    }

    if (!pyqBranch.trim()) {
      setError("Please enter the branch.");
      return;
    }

    if (!pyqYear) {
      setError("Please enter the exam year.");
      return;
    }

    if (!pyqFile) {
      setError("Please select a PDF file.");
      return;
    }

    if (pyqFile.type !== "application/pdf") {
      setError("PYQs must be uploaded as a PDF.");
      return;
    }

    try {
      setUploading(true);

      const pdfUrl = await uploadFile(pyqFile, "pyqs");

      const response = await api.post("/pyqs", {
        title: pyqTitle.trim(),
        subjectId: pyqSubject,
        semester: Number(pyqSemester),
        branch: pyqBranch.trim(),
        year: Number(pyqYear),
        pdfUrl,
      });

      const data = response.data?.data;

      const moderationStatus =
        data?.moderationStatus || "PENDING";

      if (moderationStatus === "APPROVED") {
        setResult({
          status: "APPROVED",
          message:
            "PYQ uploaded and approved by AI moderation. It is now visible to the campus.",
        });
      } else if (moderationStatus === "REJECTED") {
        setResult({
          status: "REJECTED",
          message:
            "PYQ was rejected by AI content moderation.",
        });
      } else {
        setResult({
          status: "PENDING",
          message:
            "PYQ uploaded successfully and is awaiting moderation.",
        });
      }

      setPyqTitle("");
      setPyqSubject("");
      setPyqSemester("");
      setPyqBranch("");
      setPyqYear("");
      setPyqFile(null);
    } catch (err: any) {
      console.error("PYQ upload failed:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to upload PYQ. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // Opportunity submit
  // -----------------------------
  const submitOpportunity = async (event: FormEvent) => {
    event.preventDefault();

    resetMessages();

    if (!opportunityTitle.trim()) {
      setError("Please enter an opportunity title.");
      return;
    }

    if (!opportunityDescription.trim()) {
      setError("Please enter an opportunity description.");
      return;
    }

    try {
      setUploading(true);

      const response = await api.post("/opportunities", {
        title: opportunityTitle.trim(),
        description: opportunityDescription.trim(),
        company:
          opportunityCompany.trim() || undefined,
        type: opportunityType,
        location:
          opportunityLocation.trim() || undefined,
        applyLink:
          opportunityApplyLink.trim() || undefined,
        deadline:
          opportunityDeadline
            ? new Date(opportunityDeadline).toISOString()
            : undefined,
      });

      const data = response.data?.data;

      const moderationStatus =
        data?.moderationStatus || "PENDING";

      if (moderationStatus === "APPROVED") {
        setResult({
          status: "APPROVED",
          message:
            "Opportunity uploaded and approved by AI moderation. It is now visible to the campus.",
        });
      } else if (moderationStatus === "REJECTED") {
        setResult({
          status: "REJECTED",
          message:
            "Opportunity was rejected by AI content moderation.",
        });
      } else {
        setResult({
          status: "PENDING",
          message:
            "Opportunity submitted successfully and is awaiting moderation.",
        });
      }

      setOpportunityTitle("");
      setOpportunityDescription("");
      setOpportunityCompany("");
      setOpportunityType("INTERNSHIP");
      setOpportunityLocation("");
      setOpportunityApplyLink("");
      setOpportunityDeadline("");
    } catch (err: any) {
      console.error("Opportunity upload failed:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to submit opportunity. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const renderSubjects = () => {
    if (loadingSubjects) {
      return <option value="">Loading subjects...</option>;
    }

    if (subjects.length === 0) {
      return <option value="">No subjects available</option>;
    }

    return (
      <>
        <option value="">Select subject</option>

        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.code} — {subject.name}
          </option>
        ))}
      </>
    );
  };

  return (
    <div className="dashboard-page upload-center-page">
      {/* Header */}
      <div className="upload-header">
        <div>
          <span className="page-eyebrow">
            CAMPUS CONTRIBUTION
          </span>

          <h1>Upload Center</h1>

          <p>
            Share notes, previous year questions and opportunities
            with your campus community.
          </p>
        </div>

        <div className="upload-header-icon">
          <UploadCloud size={28} />
        </div>
      </div>

      {/* Tabs */}
      <div className="upload-tabs">
        <button
          type="button"
          className={
            activeTab === "NOTES"
              ? "upload-tab active"
              : "upload-tab"
          }
          onClick={() => switchTab("NOTES")}
        >
          <FileText size={18} />
          <span>Notes</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "PYQS"
              ? "upload-tab active"
              : "upload-tab"
          }
          onClick={() => switchTab("PYQS")}
        >
          <FileQuestion size={18} />
          <span>PYQs</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "OPPORTUNITIES"
              ? "upload-tab active"
              : "upload-tab"
          }
          onClick={() => switchTab("OPPORTUNITIES")}
        >
          <Briefcase size={18} />
          <span>Opportunities</span>
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="upload-alert upload-alert-error">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div
          className={`upload-alert ${
            result.status === "APPROVED"
              ? "upload-alert-success"
              : result.status === "REJECTED"
              ? "upload-alert-error"
              : "upload-alert-pending"
          }`}
        >
          {result.status === "APPROVED" && (
            <CheckCircle2 size={20} />
          )}

          {result.status === "PENDING" && (
            <Clock3 size={20} />
          )}

          {result.status === "REJECTED" && (
            <XCircle size={20} />
          )}

          <span>{result.message}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="upload-card">
        {/* NOTES */}
        {activeTab === "NOTES" && (
          <form onSubmit={submitNote}>
            <div className="upload-form-heading">
              <div className="upload-form-icon">
                <FileText size={20} />
              </div>

              <div>
                <h2>Upload Study Notes</h2>
                <p>
                  Share useful study material with your campus.
                </p>
              </div>
            </div>

            <div className="upload-form-grid">
              <div className="upload-field full">
                <label>Note Title *</label>

                <input
                  type="text"
                  placeholder="e.g. Operating Systems Unit 1 Notes"
                  value={noteTitle}
                  onChange={(e) =>
                    setNoteTitle(e.target.value)
                  }
                />
              </div>

              <div className="upload-field full">
                <label>Description</label>

                <textarea
                  placeholder="Briefly describe the contents of these notes..."
                  value={noteDescription}
                  onChange={(e) =>
                    setNoteDescription(e.target.value)
                  }
                  rows={4}
                />
              </div>

              <div className="upload-field">
                <label>Subject *</label>

                <select
                  value={noteSubject}
                  onChange={(e) =>
                    setNoteSubject(e.target.value)
                  }
                >
                  {renderSubjects()}
                </select>
              </div>

              <div className="upload-field">
                <label>Semester *</label>

                <select
                  value={noteSemester}
                  onChange={(e) =>
                    setNoteSemester(e.target.value)
                  }
                >
                  <option value="">
                    Select semester
                  </option>

                  {Array.from(
                    { length: 8 },
                    (_, index) => index + 1
                  ).map((semester) => (
                    <option
                      key={semester}
                      value={semester}
                    >
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="upload-field">
                <label>Branch *</label>

                <input
                  type="text"
                  placeholder="e.g. CSE-AIML"
                  value={noteBranch}
                  onChange={(e) =>
                    setNoteBranch(e.target.value)
                  }
                />
              </div>

              <div className="upload-field">
                <label>PDF File *</label>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setNoteFile(
                      e.target.files?.[0] || null
                    )
                  }
                />

                {noteFile && (
                  <small>
                    Selected: {noteFile.name}
                  </small>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="upload-submit-button"
              disabled={uploading}
            >
              <UploadCloud size={18} />

              {uploading
                ? "Uploading..."
                : "Upload Notes"}
            </button>
          </form>
        )}

        {/* PYQS */}
        {activeTab === "PYQS" && (
          <form onSubmit={submitPYQ}>
            <div className="upload-form-heading">
              <div className="upload-form-icon">
                <FileQuestion size={20} />
              </div>

              <div>
                <h2>Upload Previous Year Question Paper</h2>
                <p>
                  Help students prepare using previous examination papers.
                </p>
              </div>
            </div>

            <div className="upload-form-grid">
              <div className="upload-field full">
                <label>PYQ Title *</label>

                <input
                  type="text"
                  placeholder="e.g. DBMS End Semester Examination"
                  value={pyqTitle}
                  onChange={(e) =>
                    setPyqTitle(e.target.value)
                  }
                />
              </div>

              <div className="upload-field">
                <label>Subject *</label>

                <select
                  value={pyqSubject}
                  onChange={(e) =>
                    setPyqSubject(e.target.value)
                  }
                >
                  {renderSubjects()}
                </select>
              </div>

              <div className="upload-field">
                <label>Semester *</label>

                <select
                  value={pyqSemester}
                  onChange={(e) =>
                    setPyqSemester(e.target.value)
                  }
                >
                  <option value="">
                    Select semester
                  </option>

                  {Array.from(
                    { length: 8 },
                    (_, index) => index + 1
                  ).map((semester) => (
                    <option
                      key={semester}
                      value={semester}
                    >
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="upload-field">
                <label>Branch *</label>

                <input
                  type="text"
                  placeholder="e.g. CSE-AIML"
                  value={pyqBranch}
                  onChange={(e) =>
                    setPyqBranch(e.target.value)
                  }
                />
              </div>

              <div className="upload-field">
                <label>Exam Year *</label>

                <input
                  type="number"
                  placeholder="e.g. 2025"
                  min="2000"
                  max="2100"
                  value={pyqYear}
                  onChange={(e) =>
                    setPyqYear(e.target.value)
                  }
                />
              </div>

              <div className="upload-field full">
                <label>PDF File *</label>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setPyqFile(
                      e.target.files?.[0] || null
                    )
                  }
                />

                {pyqFile && (
                  <small>
                    Selected: {pyqFile.name}
                  </small>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="upload-submit-button"
              disabled={uploading}
            >
              <UploadCloud size={18} />

              {uploading
                ? "Uploading..."
                : "Upload PYQ"}
            </button>
          </form>
        )}

        {/* OPPORTUNITIES */}
        {activeTab === "OPPORTUNITIES" && (
          <form onSubmit={submitOpportunity}>
            <div className="upload-form-heading">
              <div className="upload-form-icon">
                <Briefcase size={20} />
              </div>

              <div>
                <h2>Share an Opportunity</h2>
                <p>
                  Post internships, jobs, hackathons and campus events.
                </p>
              </div>
            </div>

            <div className="upload-form-grid">
              <div className="upload-field full">
                <label>Opportunity Title *</label>

                <input
                  type="text"
                  placeholder="e.g. AI/ML Engineering Internship"
                  value={opportunityTitle}
                  onChange={(e) =>
                    setOpportunityTitle(e.target.value)
                  }
                />
              </div>

              <div className="upload-field full">
                <label>Description *</label>

                <textarea
                  placeholder="Describe the opportunity, eligibility and important details..."
                  value={opportunityDescription}
                  onChange={(e) =>
                    setOpportunityDescription(
                      e.target.value
                    )
                  }
                  rows={5}
                />
              </div>

              <div className="upload-field">
                <label>Company / Organization</label>

                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={opportunityCompany}
                  onChange={(e) =>
                    setOpportunityCompany(e.target.value)
                  }
                />
              </div>

              <div className="upload-field">
                <label>Type *</label>

                <select
                  value={opportunityType}
                  onChange={(e) =>
                    setOpportunityType(e.target.value)
                  }
                >
                  <option value="INTERNSHIP">
                    Internship
                  </option>

                  <option value="JOB">
                    Job
                  </option>

                  <option value="HACKATHON">
                    Hackathon
                  </option>

                  <option value="EVENT">
                    Event
                  </option>
                </select>
              </div>

              <div className="upload-field">
                <label>Location</label>

                <input
                  type="text"
                  placeholder="e.g. Remote / Indore"
                  value={opportunityLocation}
                  onChange={(e) =>
                    setOpportunityLocation(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="upload-field">
                <label>Application Link</label>

                <input
                  type="url"
                  placeholder="https://..."
                  value={opportunityApplyLink}
                  onChange={(e) =>
                    setOpportunityApplyLink(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="upload-field">
                <label>Deadline</label>

                <input
                  type="datetime-local"
                  value={opportunityDeadline}
                  onChange={(e) =>
                    setOpportunityDeadline(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="upload-submit-button"
              disabled={uploading}
            >
              <UploadCloud size={18} />

              {uploading
                ? "Submitting..."
                : "Submit Opportunity"}
            </button>
          </form>
        )}
      </div>

      {/* Moderation information */}
      <div className="upload-info-card">
        <div className="upload-info-icon">
          <CheckCircle2 size={20} />
        </div>

        <div>
          <h3>AI Moderation Enabled</h3>

          <p>
            Every contribution is automatically checked by
            Elaris-One's AI moderation system. Approved content
            becomes available to the campus community, while
            suspicious submissions remain pending for review.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadCenter;