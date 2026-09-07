import { useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import { safeUrl, whatsappLink } from '../utils/links';
import { Icon } from './Icon';
export function Portrait({ name, src, large = false }: { name: string; src?: string | null; large?: boolean }) {
  const [failed, setFailed] = useState<string | undefined>();
  return <div className={`portrait ${large ? 'portrait--large' : ''}`}>{safeUrl(src) && failed !== safeUrl(src) ? <img src={safeUrl(src)} alt={name} loading="lazy" onError={() => setFailed(safeUrl(src))} /> : <span aria-label={name}>{name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>}</div>;
}
export function Testimonials() {
  const { data } = useSiteContent();
  if (!data?.testimonials?.length) return null;
  return <section className="testimonials-section" data-reveal><div className="container section"><div className="section-heading"><div><span className="eyebrow"><Icon name="quote" size={16} /> LEARNER STORIES</span><h2>New skills.<br /><em>In their own words.</em></h2></div><p>The people behind the progress.</p></div><div className="testimonial-grid" data-reveal-stagger>{data.testimonials.map((item, index) => <figure className="testimonial-card" key={`${item.name}-${index}`}><Icon name="quote" size={32} /><blockquote>{item.quote}</blockquote><figcaption><Portrait name={item.name} src={item.avatarUrl} /><div><strong>{item.name}</strong><span>{item.role}</span></div></figcaption></figure>)}</div></div></section>;
}
export function TeamSection({ instructors = false }: { instructors?: boolean }) {
  const { data } = useSiteContent();
  const people = data?.team?.filter(person => !instructors || person.instructor) || [];
  if (!people.length) return null;
  return <section id={instructors ? 'instructors' : 'team'} className="container section team-section" data-reveal><div className="section-heading"><div><span className="eyebrow"><Icon name="users" size={16} /> PEOPLE IN YOUR CORNER</span><h2>{instructors ? 'Learn from people who build.' : 'Meet the team.'}</h2></div><p>{instructors ? 'Meet the instructors guiding your next chapter.' : 'The people making learning happen.'}</p></div><div className="team-grid" data-reveal-stagger>{people.map((person, index) => <article className="team-card" key={`${person.name}-${index}`}><div className="team-card__image"><Portrait name={person.name} src={person.avatarUrl} large />{person.instructor && <span className="team-tag">Instructor</span>}</div><div className="team-card__body"><span className="eyebrow">{person.role}</span><h3>{person.name}</h3><p>{person.bio}</p>{safeUrl(person.profileUrl) && <a className="text-link" href={safeUrl(person.profileUrl)} target="_blank" rel="noopener noreferrer">Meet {person.name.split(' ')[0]} <Icon name="diagonal" size={16} /></a>}</div></article>)}</div></section>;
}
export function ContactLinks() {
  const { data } = useSiteContent();
  const whatsapp = whatsappLink(data?.whatsappNumber);
  return <div className="contact-links">{whatsapp && <a className="btn btn-primary" href={whatsapp} target="_blank" rel="noopener noreferrer">Let’s talk on WhatsApp <Icon name="diagonal" size={16} /></a>}{data?.supportEmail && <a className="btn btn-secondary" href={`mailto:${data.supportEmail}`}><Icon name="mail" size={17} />{data.supportEmail}</a>}</div>;
}
