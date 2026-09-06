import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
      });

      const reply = response.data?.data?.reply;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply || "No response received.",
        },
      ]);
    } catch (error: any) {
      console.error("AI request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Sorry, I couldn't generate a response.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([]);
  };

  const useSuggestion = (text: string) => {
    setMessage(text);
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div>
          <div className="ai-title-row">
            <div className="ai-logo">✦</div>

            <div>
              <h1>Elaris AI</h1>

              <div className="ai-status">
                <span className="ai-status-dot" />
                Online
              </div>
            </div>
          </div>

          <p>
            Your intelligent campus assistant for academics,
            study resources and opportunities.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            className="ai-clear-button"
            onClick={clearChat}
            disabled={loading}
          >
            Clear chat
          </button>
        )}
      </div>

      <div className="ai-chat-container">
        {messages.length === 0 ? (
          <div className="ai-empty-state">
            <div className="ai-empty-icon">✦</div>

            <h2>How can I help you?</h2>

            <p>
              Ask Elaris about your studies, subjects,
              exams, programming or campus opportunities.
            </p>

            <div className="ai-suggestions">
              <button
                type="button"
                onClick={() =>
                  useSuggestion(
                    "Explain DBMS normalization in simple terms with an example."
                  )
                }
              >
                📚 Explain DBMS normalization
              </button>

              <button
                type="button"
                onClick={() =>
                  useSuggestion(
                    "Give me a study plan for my upcoming semester exams."
                  )
                }
              >
                🎯 Create a study plan
              </button>

              <button
                type="button"
                onClick={() =>
                  useSuggestion(
                    "Explain the difference between supervised and unsupervised learning."
                  )
                }
              >
                🤖 Explain an AI/ML concept
              </button>

              <button
                type="button"
                onClick={() =>
                  useSuggestion(
                    "Give me some important topics to prepare for a software engineering interview."
                  )
                }
              >
                💼 Interview preparation
              </button>
            </div>
          </div>
        ) : (
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-message ${
                  msg.role === "user"
                    ? "ai-message-user"
                    : "ai-message-assistant"
                }`}
              >
                <div className="ai-message-avatar">
                  {msg.role === "user" ? "M" : "✦"}
                </div>

                <div className="ai-message-content">
                  <div className="ai-message-role">
                    {msg.role === "user" ? "You" : "Elaris AI"}
                  </div>

                  <div className="ai-message-text">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message ai-message-assistant">
                <div className="ai-message-avatar">✦</div>

                <div className="ai-message-content">
                  <div className="ai-message-role">
                    Elaris AI
                  </div>

                  <div className="ai-thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        className="ai-input-wrapper"
        onSubmit={handleSubmit}
      >
        <div className="ai-input-box">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Elaris anything..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            aria-label="Send message"
          >
            {loading ? "..." : "➤"}
          </button>
        </div>

        <small>
          Elaris AI can make mistakes. Verify important information.
        </small>
      </form>
    </div>
  );
}