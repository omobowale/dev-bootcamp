import { Link, useSearchParams } from "react-router-dom";
import { useCourses } from "../hooks/useCourses";
import { CourseGrid } from "../components/CourseGrid";
import { LevelFilter } from "../components/LevelFilter";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { Icon } from "../components/Icon";
import "./CoursesPage.css";
export function CoursesPage() {
  const [params, setParams] = useSearchParams();
  const level = params.get("level") || "";
  const search = params.get("q") || "";
  const { data: courses, isLoading, isError, refetch } = useCourses(level || undefined);
  const filtered = (courses ?? []).filter(course => (course.title + " " + (course.shortDescription ?? "")).toLowerCase().includes(search.trim().toLowerCase()));
  const update = (key: string, value: string) => setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });
  return <>
    <section className="page-intro catalogue-intro"><div className="container"><span className="eyebrow"><Icon name="book" size={15} /> THE COURSE COLLECTION</span><h1>Your ambition.<br /><em>Your next skill.</em></h1><p>Find a course that meets you where you are — and helps you get where you want to go.</p><div className="catalogue-promises"><span><Icon name="code" size={15} /> Practical projects</span><span><Icon name="users" size={15} /> Engineer-led learning</span><span><Icon name="layers" size={15} /> Skills you can build on</span></div></div></section>
    <section className="container catalogue-content" data-reveal><div className="catalogue-toolbar"><label className="course-search"><Icon name="search" size={18} /><span className="sr-only">Search courses</span><input type="search" placeholder="What do you want to learn?" value={search} onChange={event => update("q", event.target.value)} /></label><LevelFilter value={level} onChange={value => update("level", value)} /></div>
      <div className="catalogue-results"><p aria-live="polite">{isLoading ? "Finding your courses..." : isError ? "Course catalogue" : filtered.length + (filtered.length === 1 ? " course" : " courses") + " to explore"}</p>{(search || level) && <button type="button" className="text-link clear-filters" onClick={() => setParams({})}>Clear filters <Icon name="close" size={13} /></button>}</div>
      {isLoading && <LoadingState label="Loading courses..." />}{isError && <ErrorState message="We couldn't load courses right now." onRetry={() => refetch()} />}{!isLoading && !isError && <CourseGrid courses={filtered} />}
      <div className="catalogue-help"><span className="benefit-icon"><Icon name="spark" /></span><div><h2>Not sure where to start?</h2><p>Get to know our approach and find answers to common questions.</p></div><Link to="/about#faq" className="text-link">Let's figure it out <Icon name="arrow" size={16} /></Link></div>
    </section>
  </>;
}
