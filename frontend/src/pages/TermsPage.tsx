import { sanitizeRichText } from "../utils/richText";
import { Link } from "react-router-dom";
import { useTerms } from "../hooks/useTerms";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { Icon } from "../components/Icon";
import "./TermsPage.css";

export function TermsPage() {
  const { data, isLoading, isError, refetch } = useTerms();

  return (
    <>
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow"><Icon name="shield" size={15} /> THE FINE PRINT, MADE PLAIN</span>
          <h1>Terms &amp; <em>Conditions.</em></h1>
          <p>How we handle your registration, your contact details, and your time with us.</p>
        </div>
      </section>

      <div className="container terms-page">
        {isLoading && <LoadingState label="Loading terms…" />}
        {isError && <ErrorState message="We couldn't load the terms right now." onRetry={() => refetch()} />}
        {data && (
          <>
            <div className="card terms-page__content rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(data.content) }} data-reveal />
            <p className="text-muted terms-page__updated">
              Last updated {new Date(data.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </>
        )}
        <div className="notice-panel terms-page__cta" data-reveal>
          <span className="eyebrow">STILL HAVE QUESTIONS?</span>
          <h2>We're happy to explain further.</h2>
          <p>Reach out before you register if anything here isn't clear.</p>
          <Link to="/about#contact" className="btn btn-primary">Get in touch <Icon name="arrow" size={16} /></Link>
        </div>
      </div>
    </>
  );
}
