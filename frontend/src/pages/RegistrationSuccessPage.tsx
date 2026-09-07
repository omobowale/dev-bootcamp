import { useState } from "react";
import { Icon } from "../components/Icon";
import { Link, useLocation, Navigate } from "react-router-dom";
import type { RegistrationResponse } from "../types/registration";
import { useSiteContent } from "../hooks/useSiteContent";
import { whatsappLink } from "../utils/links";
import { notify } from "../lib/notify";
import { downloadRegistrationConfirmationPdf } from "../utils/registrationPdf";
import "./RegistrationSuccessPage.css";

export function RegistrationSuccessPage() {
  const { data: site } = useSiteContent();
  const location = useLocation();
  const registration = location.state as RegistrationResponse | null;

  if (!registration) {
    // Direct visit or a page refresh loses router state — send them somewhere useful
    // rather than showing a confirmation with nothing to confirm.
    return <Navigate to="/courses" replace />;
  }

  const message =
    `Hi! I just registered for ${registration.courseTitle} (${registration.cohortName}). ` +
    `My registration number is ${registration.registrationNumber}.` +
    (registration.preferredTime ? ` My preferred time: ${registration.preferredTime}.` : "");

  const contact = whatsappLink(site?.whatsappNumber, message);
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    try {
      await downloadRegistrationConfirmationPdf(registration);
    } catch {
      notify("Couldn't generate the PDF. Please try again.", "info");
    } finally {
      setDownloading(false);
    }
  };
  return (
    <section className="registration-success">
      <div className="container registration-success__inner">
        <span className="success-seal"><Icon name="check" size={32} /></span><span className="eyebrow">YOUR NEXT CHAPTER STARTS NOW</span>
        <h1>Thanks, {registration.fullName.split(" ")[0]}! Your registration is confirmed.</h1>
        <p className="text-muted">
          A confirmation email is on its way to <strong>{registration.email}</strong>.
        </p>

        <div className="card registration-success__card">
          <span className="registration-success__label">Registration number</span>
          <strong className="registration-success__number">{registration.registrationNumber}</strong>
          <div className="confirmation-tools"><button className="btn btn-secondary" type="button" onClick={async () => { try { await navigator.clipboard.writeText(registration.registrationNumber); notify('Registration reference copied.'); } catch { notify('Select the reference above and copy it manually.', 'info'); } }}><Icon name="copy" size={16} />Copy reference</button><button className="btn btn-secondary" type="button" onClick={download} disabled={downloading}><Icon name="download" size={16} />{downloading ? "Preparing PDF…" : "Download PDF"}</button></div>
          <dl className="registration-success__details">
            <div>
              <dt>Course</dt>
              <dd>{registration.courseTitle}</dd>
            </div>
            <div>
              <dt>Cohort</dt>
              <dd>{registration.cohortName}{registration.privateTutorial ? " (Private tutorial)" : ""}</dd>
            </div>
            {registration.preferredTime && (
              <div>
                <dt>Preferred time</dt>
                <dd>{registration.preferredTime}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="notice-panel registration-success__next" data-reveal>
          <span className="eyebrow">WHAT HAPPENS NEXT</span>
          <h2>We'll reach out on WhatsApp.</h2>
          <p>
            {registration.privateTutorial
              ? "This is a private tutorial with no fixed schedule — our team will message you on WhatsApp to confirm a time that works for both you and the instructor."
              : "Our team will contact you on WhatsApp with next steps, including how to join the course group."}{" "}
            Payment details are handled manually and will be shared during that conversation.
          </p>
          {contact && <a
            className="btn btn-primary"
            href={contact}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us on WhatsApp <span aria-hidden="true">↗</span>
          </a>}
          {site?.supportEmail && <a className="text-link" href={`mailto:${site.supportEmail}`}>Email our team <Icon name="mail" size={16} /></a>}
        </div>

        <Link to="/courses" className="text-link registration-success__back">
          ← Back to all courses
        </Link>
      </div>
    </section>
  );
}
