import { useState } from "react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const API_URL = "http://localhost:5000/api/v1";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message: trimmedMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const reply =
        response.data?.data?.reply ||
        "I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error("AI request failed:", error);

      let errorMessage =
        "Sorry, I couldn't connect to Elaris AI.";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          errorMessage;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div>
          <h1>Elaris AI</h1>
          <p>
            Your intelligent campus learning assistant
          </p>
        </div>
      </div>

      <div className="ai-chat-container">
        <div className="ai-messages">
          {messages.length === 0 && (
            <div className="ai-empty-state">
              <div className="ai-icon">✦</div>

              <h2>How can I help you?</h2>

              <p>
                Ask me about DBMS, programming, exams,
                notes, projects, or other academic topics.
              </p>

              <div className="ai-suggestions">
                <button
                  onClick={() =>
                    setMessage(
                      "Explain DBMS normalization in simple terms."
                    )
                  }
                >
                  Explain DBMS normalization
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Explain OOP concepts with simple examples."
                    )
                  }
                >
                  Explain OOP
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Give me a simple explanation of SQL joins."
                    )
                  }
                >
                  Explain SQL joins
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`ai-message ${
                msg.role === "user"
                  ? "ai-message-user"
                  : "ai-message-assistant"
              }`}
            >
              <div className="ai-message-role">
                {msg.role === "user"
                  ? "You"
                  : "Elaris AI"}
              </div>

              <div className="ai-message-content">
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-message ai-message-assistant">
              <div className="ai-message-role">
                Elaris AI
              </div>

              <div className="ai-message-content">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="ai-input-area">
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask Elaris AI anything..."
            rows={2}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={!message.trim() || loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        <div className="ai-disclaimer">
          Elaris AI can make mistakes. Verify important
          academic information.
        </div>
      </div>
    </div>
  );
}