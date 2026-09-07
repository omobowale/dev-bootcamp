import { Link } from "react-router-dom";
import { usePrivateTutorialOptions } from "../hooks/usePrivateTutorialOptions";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { CourseArtwork } from "../components/CourseArtwork";
import { PriceTag } from "../components/PriceTag";
import { Icon, type IconName } from "../components/Icon";
import { registerPath } from "../constants/routes";
import "../components/CourseCard.css";
import "./PrivateTutorialsPage.css";

const perks: { icon: IconName; title: string; text: string }[] = [
  { icon: "clock", title: "Your schedule, not a cohort's", text: "Tell us the time that works for you — no fixed class times to work around." },
  { icon: "users", title: "One instructor, one focus", text: "Every session is built around your pace, your questions, and your goals." },
  { icon: "spark", title: "Faster progress", text: "Skip the parts you already know and go deeper on the parts you don't." },
];

export function PrivateTutorialsPage() {
  const { data: options, isLoading, isError, refetch } = usePrivateTutorialOptions();

  return (
    <>
      <section className="page-intro private-tutorials-intro">
        <div className="container">
          <span className="eyebrow"><Icon name="spark" size={15} /> BECAUSE YOU'RE NOT JUST ANOTHER STUDENT</span>
          <h1>Private tutorials.<br /><em>Built around you.</em></h1>
          <p>1-on-1 training with a dedicated instructor, on a schedule you choose. Delivered 100% online.</p>
          <a href="#options" className="btn btn-primary">See available courses <Icon name="arrow" size={16} /></a>
        </div>
      </section>

      <section className="container section private-tutorials-perks" data-reveal>
        <div className="section-heading">
          <div>
            <span className="eyebrow">WHY GO PRIVATE</span>
            <h2>Learning, on your terms.</h2>
          </div>
        </div>
        <div className="principle-grid" data-reveal-stagger>
          {perks.map((perk) => (
            <article key={perk.title}>
              <span className="principle-icon"><Icon name={perk.icon} size={25} /></span>
              <h3>{perk.title}</h3>
              <p>{perk.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="options" className="container section private-tutorials-options" data-reveal>
        <div className="section-heading">
          <div>
            <span className="eyebrow">AVAILABLE FOR</span>
            <h2>Choose your course.</h2>
            <p>Every private tutorial is scheduled individually — register your interest and we'll confirm a time with you directly.</p>
          </div>
        </div>

        {isLoading && <LoadingState label="Loading private tutorial options…" />}
        {isError && <ErrorState message="We couldn't load private tutorial options right now." onRetry={() => refetch()} />}

        {!isLoading && !isError && (options?.length ?? 0) === 0 && (
          <div className="notice-panel">
            <Icon name="users" size={24} />
            <h3>No private tutorial slots open right now.</h3>
            <p>Check back soon, or register your interest in a group cohort in the meantime.</p>
            <Link to="/courses" className="text-link">Explore courses <Icon name="arrow" size={15} /></Link>
          </div>
        )}

        {options && options.length > 0 && (
          <div className="private-tutorial-grid" data-reveal-stagger>
            {options.map((option) => (
              <article className="card private-tutorial-card" key={option.cohortId}>
                <CourseArtwork title={option.courseTitle} image={option.courseImage} />
                <div className="private-tutorial-card__body">
                  <div className="private-tutorial-card__kicker">
                    <span><span className="live-dot" /> 1-on-1 · Flexible schedule</span>
                    {option.aiSkillsDescription && <span title={option.aiSkillsDescription || undefined}>🤖</span>}
                  </div>
                  <h3>{option.courseTitle}</h3>
                  {option.shortDescription && <p>{option.shortDescription}</p>}
                  <div className="private-tutorial-card__bottom">
                    <PriceTag price={option.price} discountPrice={option.discountPrice} size="md" />
                    <Link
                      to={`${registerPath(option.courseSlug)}&cohort=${option.cohortId}`}
                      className="btn btn-primary"
                    >
                      Book this <Icon name="arrow" size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="container notice-panel private-tutorials-cta" data-reveal>
        <span className="eyebrow">DON'T SEE YOUR COURSE?</span>
        <h2>We may still be able to help.</h2>
        <p>Reach out and let us know what you're looking for — we're always expanding our private tutorial offerings.</p>
        <Link to="/about#contact" className="btn btn-primary">Get in touch <Icon name="arrow" size={16} /></Link>
      </section>
    </>
  );
}
