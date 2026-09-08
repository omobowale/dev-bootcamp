import { useMemo } from "react";
import { sanitizeRichText } from "../utils/richText";
import { Portrait } from "../components/CommunitySections";
import { Icon } from "../components/Icon";
import { CourseArtwork } from "../components/CourseArtwork";
import "../components/CourseCard.css";
import { useParams, Link } from "react-router-dom";
import { useCourse } from "../hooks/useCourse";
import { useCourseCohorts } from "../hooks/useCourseCohorts";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { FaqAccordion } from "../components/FaqAccordion";
import { PriceTag } from "../components/PriceTag";
import { formatDateRange } from "../utils/formatDate";
import { splitLines } from "../utils/text";
import { registerPath } from "../constants/routes";
import "./CourseDetailPage.css";

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading, isError, refetch } = useCourse(slug);
  const { data: cohorts, isLoading: cohortsLoading, isError: cohortsError, refetch: refetchCohorts } = useCourseCohorts(course?.id);

  const jsonLd = useMemo(() => {
    if (!course) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.shortDescription ?? course.title,
      provider: { "@type": "Organization", name: "DevTraining" },
      ...(course.price != null
        ? {
            offers: {
              "@type": "Offer",
              price: course.discountPrice ?? course.price,
              priceCurrency: "NGN",
              availability: "https://schema.org/InStock",
            },
          }
        : {}),
    };
  }, [course]);

  useDocumentMeta({
    title: course ? `${course.title} — DevTraining` : "Loading course… — DevTraining",
    description: course?.shortDescription ?? undefined,
    jsonLd,
  });

  if (isLoading) return <div className="container detail-loading"><LoadingState label="Loading course…" /></div>;

  if (isError || !course) {
    return (
      <div className="container" style={{ padding: "80px 0" }}>
        <ErrorState message="We couldn't find that course. It may be unpublished or no longer available." onRetry={() => refetch()} />
        <div style={{ textAlign: "center" }}>
          <Link to="/courses" className="text-link">
            ← Back to all courses
          </Link>
        </div>
      </div>
    );
  }

  const available = !!cohorts?.length;
  const enrol = available ? registerPath(course.slug) : "/about#contact";
  const enrolLabel = available ? "Join this course" : "Ask about the next cohort";
  const projects = splitLines(course.projects);

  return (
    <>
      <section className="page-intro course-detail-intro">
        <div className="container">
          <Link className="breadcrumb" to="/courses"><Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} /> All courses</Link><span className="eyebrow">
            {course.level ?? "COURSE"} · 100% ONLINE
          </span>
          <h1>{course.title}</h1>
          {course.shortDescription && <p>{course.shortDescription}</p>}
          <div className="availability-line" role="status"><span className={available ? 'live-dot' : 'availability-dot'} />{cohortsLoading ? 'Checking availability…' : cohortsError ? 'Availability could not be checked' : available ? `${cohorts!.length} learning option${cohorts!.length === 1 ? '' : 's'} available` : 'No open cohorts right now'}</div>
          <div className="course-detail__badges">
            {course.duration && <span className="course-detail__badge">{course.duration}</span>}
            <span className="course-detail__badge"><PriceTag price={course.price} discountPrice={course.discountPrice} size="sm" /></span>
            {course.certificateAvailable && <span className="course-detail__badge">Certificate on completion</span>}
            {course.aiSkillsDescription && <span className="course-detail__badge" title={course.aiSkillsDescription}>AI skills included</span>}
          </div>
          <Link to={enrol} className="btn btn-primary" style={{ marginTop: 24 }}>
            {enrolLabel} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <div className="container course-detail-layout"><div className="info-content course-detail-content">
        {course.description && (
          <section data-reveal>
            <h2>Overview</h2>
            <div className="text-muted rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(course.description) }} />
          </section>
        )}

        {(course.whatsIncluded.length > 0 || course.aiSkillsDescription) && (
          <section data-reveal>
            <h2>What's included</h2>
            <div className="card course-detail__included-card">
              <ul className="course-detail__included-list" data-reveal-stagger>
                {course.whatsIncluded.map((item) => (
                  <li key={item.title}>
                    <Icon name="check" size={15} />
                    <div>
                      <strong>{item.title}</strong>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              {course.aiSkillsDescription && (
                <div className="course-detail__included-ai">
                  <span aria-hidden="true">🤖</span> <span>{course.aiSkillsDescription}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {course.targetAudience && (
          <section data-reveal>
            <h2>Who this course is for</h2>
            <div className="text-muted rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(course.targetAudience) }} />
          </section>
        )}

        {course.requirements && (
          <section data-reveal>
            <h2>Requirements</h2>
            <div className="text-muted rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(course.requirements) }} />
          </section>
        )}

        {course.modules.length > 0 && (
          <section data-reveal>
            <h2>Course outline</h2>
            {course.modules.map((module) => (
              <details key={module.id} open>
                <summary>{module.title}</summary>
                {module.description && <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(module.description) }} />}
                {module.topics.length > 0 && (
                  <ul className="course-detail__topic-list">
                    {module.topics.map((topic) => (
                      <li key={topic.id}>{topic.title}</li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section data-reveal>
            <h2>Projects you'll build</h2>
            <ul className="course-detail__project-list">
              {projects.map((project) => (
                <li key={project}>{project}</li>
              ))}
            </ul>
          </section>
        )}

        {cohortsError && <ErrorState message="We couldn’t check cohort availability." onRetry={() => refetchCohorts()} />}
        {!cohortsLoading && !cohortsError && !available && <div className="notice-panel notice-panel--quiet"><h2>The next cohort is on its way.</h2><p>There are no open cohorts right now. Contact our team for upcoming dates.</p></div>}
        {cohorts && cohorts.length > 0 && (
          <section data-reveal>
            <h2>Upcoming cohorts</h2>
            <div className="course-detail__cohorts" data-reveal-stagger>
              {cohorts.map((cohort) => (
                <div className="card course-detail__cohort" key={cohort.id}>
                  <strong>{cohort.name}</strong>
                  {cohort.privateTutorial ? (
                    <>
                      <span>1-on-1 private tutorial</span>
                      <span className="text-muted">Flexible schedule — tell us your preferred time when you register.</span>
                    </>
                  ) : (
                    <>
                      {formatDateRange(cohort.startDate, cohort.endDate) && (
                        <span>{formatDateRange(cohort.startDate, cohort.endDate)}</span>
                      )}
                      {cohort.schedule && <span>{cohort.schedule}</span>}
                      {cohort.time && <span>{cohort.time}</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {course.instructorName && (
          <section className="instructor-feature" data-reveal>
            <span className="eyebrow">EXPERIENCE. SHARED.</span><h2>About your instructor</h2>
            <div className="course-detail__instructor">
              <Portrait name={course.instructorName} src={course.instructorAvatarUrl} large />
              <div>
                <strong>{course.instructorName}</strong>
                {course.instructorBio && (
                  <div className="text-muted rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(course.instructorBio) }} />
                )}
              </div>
            </div>
          </section>
        )}

        {course.faqs.length > 0 && (
          <section data-reveal>
            <span className="eyebrow">A LITTLE CLARITY</span>
            <h2>Frequently asked questions</h2>
            <FaqAccordion faqs={course.faqs} />
          </section>
        )}

        <section className="notice-panel" data-reveal>
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <h2>Start your next chapter.</h2>
          <p>Register your interest and our team will reach out with next steps.</p>
          <Link to={enrol} className="btn btn-primary">
            {enrolLabel} <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
        <aside className="course-enrolment card">
          <CourseArtwork image={course.image} title={course.title} />
          <div className="enrolment-body">
            <span className="eyebrow">INVEST IN YOUR NEXT CHAPTER</span>
            <strong className="enrolment-price"><PriceTag price={course.price} discountPrice={course.discountPrice} size="lg" /></strong>
            <p>{available ? 'Choose the learning option that fits your life.' : 'Get in touch for upcoming dates.'}</p>
            {cohorts?.[0] && <div className="enrolment-schedule"><Icon name="calendar" size={18} /><div><strong>{cohorts[0].privateTutorial ? 'Flexible private tutorial' : formatDateRange(cohorts[0].startDate, cohorts[0].endDate) || 'Dates to be confirmed'}</strong><span>{cohorts[0].schedule} {cohorts[0].time}</span></div></div>}
            <Link to={enrol} className="btn btn-primary">{enrolLabel} <Icon name="arrow" size={16} /></Link>
            <div className="enrolment-facts">
              {course.duration && <div><Icon name="clock" size={17} /><span>Duration</span><strong>{course.duration}</strong></div>}
              {course.level && <div><Icon name="layers" size={17} /><span>Level</span><strong>{course.level}</strong></div>}
              <div><Icon name="globe" size={17} /><span>Format</span><strong>100% Online</strong></div>
              {course.certificateAvailable && <div><Icon name="shield" size={17} /><span>Certificate</span><strong>Included</strong></div>}
              {course.aiSkillsDescription && <div><span aria-hidden="true">🤖</span><span>AI skills</span><strong>Included</strong></div>}
            </div>
            <Link to="/about#faq" className="text-link enrolment-help">Have a question? Explore FAQs <Icon name="diagonal" size={13} /></Link>
          </div>
        </aside>
      </div>
    </>
  );
}
