import { TechStack } from "../components/TechStack";
import { Testimonials, TeamSection } from "../components/CommunitySections";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "../components/Icon";
import { CourseGrid } from "../components/CourseGrid";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { useCourses } from "../hooks/useCourses";
import "./HomePage.css";

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: "code", title: "Build from day one", text: "Turn what you learn into working software. Every concept has a practical next step." },
  { icon: "users", title: "Learn with people", text: "Find your rhythm in a cohort, with guidance from engineers who do this every day." },
  { icon: "layers", title: "Make your skills visible", text: "Create projects you can explain, improve, and proudly add to your portfolio." },
];
export function HomePage() {
  const { data: courses, isLoading, isError, refetch } = useCourses();
  return <>
    <section className="home-hero"><div className="hero-grid-bg" /><div className="container hero-grid">
      <div className="hero-copy">
        <Link to="/courses" className="hero-pill"><span className="live-dot" /> A new skill. A new possibility. <Icon name="arrow" size={13} /></Link>
        <h1>Big ideas start<br />with <span>real skills.</span></h1>
        <p>Build your future in software. Learn from working engineers, create real projects, and take your next step with confidence.</p>
        <div className="hero-actions"><Link to="/courses" className="btn btn-primary">Find your course <Icon name="arrow" size={17} /></Link><a href="#how-it-works" className="btn btn-secondary"><Icon name="book" size={17} /> How you'll learn</a></div>
        <div className="hero-footnote"><span><Icon name="check" size={14} /> Practical by design</span><span><Icon name="check" size={14} /> Built around you</span><span><Icon name="check" size={14} /> AI skills, built in</span></div>
      </div>
      <div className="hero-studio" role="img" aria-label="Illustration of a hands-on coding workspace and a website project">
        <div className="studio-backdrop" /><div className="studio-label"><span /> YOUR IDEAS, BROUGHT TO LIFE</div>
        <div className="studio-window">
          <div className="studio-toolbar"><div className="studio-dots"><i /><i /><i /></div><span><Icon name="code" size={12} /> my-first-project</span><Icon name="layers" size={14} /></div>
          <div className="studio-tabs"><span><span className="js-icon">JS</span> App.js <span className="tab-dot" /></span><span>Preview <Icon name="diagonal" size={12} /></span></div>
          <div className="studio-code"><div className="line-numbers">01<br />02<br />03<br />04<br />05<br />06<br />07</div><div><span className="syntax-purple">const</span> nextChapter = {"{"}<br />&nbsp; curiosity: <span className="syntax-lime">"limitless"</span>,<br />&nbsp; skills: [<span className="syntax-lime">"learn"</span>, <span className="syntax-lime">"build"</span>],<br />&nbsp; possibilities: <span className="syntax-orange">Infinity</span><br />{"};"}<br /><br /><span className="syntax-purple">buildSomething</span>(nextChapter);<i className="studio-cursor" /></div></div>
          <div className="studio-terminal"><Icon name="check" size={12} /> Ready for your next big idea.<span>JavaScript</span></div>
        </div>
        <div className="project-preview"><div className="preview-header"><span><Icon name="globe" size={12} /> Your next project</span><span className="preview-live">LIVE PREVIEW</span></div><div className="preview-body"><div className="preview-mini-nav"><span className="mini-logo" /><i /><i /><i /></div><div className="preview-mini-content"><div><span>IDEA → REALITY</span><strong>Hello,<br />possibility.</strong><i /></div><div className="preview-sculpture"><span /><span /><span /></div></div></div></div>
        <div className="studio-float"><span><Icon name="check" size={20} /></span><div><strong>That “I built this” feeling.</strong><small>It starts with your first line.</small></div></div>
      </div>
    </div></section>
    <TechStack />
    <section className="container section" data-reveal><div className="section-heading"><div><span className="eyebrow"><Icon name="spark" size={14} /> YOUR NEXT MOVE</span><h2>Find what moves you forward.</h2><p>Focused courses. Practical projects. Skills that stay with you.</p></div><Link to="/courses" className="text-link">Explore all courses <Icon name="arrow" size={16} /></Link></div>
      {isLoading && <LoadingState label="Finding your next learning opportunity..." />}
      {isError && <ErrorState message="We couldn't load the course catalogue. Please try again." onRetry={() => refetch()} />}
      {!isLoading && !isError && <CourseGrid courses={(courses ?? []).slice(0, 3)} />}
    </section>
    <section className="why-section" data-reveal><div className="container"><div className="section-heading"><div><span className="eyebrow">LESS PASSIVE. MORE PRACTICAL.</span><h2>Learning that actually sticks.</h2></div><p>Don't just collect tutorials.<br />Build the confidence to create.</p></div><div className="benefit-grid" data-reveal-stagger>{benefits.map((benefit, index) => <article className="benefit-card" key={benefit.title}><div className="benefit-top"><span className="benefit-icon"><Icon name={benefit.icon} size={24} /></span><span>0{index + 1}</span></div><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</div></div></section>
    <section id="how-it-works" className="container section journey" data-reveal><div className="journey-copy"><span className="eyebrow">A CLEAR PATH FORWARD</span><h2>You bring the curiosity.<br /><em>We'll help with the rest.</em></h2><p>From your first question to your next project, take it one meaningful step at a time.</p><Link to="/about" className="text-link">More about our approach <Icon name="arrow" size={16} /></Link></div><div className="journey-steps" data-reveal-stagger>{[{ title: "Find your starting point", text: "Explore courses and choose the skills you want to build." }, { title: "Join your cohort", text: "Register for an available cohort. We'll be in touch with next steps." }, { title: "Learn it. Build it. Make it yours.", text: "Put your knowledge to work on practical software projects." }].map((step, index) => <div className="journey-step" key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></div>)}</div></section>
    <Testimonials /><TeamSection instructors />
    <section className="container home-cta-section" data-reveal><div className="home-cta"><div><span className="eyebrow">MAKE YOUR NEXT MOVE COUNT</span><h2>Your future won't build itself.<br />Let's get started.</h2><p>The next thing you build could change everything.</p></div><Link to="/courses" className="btn btn-light">Explore courses <Icon name="arrow" size={18} /></Link><div className="cta-orbit" /></div></section>
  </>;
}
