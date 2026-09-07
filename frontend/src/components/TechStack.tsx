import { useState } from 'react';
import { Icon } from './Icon';
const skills = [
  { name: 'HTML', mark: '</>', detail: 'Structure your ideas', color: '#e76f45' },
  { name: 'CSS', mark: '#', detail: 'Give them personality', color: '#548ade' },
  { name: 'JavaScript', mark: 'JS', detail: 'Make things happen', color: '#c49420' },
  { name: 'React', mark: '⚛', detail: 'Build living interfaces', color: '#2795ab' },
  { name: 'Node.js', mark: 'N', detail: 'Power what’s behind it', color: '#54944e' },
  { name: 'AI tools', mark: '✦', detail: 'Explore smarter workflows', color: '#9871d6' },
  { name: 'Git', mark: '↗', detail: 'Keep moving forward', color: '#d86b55' },
];
export function TechStack() {
  const [active, setActive] = useState(0);
  return <section className="skills-ribbon" aria-label="Skills you can build" data-reveal><div className="container"><div className="skills-ribbon__intro"><div><span className="eyebrow">YOUR CREATIVE TOOLKIT</span><h2>Small building blocks.<br /><em>Limitless things to create.</em></h2></div><p><Icon name="spark" size={18} /> Explore the tools behind your next idea.</p></div><div className="skills-ribbon__grid" data-reveal-stagger>{skills.map((skill, index) => <button type="button" key={skill.name} className={`skill-tile ${active === index ? 'is-active' : ''}`} aria-pressed={active === index} onClick={() => setActive(index)} style={{ '--skill-color': skill.color } as React.CSSProperties}><span className="skill-tile__mark">{skill.mark}</span><strong>{skill.name}</strong><span>{skill.detail}</span><Icon name="diagonal" size={14} /></button>)}</div><p className="skills-ribbon__caption" aria-live="polite"><span className="live-dot" /> {skills[active].name} · {skills[active].detail}. <span>Explore individual courses for the tools they cover.</span></p></div></section>;
}
