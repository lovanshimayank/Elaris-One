import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  FileQuestion,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Activity,
  CheckCircle,
  Database,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface AdminMetrics {
  totalUsers: number;
  totalNotes: number;
  totalPYQs: number;
  totalOpportunities: number;
  pendingModerations: number;
  systemHealth: {
    status: string;
    database: string;
    aiEngine: string;
    timestamp: string;
  };
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/metrics");

      if (response.data?.success) {
        setMetrics(response.data.data);
      } else {
        throw new Error("Failed to load admin metrics.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      loadMetrics();
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-loading">
          <RefreshCw size={28} className="admin-spin" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-denied">
          <ShieldCheck size={42} />
          <h2>Access Denied</h2>
          <p>
            You do not have permission to access the Admin Dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-error">
          <div className="admin-dashboard-error-icon">
            <Activity size={22} />
          </div>

          <p>{error || "No dashboard data available."}</p>

          <button onClick={loadMetrics}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: metrics.totalUsers,
      icon: Users,
    },
    {
      label: "Notes",
      value: metrics.totalNotes,
      icon: FileText,
    },
    {
      label: "PYQs",
      value: metrics.totalPYQs,
      icon: FileQuestion,
    },
    {
      label: "Opportunities",
      value: metrics.totalOpportunities,
      icon: Briefcase,
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-heading">
          <span className="admin-eyebrow">
            ADMIN CONTROL CENTER
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor Elaris-One activity, content, users and
            platform health from one place.
          </p>
        </div>

        <button
          className="admin-dashboard-refresh"
          onClick={loadMetrics}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "admin-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-dashboard-error-banner">
          <Activity size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="admin-dashboard-stat"
              key={stat.label}
            >
              <div className="admin-dashboard-stat-icon">
                <Icon size={21} />
              </div>

              <div className="admin-dashboard-stat-content">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-dashboard-card admin-moderation-card">
          <div className="admin-dashboard-card-header">
            <div>
              <span className="admin-card-label">
                MODERATION
              </span>

              <h2>Content Review</h2>
            </div>

            <div className="admin-dashboard-card-icon">
              <ShieldCheck size={22} />
            </div>
          </div>

          <div className="admin-pending-number">
            {metrics.pendingModerations}
          </div>

          <p>
            Items currently waiting for administrator
            moderation.
          </p>

          <button
            type="button"
            className="admin-dashboard-link"
            onClick={() => navigate("/admin/moderation")}
          >
            Open Moderation Panel
            <ArrowRight size={16} />
          </button>
        </section>

        <section className="admin-dashboard-card">
          <div className="admin-dashboard-card-header">
            <div>
              <span className="admin-card-label">
                SYSTEM HEALTH
              </span>

              <h2>Platform Status</h2>
            </div>

            <div className="admin-dashboard-card-icon">
              <Activity size={22} />
            </div>
          </div>

          <div className="admin-health-list">
            <HealthRow
              icon={<CheckCircle size={17} />}
              label="System"
              value={metrics.systemHealth.status}
            />

            <HealthRow
              icon={<Database size={17} />}
              label="Database"
              value={metrics.systemHealth.database}
            />

            <HealthRow
              icon={<Sparkles size={17} />}
              label="AI Engine"
              value={metrics.systemHealth.aiEngine}
            />
          </div>

          <div className="admin-last-updated">
            Last checked:{" "}
            {new Date(
              metrics.systemHealth.timestamp
            ).toLocaleString()}
          </div>
        </section>
      </div>

      <section className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-icon">
          <ShieldCheck size={24} />
        </div>

        <div>
          <span className="admin-welcome-label">
            ADMIN ACCESS
          </span>

          <h2>Welcome, {user.fullName}</h2>

          <p>
            You are signed in as an administrator. Use the
            control center to manage the Elaris-One campus
            ecosystem.
          </p>
        </div>
      </section>
    </div>
  );
}

function HealthRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="admin-health-row">
      <div className="admin-health-label">
        {icon}
        <span>{label}</span>
      </div>

      <strong>{value}</strong>
    </div>
  );
}