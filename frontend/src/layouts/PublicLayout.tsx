import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useScrollReveal } from "../hooks/useScrollReveal";
export function PublicLayout() {
    const { pathname, hash } = useLocation();
    useScrollReveal();
    useEffect(() => { const frame = requestAnimationFrame(() => { if (hash)
        document.getElementById(hash.slice(1))?.scrollIntoView();
    else
        window.scrollTo({ top: 0, behavior: "instant" }); }); return () => cancelAnimationFrame(frame); }, [pathname, hash]);
    return <><a href="#main-content" className="skip-link">Skip to content</a><Header /><main id="main-content" tabIndex={-1} style={{ flex: 1 }}><Outlet /></main><Footer /></>;
}
