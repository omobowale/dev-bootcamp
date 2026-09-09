import { Testimonials, TeamSection, ContactLinks } from "../components/CommunitySections";
import { Link } from "react-router-dom";
import { useGlobalFaqs } from "../hooks/useGlobalFaqs";
import { FaqAccordion } from "../components/FaqAccordion";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { Icon, type IconName } from "../components/Icon";
import "./AboutPage.css";

const principles: { icon: IconName; title: string; text: string }[] = [
  { icon: "code", title: "Practice over passive learning", text: "Go beyond watching. Work through ideas, write the code, and see what happens when you put it into practice." },
  { icon: "users", title: "A human approach to tech", text: "Learn in a cohort with guidance from working engineers. Bring your questions and your curiosity." },
  { icon: "layers", title: "Progress you can point to", text: "Build a body of work that reflects your growing skills, from the first small exercise to a complete project." },
];
export function AboutPage() {
  const { data: faqs, isLoading, isError, refetch } = useGlobalFaqs();
  return <>
    <section className="page-intro about-intro"><div className="container"><span className="eyebrow"><Icon name="spark" size={15} /> THE BUKIVA LEARN WAY</span><h1>Great developers aren't born.<br /><em>They're built.</em></h1><p>We believe the best way to learn software development is to build software. With curiosity, practice, and people in your corner.</p><Link to="/courses" className="btn btn-primary">Find your starting point <Icon name="arrow" size={16} /></Link></div></section>
    <section className="container section about-story" data-reveal><div><span className="eyebrow">OUR APPROACH</span><h2>Less watching.<br />More “I made this.”</h2><p>Software development makes more sense when you put it into practice. We bring together hands-on training, cohort learning, and guidance from working engineers.</p><p>Whether you're drawn to interfaces, backend systems, or the complete application, we're here to help you build the skills to take your next step.</p></div><div className="approach-board"><div className="approach-board__top"><span className="live-dot" /> THE LEARNING LOOP<Icon name="layers" size={16} /></div><div className="approach-flow"><span><Icon name="book" size={23} /><strong>Learn</strong><small>Explore a concept</small></span><Icon name="arrow" size={16} /><span><Icon name="code" size={23} /><strong>Build</strong><small>Put it to work</small></span><Icon name="arrow" size={16} /><span><Icon name="spark" size={23} /><strong>Grow</strong><small>Make it your own</small></span></div><p>A little progress, repeated, becomes a real skill.</p></div></section>
    <section className="about-principles" data-reveal><div className="container"><div className="section-heading"><div><span className="eyebrow">WHAT WE BELIEVE</span><h2>Built around better learning.</h2></div></div><div className="principle-grid" data-reveal-stagger>{principles.map(principle => <article key={principle.title}><span className="principle-icon"><Icon name={principle.icon} size={25} /></span><h3>{principle.title}</h3><p>{principle.text}</p></article>)}</div></div></section>
    <TeamSection /><Testimonials />
    <section id="faq" className="container section about-faq" data-reveal><div><span className="eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</span><h2>A little clarity<br />before you begin.</h2><p>Get to know how learning with Bukiva Learn works.</p><a href="#contact" className="text-link">Still have a question? <Icon name="arrow" size={16} /></a></div><div className="faq-list">{isLoading && <LoadingState label="Loading FAQs..." />}{isError && <ErrorState message="We couldn't load the FAQs right now." onRetry={() => refetch()} />}{!isLoading && !isError && ((faqs?.length ?? 0) > 0 ? <FaqAccordion faqs={faqs!} /> : <div className="notice-panel"><Icon name="book" size={24} /><h3>Answers are on the way.</h3><p>We're preparing our FAQs. Course pages include the details available for each learning path.</p><Link to="/courses" className="text-link">Explore courses <Icon name="arrow" size={15} /></Link></div>)}</div></section>
    <section className="container about-contact-wrap" id="contact" data-reveal><div className="about-contact"><span className="principle-icon"><Icon name="mail" size={26} /></span><div><span className="eyebrow">LET'S CONNECT</span><h2>Your next chapter starts with a conversation.</h2><p>Register your interest in an available course and our team will reach out with next steps. You can also use the contact options below to ask about your next step.</p></div><Link to="/register" className="btn btn-primary">Get started <Icon name="arrow" size={16} /></Link></div><ContactLinks /></section>
  </>;
}
