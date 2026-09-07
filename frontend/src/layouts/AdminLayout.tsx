import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";
import { Brand } from "../components/Brand";
import { ThemeToggle } from "../components/ThemeToggle";
import { Icon, type IconName } from "../components/Icon";
import "./AdminLayout.css";
const links: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: ROUTES.admin, label: "Overview", icon: "grid", end: true },
  { to: ROUTES.adminCourses, label: "Courses", icon: "book" },
  { to: ROUTES.adminCohorts, label: "Cohorts", icon: "calendar" },
  { to: ROUTES.adminRegistrations, label: "Registrations", icon: "users" },
  { to: "/admin/settings/terms", label: "Terms & conditions", icon: "shield" },
  { to: "/admin/site-content", label: "Site content", icon: "spark" },
  { to: ROUTES.adminFaqs, label: "Site FAQs", icon: "book" },
];
export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const drawer = document.getElementById('admin-navigation')!;
    const items = () => Array.from(drawer.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)')).filter(item => item.getClientRects().length);
    items()[0]?.focus();
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); if (event.key !== 'Tab') return; const focusable = items(); const first = focusable[0], last = focusable.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [menuOpen]);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const section = links.find(link => link.end ? pathname === link.to : pathname.startsWith(link.to))?.label || "Workspace";
  return <div className="admin-shell">
    <a href="#admin-content" className="skip-link">Skip to workspace content</a>
    {menuOpen && <button className="admin-menu-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}<aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`} id="admin-navigation"><button type="button" className="admin-menu-close icon-button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><Icon name="close" /></button><Brand /><div className="workspace-label"><span /> ADMIN WORKSPACE</div><span className="sidebar-section-label">MANAGE</span>
      <nav className="admin-layout__nav" aria-label="Admin navigation">{links.map(link => <NavLink onClick={() => setMenuOpen(false)} to={link.to} end={link.end} key={link.to} className={({ isActive }) => isActive ? "admin-layout__link admin-layout__link--active" : "admin-layout__link"}><Icon name={link.icon} size={19} /><span>{link.label}</span><Icon name="arrow" size={14} className="sidebar-link-arrow" /></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><Icon name="spark" size={24} /><strong>Make learning happen.</strong><p>Great courses start with a little care.</p><Link to={ROUTES.adminNewCourse}>Create a course <Icon name="arrow" size={14} /></Link></div><Link to="/" className="sidebar-site-link"><Icon name="globe" size={17} /> View public website <Icon name="diagonal" size={14} /></Link><div className="sidebar-profile"><span className="admin-avatar">{admin?.name?.charAt(0).toUpperCase() || "A"}</span><div><strong>{admin?.name}</strong><small>{admin?.role || "Administrator"}</small></div><button type="button" aria-label="Sign out" title="Sign out" onClick={() => { logout(); navigate("/admin/login"); }}><Icon name="logout" size={17} /></button></div></div>
    </aside>
    <div className="admin-workspace"><header className="admin-topbar"><button type="button" className="admin-menu-toggle icon-button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name="menu" /></button><div><span>Workspace</span><Icon name="diagonal" size={12} /><strong>{section}</strong></div><div><span className="admin-private-label"><Icon name="shield" size={14} /> Admin access</span><ThemeToggle /></div></header><main id="admin-content" tabIndex={-1} className="admin-layout__main"><Outlet /></main></div>
  </div>;
}
