import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Briefcase,
  Bookmark,
  User,
  Bot,
} from "lucide-react";

const navItems = [
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
];

export default function Sidebar() {
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
        {navItems.map((item) => {
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