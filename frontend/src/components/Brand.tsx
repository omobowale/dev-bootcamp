import { Link } from "react-router-dom";
export function Brand({ onClick }: { onClick?: () => void }) {
  return <Link to="/" className="brand" onClick={onClick} aria-label="Bukiva Learn home"><span className="brand-symbol"><img src="/brand/bukiva-learn-icon.png" alt="" width={24} height={24} /></span><span>Bukiva<span className="brand-light"> Learn</span><span className="brand-period">.</span></span></Link>;
}
