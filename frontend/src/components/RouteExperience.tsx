import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export function RouteExperience() {
  const { pathname } = useLocation();
  useEffect(() => {
    let focused = false;
    const update = () => {
      const heading = document.querySelector('h1');
      document.title = `${heading?.textContent?.trim() || 'Explore'} — Bukiva Learn`;
      if (heading && !focused) { heading.setAttribute('tabindex', '-1'); heading.classList.add('route-heading'); heading.focus({ preventScroll: true }); focused = true; }
    };
    update();
    const observer = new MutationObserver(update); observer.observe(document.getElementById('root')!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
