import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import api from "../../api/axios";
import "./Reader.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Question = {
  id: string;
  question: string;
  options: string[];
};

type Quiz = {
  id: string;
  title: string;
  quizType: "CHUNK" | "FINAL";
  startPage: number | null;
  endPage: number | null;
  questions: Question[];
};

type ReaderState = {
  resource: {
    id: string;
    title: string;
    pdfUrl: string;
  };
  totalPages: number;
  lastPage: number;
  completed: boolean;
  visitedPages: number[];
};

type ReviewItem = {
  questionId: string;
  correctOption: number;
  explanation?: string | null;
  selectedOption: number | null;
};

type AttemptResult = {
  score: number;
  totalQuestions: number;
};

export default function Reader() {
  const { type = "", id = "" } = useParams();
  const resourceType = type.toUpperCase();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [reader, setReader] = useState<ReaderState | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [review, setReview] = useState<ReviewItem[]>([]);

  

  useEffect(() => {
    let active = true;
    let loadingTask: ReturnType<typeof pdfjsLib.getDocument> | null = null;

    const openPdf = async () => {
      setLoading(true);
      setError("");
      setReader(null);
      setPdf(null);
      setQuiz(null);
      setResult(null);
      setReview([]);

      try {
        if (!id || !["NOTE", "PYQ"].includes(resourceType)) {
          throw new Error("Invalid reader link.");
        }

        const response = await api.get(`/reading/${resourceType}/${id}`);
        const state = response.data.data as ReaderState;

        const baseUrl = new URL(
          api.defaults.baseURL || "http://localhost:5000/api/v1",
          window.location.origin,
        );
        const pdfUrl = new URL(state.resource.pdfUrl, baseUrl.origin);

        // Support legacy download URLs while preserving the current route.
        if (pdfUrl.pathname.startsWith("/downloads/")) {
          pdfUrl.pathname = `/api/v1${pdfUrl.pathname}`;
        }

        // Support legacy download URLs while preserving the current route.
        if (pdfUrl.pathname.startsWith("/downloads/")) {
          pdfUrl.pathname = `/api/v1${pdfUrl.pathname}`;
        }

        if (pdfUrl.origin !== baseUrl.origin) {
          throw new Error("Only PDFs uploaded to this application can be opened here.");
        }

        const fileResponse = await fetch(pdfUrl.toString(), {
          credentials: "include",
        });

        if (!fileResponse.ok) {
          throw new Error(`Unable to load PDF (HTTP ${fileResponse.status}).`);
        }

        const data = await fileResponse.arrayBuffer();
        loadingTask = pdfjsLib.getDocument({
  data: new Uint8Array(data),
});
const loadedPdf = await loadingTask.promise;

if (!active) {
  await loadingTask.destroy();
  return;
}

setReader(state);
setPage(Math.min(Math.max(state.lastPage || 1, 1), state.totalPages));
setPdf(loadedPdf);
      } catch (err) {
        if (active) {
          const message = (
            err as { response?: { data?: { message?: string } }; message?: string }
          ).response?.data?.message ||
            (err as { message?: string }).message ||
            "Unable to open this PDF.";
          setError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void openPdf();

    return () => {
      active = false;
      if (loadingTask) void loadingTask.destroy();
    };
  }, [resourceType, id]);

  useEffect(() => {
    if (!pdf || !canvasRef.current || !reader) return;

    let active = true;
   let renderTask: RenderTask | null = null;

    const renderPage = async () => {
      try {
        const pdfPage = await pdf.getPage(page);
        if (!active || !canvasRef.current) return;

        const viewport = pdfPage.getViewport({ scale: 1.25 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Unable to render the PDF page.");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTask = pdfPage.render({
  canvas,
  canvasContext: context,
  viewport,
});

await renderTask.promise;
        if (!active) return;

        try {
          const response = await api.post(
            `/reading/${resourceType}/${id}/pages/${page}`,
          );
          setReader((current) =>
            current ? { ...current, ...response.data.data,
              visitedPages: response.data.data.visitedPages ?? [
                ...new Set([...current.visitedPages, page]),
              ] } : current,
          );
        } catch {
          // Keep the page visible even if progress saving temporarily fails.
          setError("Page opened, but progress could not be saved. Check your connection.");
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message || "Unable to render this page.");
        }
      }
    };

    void renderPage();

    return () => {
      active = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdf, page, reader?.resource.id, resourceType, id]);

  const visited = new Set(reader?.visitedPages ?? []);
  const allPagesRead = Boolean(
    reader && reader.totalPages > 0 &&
    Array.from({ length: reader.totalPages }, (_, index) => index + 1)
      .every((number) => visited.has(number)),
  );

  const generateQuiz = async (quizType: "CHUNK" | "FINAL", startPage?: number) => {
    setBusy(true);
    setError("");
    setResult(null);
    setReview([]);

    try {
      const response = await api.post(`/reading/${resourceType}/${id}/quizzes`, {
        quizType,
        ...(quizType === "CHUNK" ? { startPage } : {}),
      });
      setQuiz(response.data.data as Quiz);
      setAnswers([]);
    } catch (err) {
      const message = (
        err as { response?: { data?: { message?: string } }; message?: string }
      ).response?.data?.message ||
        (err as { message?: string }).message ||
        "Unable to generate the quiz.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const submitQuiz = async () => {
    if (!quiz || answers.length !== quiz.questions.length ||
        answers.some((answer) => !Number.isInteger(answer))) {
      setError("Answer every question before submitting.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await api.post(
        `/reading/quizzes/${quiz.id}/attempts`,
        { answers },
        { headers: { "Idempotency-Key": crypto.randomUUID() } },
      );

      setResult(response.data.data.attempt as AttemptResult);
      setReview(response.data.data.review as ReviewItem[]);
    } catch (err) {
      const message = (
        err as { response?: { data?: { message?: string } }; message?: string }
      ).response?.data?.message ||
        (err as { message?: string }).message ||
        "Unable to submit the quiz.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main style={{ padding: 24 }}>Loading PDF reader…</main>;

  if (error && !reader) {
    return (
      <main style={{ padding: 24 }}>
        <p role="alert">{error}</p>
        <Link to={resourceType === "PYQ" ? "/pyqs" : "/notes"}>Back</Link>
      </main>
    );
  }

  if (!reader || !pdf) return <main style={{ padding: 24 }}>PDF unavailable.</main>;

  const chunks: number[] = [];
  for (let start = 1; start <= reader.totalPages; start += 5) {
    chunks.push(start);
  }

  return (
    <main className="reader-page" style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <p>
        <Link to={resourceType === "PYQ" ? "/pyqs" : "/notes"}>
          ← Back to {resourceType === "PYQ" ? "PYQs" : "Notes"}
        </Link>
      </p>

      <h1>{reader.resource.title}</h1>
      <p>
        Page {page} of {reader.totalPages} · {visited.size} pages visited
      </p>

      {error && <p role="alert">{error}</p>}

      <section style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous page
        </button>
        <button
          disabled={page >= reader.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next page
        </button>
        <label>
          Go to page{" "}
          <input
            aria-label="Go to page"
            type="number"
            min={1}
            max={reader.totalPages}
            value={page}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 1 && value <= reader.totalPages) {
                setPage(value);
              }
            }}
            style={{ width: 70 }}
          />
        </label>
      </section>

      <div className="reader-pdf-frame" style={{ overflow: "auto", background: "#f3f4f6", padding: 12 }}>
        <canvas
          ref={canvasRef}
          aria-label={`PDF page ${page}`}
          style={{ display: "block", maxWidth: "100%", height: "auto", margin: "0 auto" }}
        />
      </div>

      <section className="reader-chunks" style={{ marginTop: 24 }}>
        <h2>Page-block quizzes</h2>
        {chunks.map((start) => {
          const end = Math.min(start + 4, reader.totalPages);
          const ready = Array.from(
            { length: end - start + 1 },
            (_, index) => start + index,
          ).every((number) => visited.has(number));

          return (
            <button
              key={start}
              disabled={!ready || busy}
              onClick={() => void generateQuiz("CHUNK", start)}
              style={{ margin: "4px 8px 4px 0" }}
            >
              {ready ? `Quiz: pages ${start}–${end}` : `Read pages ${start}–${end}`}
            </button>
          );
        })}

        <div style={{ marginTop: 12 }}>
          <button
            disabled={!allPagesRead || busy}
            onClick={() => void generateQuiz("FINAL")}
          >
            {allPagesRead ? "Generate final assessment" : "Read all pages to unlock final assessment"}
          </button>
        </div>
      </section>

      {quiz && (
        <section className="reader-quiz" style={{ marginTop: 28, borderTop: "1px solid #ddd", paddingTop: 20 }}>
          <h2>{quiz.title}</h2>
          {quiz.questions.map((question, index) => (
            <fieldset key={question.id} style={{ marginBottom: 16 }}>
              <legend>{index + 1}. {question.question}</legend>
              {question.options.map((option, optionIndex) => (
                <label key={`${question.id}-${optionIndex}`} style={{ display: "block", padding: 4 }}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[index] === optionIndex}
                    disabled={Boolean(result)}
                    onChange={() => setAnswers((current) => {
                      const next = [...current];
                      next[index] = optionIndex;
                      return next;
                    })}
                  />{" "}
                  {option}
                </label>
              ))}
            </fieldset>
          ))}

          {!result ? (
            <button disabled={busy} onClick={() => void submitQuiz()}>
              {busy ? "Processing…" : "Submit answers"}
            </button>
          ) : (
            <>
              <div className="reader-score-sheet">
                <div className="score-sheet-topline">
                  <span className="score-sheet-label">Assessment results</span>
                  <span className="score-sheet-status">Completed</span>
                </div>
                <div className="score-sheet-main">
                  <div>
                    <div className="score-sheet-label">Your score</div>
                    <div className="score-sheet-number">
                      {result.score}<span> / {result.totalQuestions}</span>
                    </div>
                    <p className="score-sheet-subtitle">
                      {result.totalQuestions > 0
                        ? Math.round((result.score / result.totalQuestions) * 100) + "% accuracy"
                        : "No questions scored"}
                    </p>
                    <div
                      className="score-sheet-progress"
                      role="progressbar"
                      aria-label="Assessment score"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={result.totalQuestions > 0
                        ? Math.round((result.score / result.totalQuestions) * 100)
                        : 0}
                    >
                      <div
                        className="score-sheet-progress-fill"
                        style={{
                          width: (result.totalQuestions > 0
                            ? Math.max(0, Math.min(100, (result.score / result.totalQuestions) * 100))
                            : 0) + "%"
                        }}
                      />
                    </div>
                  </div>
                  <div className="score-sheet-stats">
                    <div className="score-sheet-stat">
                      <strong>{result.score}</strong>
                      <span>Correct answers</span>
                    </div>
                    <div className="score-sheet-stat">
                      <strong>{Math.max(0, result.totalQuestions - result.score)}</strong>
                      <span>Incorrect or missed</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="score-review-heading">Answer review</h3>
              {review.map((item, index) => (
                <article
                  key={item.questionId}
                  className={"score-review-item" + (item.selectedOption === item.correctOption ? "" : " is-incorrect")}
                >
                  <span className="score-review-result">
                    {item.selectedOption === item.correctOption ? "Correct answer" : "Review this answer"}
                  </span>
                  <p><strong>Question {index + 1}</strong></p>
                  <p>Your answer: {item.selectedOption == null ? "Not answered" : "Option " + (item.selectedOption + 1)}</p>
                  <p>Correct answer: Option {item.correctOption + 1}</p>
                  {item.explanation && <p>{item.explanation}</p>}
                </article>
              ))}
            </>
          )}
        </section>
      )}
    </main>
  );
}
