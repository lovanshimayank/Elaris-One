import {
  Bell,
  Search,
  CheckCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

interface SearchResult {
  id: string;
  title: string;
  type: "Note" | "PYQ" | "Opportunity";
  path: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type:
    | "SYSTEM"
    | "APPROVED"
    | "REJECTED"
    | "OPPORTUNITY"
    | "ANNOUNCEMENT";
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.fullName || "Student";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const role =
    user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "FACULTY"
        ? "Faculty"
        : "Student";

  // ---------------- SEARCH ----------------

  useEffect(() => {
    const searchResources = async () => {
      const keyword = query.trim().toLowerCase();

      if (!keyword) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [
          notesResponse,
          pyqsResponse,
          opportunitiesResponse,
        ] = await Promise.all([
          api.get("/notes"),
          api.get("/pyqs"),
          api.get("/opportunities"),
        ]);

        const notes = notesResponse.data.data || [];
        const pyqs = pyqsResponse.data.data || [];
        const opportunities = opportunitiesResponse.data.data || [];

        const noteResults: SearchResult[] = notes
          .filter((note: any) =>
            `${note.title} ${note.description || ""}`
              .toLowerCase()
              .includes(keyword)
          )
          .map((note: any) => ({
            id: note.id,
            title: note.title,
            type: "Note",
            path: `/notes/${note.id}`,
          }));

        const pyqResults: SearchResult[] = pyqs
          .filter((pyq: any) =>
            `${pyq.title} ${pyq.branch || ""}`
              .toLowerCase()
              .includes(keyword)
          )
          .map((pyq: any) => ({
            id: pyq.id,
            title: pyq.title,
            type: "PYQ",
            path: `/pyqs/${pyq.id}`,
          }));

        const opportunityResults: SearchResult[] =
          opportunities
            .filter((opportunity: any) =>
              `${opportunity.title} ${
                opportunity.company || ""
              } ${opportunity.description || ""}`
                .toLowerCase()
                .includes(keyword)
            )
            .map((opportunity: any) => ({
              id: opportunity.id,
              title: opportunity.title,
              type: "Opportunity",
              path: `/opportunities/${opportunity.id}`,
            }));

        setResults([
          ...noteResults,
          ...pyqResults,
          ...opportunityResults,
        ].slice(0, 8));
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchResources, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // ---------------- NOTIFICATIONS ----------------

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setNotificationLoading(true);

      const response = await api.get("/notifications");

      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = async (
    notification: NotificationItem
  ) => {
    try {
      if (!notification.isRead) {
        await api.patch(
          `/notifications/${notification.id}/read`
        );

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }

    setShowNotifications(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/mark-all-read");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  const formatNotificationTime = (date: string) => {
    const notificationDate = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() - notificationDate.getTime();

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return notificationDate.toLocaleDateString();
  };

  const getSearchIcon = (type: SearchResult["type"]) => {
    if (type === "PYQ") {
      return <GraduationCap size={17} />;
    }

    if (type === "Opportunity") {
      return <BriefcaseBusiness size={17} />;
    }

    return <FileText size={17} />;
  };

  const getSearchClass = (type: SearchResult["type"]) => {
    if (type === "PYQ") return "search-result-icon pyq";

    if (type === "Opportunity") {
      return "search-result-icon opportunity";
    }

    return "search-result-icon note";
  };

  return (
    <header className="navbar">
      {/* SEARCH */}

      <div className="search-container">
        <div className="search-input-wrap">
          <Search
            size={18}
            className="search-input-icon"
          />

          <input
            type="text"
            placeholder="Search notes, PYQs, opportunities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search resources"
          />

          {query.trim() && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              Ã—
            </button>
          )}
        </div>

        {query.trim() && (
          <div className="search-results">
            <div className="search-results-header">
              <span>Search results</span>

              {!loading && results.length > 0 && (
                <span>{results.length} found</span>
              )}
            </div>

            {loading ? (
              <div className="search-state">
                <div className="search-spinner" />
                <div>
                  <strong>Searching resources</strong>
                  <span>Looking across your campus library...</span>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="search-result-list">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={result.path}
                    className="search-result"
                    onClick={() => setQuery("")}
                  >
                    <div className={getSearchClass(result.type)}>
                      {getSearchIcon(result.type)}
                    </div>

                    <div className="search-result-content">
                      <strong title={result.title}>
                        {result.title}
                      </strong>

                      <span>
                        {result.type === "Note"
                          ? "Study Material"
                          : result.type}
                      </span>
                    </div>

                    <span className="search-result-arrow">
                      â†’
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="search-state search-no-results">
                <div className="search-empty-icon">
                  <Search size={20} />
                </div>

                <div>
                  <strong>No results found</strong>
                  <span>
                    Try a different keyword or search term.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}

      <div className="navbar-actions">
        {/* NOTIFICATION */}

        <div className="notification-wrapper">
          <button
            className="icon-button notification-button"
            onClick={() => {
              setShowNotifications((current) => !current);

              if (!showNotifications) {
                fetchNotifications();
              }
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <div>
                  <strong>Notifications</strong>

                  {unreadCount > 0 && (
                    <span>
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    className="mark-all-button"
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                    Mark all
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notificationLoading ? (
                  <div className="notification-empty">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={28} />
                    <strong>No notifications</strong>
                    <span>
                      You're all caught up.
                    </span>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`notification-item ${
                        !notification.isRead
                          ? "unread"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                    >
                      <div className="notification-icon">
                        {notification.type === "APPROVED"
                          ? "âœ“"
                          : notification.type === "REJECTED"
                            ? "!"
                            : notification.type ===
                                "OPPORTUNITY"
                              ? "â˜…"
                              : "â€¢"}
                      </div>

                      <div className="notification-content">
                        <div className="notification-title-row">
                          <strong>
                            {notification.title}
                          </strong>

                          {!notification.isRead && (
                            <span className="unread-dot" />
                          )}
                        </div>

                        <p>{notification.message}</p>

                        <span className="notification-time">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </span>
                      </div>

                      {notification.link && (
                        <ExternalLink
                          size={14}
                          className="notification-link-icon"
                        />
                      )}
                    </button>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notification-footer">
                  <span>
                    Showing latest{" "}
                    {notifications.length} notifications
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* USER */}

        <div className="user-mini">
          <div className="avatar">{initials}</div>

          <div>
            <strong>{fullName}</strong>
            <span>{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}