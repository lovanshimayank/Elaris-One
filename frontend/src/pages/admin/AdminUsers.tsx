import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  ChevronDown,
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface AdminUser {
  id: string;
  enrollmentNumber: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  branch: string | null;
  semester: number | null;
  college: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  _count: {
    notes: number;
    pyqs: number;
  };
}

export default function AdminUsers() {
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string> = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (role) {
        params.role = role;
      }

      const response = await api.get("/admin/users", { params });

      if (response.data?.success) {
        setUsers(response.data.data || []);
      } else {
        throw new Error("Failed to load users.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      loadUsers();
    }
  }, [authLoading, user, role]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadUsers();
  };

  const toggleStatus = async (targetUser: AdminUser) => {
    try {
      setUpdatingId(targetUser.id);

      await api.patch(
        `/admin/users/${targetUser.id}/status`,
        {
          isActive: !targetUser.isActive,
        }
      );

      await loadUsers();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const changeRole = async (
    targetUser: AdminUser,
    newRole: AdminUser["role"]
  ) => {
    if (targetUser.role === newRole) return;

    try {
      setUpdatingId(targetUser.id);

      await api.patch(
        `/admin/users/${targetUser.id}/role`,
        {
          role: newRole,
        }
      );

      await loadUsers();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="admin-page admin-users-page">
        <div className="admin-dashboard-loading">
          <RefreshCw
            size={28}
            className="admin-spin"
          />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="admin-page admin-users-page">
        <div className="admin-dashboard-denied">
          <ShieldCheck size={42} />
          <h2>Access Denied</h2>
          <p>
            You do not have permission to access User
            Management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-users-page">
      <div className="admin-header admin-users-header">
        <div>
          <span className="admin-eyebrow">
            ADMIN CONTROL CENTER
          </span>

          <h1>User Management</h1>

          <p>
            Manage Elaris-One users, roles and account
            access.
          </p>
        </div>

        <button
          className="admin-dashboard-refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "admin-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="admin-summary admin-users-summary">
        <div className="admin-summary-card">
          <div className="admin-summary-icon">
            <Users size={19} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-summary-icon admin-summary-icon-success">
            <UserCheck size={19} />
          </div>

          <div>
            <span>Active</span>
            <strong>
              {users.filter((item) => item.isActive).length}
            </strong>
          </div>
        </div>

        <div className="admin-summary-card">
          <div className="admin-summary-icon admin-summary-icon-danger">
            <UserX size={19} />
          </div>

          <div>
            <span>Inactive</span>
            <strong>
              {users.filter((item) => !item.isActive).length}
            </strong>
          </div>
        </div>
      </div>

      <div className="admin-toolbar admin-users-toolbar">
        <form
          className="admin-search admin-users-search"
          onSubmit={handleSearch}
        >
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name, email or enrollment..."
          />

          <button type="submit">Search</button>
        </form>

        <div className="admin-filter admin-users-filter">
          <ChevronDown size={17} />

          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="admin-dashboard-error-banner">
          <span>{error}</span>
        </div>
      )}

      <section className="admin-users-card">
        <div className="admin-users-table-heading">
          <div>
            <span>PLATFORM USERS</span>
            <h2>All Accounts</h2>
          </div>

          <span className="admin-users-total">
            {users.length} users
          </span>
        </div>

        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Enrollment</th>
                <th>Role</th>
                <th>Academic</th>
                <th>Content</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="admin-empty-state"
                  >
                    <Users size={32} />
                    <p>No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-user-info">
                        <div className="admin-user-avatar">
                          {item.fullName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{item.fullName}</strong>
                          <span>{item.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-enrollment">
                        {item.enrollmentNumber}
                      </span>
                    </td>

                    <td>
                      <select
                        className="admin-role-select"
                        value={item.role}
                        disabled={
                          updatingId === item.id
                        }
                        onChange={(event) =>
                          changeRole(
                            item,
                            event.target
                              .value as AdminUser["role"]
                          )
                        }
                      >
                        <option value="STUDENT">
                          Student
                        </option>
                        <option value="FACULTY">
                          Faculty
                        </option>
                        <option value="ADMIN">
                          Admin
                        </option>
                      </select>
                    </td>

                    <td>
                      <div className="admin-academic-info">
                        <strong>
                          {item.branch || "â€”"}
                        </strong>

                        <span>
                          {item.semester
                            ? `Semester ${item.semester}`
                            : "Semester â€”"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-content-count">
                        <span>
                          {item._count.notes} Notes
                        </span>
                        <span>
                          {item._count.pyqs} PYQs
                        </span>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={
                          item.isActive
                            ? "admin-status active"
                            : "admin-status inactive"
                        }
                        disabled={
                          updatingId === item.id
                        }
                        onClick={() =>
                          toggleStatus(item)
                        }
                      >
                        <span className="admin-status-dot" />
                        {item.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td>
                      <span className="admin-joined-date">
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}