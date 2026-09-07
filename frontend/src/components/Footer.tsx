import { useSiteContent } from "../hooks/useSiteContent";
import { safeUrl } from "../utils/links";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import "./Footer.css";
export function Footer() {
  const { data } = useSiteContent();
  return <footer className="site-footer"><div className="container"><div className="footer-main">
    <div><Brand /><p>Build the skills. Make the leap.<br />Your next chapter starts here.</p><span className="footer-signature"><span /> Made for curious minds.</span></div>
    <nav aria-label="Learning links"><h3>LEARN</h3><Link to="/courses">Explore courses</Link><Link to="/private-tutorials">Private tutorials</Link><Link to="/register">Join a cohort</Link><Link to="/about">How we teach</Link></nav>
    <nav aria-label="Company links"><h3>DEVTRAINING</h3><Link to="/about">About us</Link><Link to="/about#team">Meet the team</Link><Link to="/terms">Terms & conditions</Link><Link to="/about#faq">Help & FAQs</Link><Link to="/about#contact">Get in touch</Link></nav>
    <div className="footer-callout"><Icon name="spark" size={25} /><h3>Keep your curiosity.<br />Build something great.</h3><Link to="/courses" className="text-link">Find your next skill <Icon name="arrow" size={16} /></Link></div>
  </div><div className="footer-socials">{data?.socialLinks?.filter(item => safeUrl(item.url)).map(item => <a key={item.url} href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer" aria-label={`${item.platform} (opens in a new tab)`}><span className="social-monogram">{item.platform.slice(0, 2)}</span><span>{item.platform}</span><Icon name="diagonal" size={15} /></a>)}</div><div className="footer-bottom"><span>© {new Date().getFullYear()} DevTraining. All rights reserved.</span><Link to="/admin/login">Admin workspace <Icon name="diagonal" size={13} /></Link></div></div></footer>;
}
