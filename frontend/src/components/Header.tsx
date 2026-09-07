import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import "./Header.css";

const links = [{ to: "/", label: "Home" }, { to: "/courses", label: "Explore courses" }, { to: "/private-tutorials", label: "Private tutorials" }, { to: "/about", label: "Our approach" }, { to: "/about#faq", label: "FAQs" }];
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return <header className="site-header"><div className="container site-header__inner">
    <Brand onClick={() => setMenuOpen(false)} />
    <nav id="main-navigation" aria-label="Main navigation" className={menuOpen ? "site-header__nav site-header__nav--open" : "site-header__nav"}>
      {links.map(link => {
        const active = pathname + hash === link.to || (link.to === "/courses" && pathname.startsWith("/courses/"));
        return <Link key={link.to} to={link.to} aria-current={active ? "page" : undefined} className={active ? "site-header__link site-header__link--active" : "site-header__link"} onClick={() => setMenuOpen(false)}>{link.label}</Link>;
      })}
      <Link to="/register" className="btn btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>Start learning <Icon name="arrow" size={16} /></Link>
    </nav>
    <div className="header-actions"><ThemeToggle /><Link to="/register" className="btn btn-primary header-cta">Start learning <Icon name="arrow" size={16} /></Link><button className="site-header__toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button></div>
  </div></header>;
}
