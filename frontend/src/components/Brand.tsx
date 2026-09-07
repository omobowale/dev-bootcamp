import { Link } from "react-router-dom";
import { Icon } from "./Icon";
export function Brand({ onClick }: { onClick?: () => void }) {
  return <Link to="/" className="brand" onClick={onClick} aria-label="DevTraining home"><span className="brand-symbol"><Icon name="code" size={23} /></span><span>Dev<span className="brand-light">Training</span><span className="brand-period">.</span></span></Link>;
}
