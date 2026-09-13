import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Briefcase,
  Bookmark,
  User,
  Bot,
  UploadCloud,
  ShieldAlert,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Notes",
    path: "/notes",
    icon: BookOpen,
  },
  {
    label: "PYQs",
    path: "/pyqs",
    icon: FileQuestion,
  },
  {
    label: "Opportunities",
    path: "/opportunities",
    icon: Briefcase,
  },
  {
    label: "Upload Center",
    path: "/upload",
    icon: UploadCloud,
  },
  {
    label: "Bookmarks",
    path: "/bookmarks",
    icon: Bookmark,
  },
  {
    label: "AI Assistant",
    path: "/ai",
    icon: Bot,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    label: "Admin Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    label: "User Management",
    path: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "Admin Moderation",
    path: "/admin/moderation",
    icon: ShieldAlert,
    adminOnly: true,
  },
];

export default function Sidebar() {
  const { user } = useAuth();

  const visibleNavItems = navItems.filter(
    (item) =>
      !item.adminOnly || user?.role === "ADMIN"
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">E</div>

        <div>
          <strong>Elaris-One</strong>
          <span>Campus Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>© 2026 Elaris-One</span>
      </div>
    </aside>
  );
}



