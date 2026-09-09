import { PriceTag } from "../components/PriceTag";
import { formatDateRange } from "../utils/formatDate";
import { Checkbox } from "../components/Checkbox";
import { Select } from "../components/Select";
import { Icon } from "../components/Icon";
import { ErrorState } from "../components/ErrorState";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { useCourses } from "../hooks/useCourses";
import { useCourseCohorts } from "../hooks/useCourseCohorts";
import { useCreateRegistration } from "../hooks/useCreateRegistration";
import { EXPERIENCE_LEVELS, REFERRAL_SOURCES } from "../constants/registrationOptions";
import { isValidEmail, isValidWhatsappNumber } from "../utils/validators";
import type { ExperienceLevel } from "../types/registration";
import "./RegisterPage.css";

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: courses, isLoading: coursesLoading, isError: coursesError, refetch: refetchCourses } = useCourses();

  const [courseId, setCourseId] = useState<number | "">("");
  const [cohortId, setCohortId] = useState<number | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [referralSource, setReferralSource] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [preferredTime, setPreferredTime] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const errorRef = useRef<HTMLDivElement>(null);
  const coursePreselected = useRef(false);
  const cohortPreselected = useRef(false);

  const { data: cohorts, isLoading: cohortsLoading, isError: cohortsError, refetch: refetchCohorts } = useCourseCohorts(courseId === "" ? undefined : courseId);
  const mutation = useCreateRegistration();

  const selectedCohort = cohorts?.find((c) => c.id === cohortId);
  const isPrivateTutorial = selectedCohort?.privateTutorial ?? false;

  // Preselect the course from ?course=:slug once the course list has loaded.
  useEffect(() => {
    const slug = searchParams.get("course");
    if (slug && courses && !coursePreselected.current) {
      coursePreselected.current = true;
      const match = courses.find((c) => c.slug === slug);
      if (match) setCourseId(match.id);
    }
  }, [searchParams, courses, courseId]);

  // Preselect the cohort from ?cohort=:id (e.g. arriving from the Private Tutorials page) once
  // that course's cohorts have loaded.
  useEffect(() => {
    const cohortParam = searchParams.get("cohort");
    if (cohortParam && cohorts && !cohortPreselected.current) {
      cohortPreselected.current = true;
      const match = cohorts.find((c) => c.id === Number(cohortParam));
      if (match) setCohortId(match.id);
    }
  }, [searchParams, cohorts, cohortId]);

  useEffect(() => {
    if (validationError || mutation.isError) {
      if (!validationError) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [validationError, mutation.isError]);

  const handleCourseChange = (value: string) => {
    setCourseId(value === "" ? "" : Number(value));
    setCohortId("");
    setPreferredTime("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Please enter your name.';
    if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
    if (!isValidWhatsappNumber(whatsappNumber)) errors.whatsappNumber = 'Use 7–15 digits, including your country code.';
    if (courseId === '') errors.courseId = 'Choose a course.';
    if (cohortId === '') errors.cohortId = 'Choose an available cohort.';
    if (!consentGiven) errors.consentGiven = 'Confirm that we may contact you about this registration.';
    if (isPrivateTutorial && !preferredTime.trim()) errors.preferredTime = 'Tell us your preferred days, time, and time zone.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setValidationError('A few details need your attention. Check the highlighted fields.');
      requestAnimationFrame(() => document.getElementById(Object.keys(errors)[0])?.focus());
      return;
    }
    if (courseId === '' || cohortId === '') return;
    try {
      const response = await mutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        whatsappNumber: whatsappNumber.trim(),
        courseId,
        cohortId,
        experienceLevel: experienceLevel === "" ? null : experienceLevel,
        referralSource: referralSource === "" ? null : referralSource,
        consentGiven,
        preferredTime: preferredTime.trim() === "" ? null : preferredTime.trim(),
      });
      navigate("/registration/success", { state: response });
    } catch {
      // handled below via mutation.isError / mutation.error
    }
  };

  const serverErrorMessage = (() => {
    const error = mutation.error;
    if (!error) return null;
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        return "Too many registration attempts. Please wait a minute and try again.";
      }
      const message = error.response?.data?.message;
      if (typeof message === "string") return message;
    }
    return "Something went wrong submitting your registration. Please try again.";
  })();

  return (
    <>
      <section className="page-intro registration-intro">
        <div className="container">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h1>Make your next <em>move.</em></h1>
          <p>Tell us a bit about yourself and we'll be in touch on WhatsApp with next steps.</p>
        </div>
      </section>

      <div className="container register-page">
        <aside className="register-aside" data-reveal>
          <span className="eyebrow"><Icon name="spark" size={15} /> GREAT THINGS START HERE</span>
          <h2>A little about you.<br />A lot of possibility.</h2>
          <p>Choose your course and tell us how to reach you. We will help you take it from there.</p>
          <div className="register-next-steps">
            <div><span>01</span><section><h3>Make it personal</h3><p>Add your contact details so we can connect.</p></section></div>
            <div><span>02</span><section><h3>Find your fit</h3><p>Choose a course and an available cohort.</p></section></div>
            <div><span>03</span><section><h3>You're on your way</h3><p>Our team will reach out with the next steps.</p></section></div>
          </div>
          <div className="register-assurance"><Icon name="shield" size={22} /><p>Your details are used to manage your registration and keep you informed about your course.</p></div>
        </aside>
        <form noValidate className="card register-form" onSubmit={handleSubmit}>
          <div className="form-section-heading"><span>01</span><div><h2>Your details</h2><p>Let's get to know you. Required fields are marked *.</p></div></div>
          {coursesError && <ErrorState message="We couldn't load available courses." onRetry={() => refetchCourses()} />}
          {(validationError || serverErrorMessage) && (
            <div className="form-error" role="alert" ref={errorRef}>
              {validationError ?? serverErrorMessage}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="fullName">Full name *</label>
            <input id="fullName" aria-invalid={!!fieldErrors.fullName} aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined} autoComplete="name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          {fieldErrors.fullName && <span id="fullName-error" className="field-error">{fieldErrors.fullName}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email address *</label>
            <input id="email" aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-error" : undefined} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {fieldErrors.email && <span id="email-error" className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="whatsappNumber">WhatsApp number *</label>
            <input
              id="whatsappNumber" aria-invalid={!!fieldErrors.whatsappNumber} aria-describedby={fieldErrors.whatsappNumber ? "whatsappNumber-error" : undefined} type="tel" autoComplete="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+234 800 000 0000"
              required
            />
          {fieldErrors.whatsappNumber && <span id="whatsappNumber-error" className="field-error">{fieldErrors.whatsappNumber}</span>}
          </div>

          <div className="form-section-heading form-section-heading--divided"><span>02</span><div><h2>Your learning path</h2><p>Choose what you want to build next.</p></div></div>
          <div className="form-field">
            <label htmlFor="courseId">Course *</label>
            <Select id="courseId" aria-invalid={!!fieldErrors.courseId} aria-describedby={fieldErrors.courseId ? "courseId-error" : undefined} value={courseId} onChange={(e) => handleCourseChange(e.target.value)} required>
              <option value="">{coursesLoading ? "Loading courses..." : "Select a course"}</option>
              {courses?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
{fieldErrors.courseId && <span id="courseId-error" className="field-error">{fieldErrors.courseId}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="cohortId">Cohort *</label>
            <Select
              id="cohortId" aria-invalid={!!fieldErrors.cohortId} aria-describedby={fieldErrors.cohortId ? "cohortId-error" : undefined}
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={courseId === "" || cohortsLoading || cohortsError}
              required
            >
              <option value="">{courseId === "" ? "Select a course first" : cohortsLoading ? "Loading cohorts..." : "Select a cohort"}</option>
              {cohorts?.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}{!cohort.privateTutorial && cohort.startDate ? ` · ${formatDateRange(cohort.startDate, cohort.endDate)}` : ""}
                  {cohort.privateTutorial ? " — Private tutorial (flexible schedule)" : ""}
                </option>
              ))}
            </Select>
{fieldErrors.cohortId && <span id="cohortId-error" className="field-error">{fieldErrors.cohortId}</span>}
            {cohortsError && <ErrorState message="We could not load cohorts for this course." onRetry={() => refetchCohorts()} />}
            {courseId !== "" && cohorts && cohorts.length === 0 && (
              <span className="text-muted register-form__hint">
                No open cohorts for this course right now — check back soon.
              </span>
            )}
          </div>

          {selectedCohort && <div className="selection-summary"><span className="eyebrow"><Icon name="calendar" size={15} /> YOUR LEARNING PLAN</span><h3>{selectedCohort.name}</h3><div><span>{selectedCohort.privateTutorial ? 'Private tutorial · flexible schedule' : formatDateRange(selectedCohort.startDate, selectedCohort.endDate)}</span><span>{selectedCohort.schedule}</span><span>{selectedCohort.time}</span><span>{selectedCohort.mode || courses?.find(course => course.id === courseId)?.mode}</span></div><PriceTag price={courses?.find(course => course.id === courseId)?.price ?? null} discountPrice={courses?.find(course => course.id === courseId)?.discountPrice ?? null} size="md" />{!selectedCohort.privateTutorial && !selectedCohort.time && <small>Our team will confirm the session time and time zone.</small>}</div>}
          {cohortId !== "" && (
            <div className="form-field">
              <label htmlFor="preferredTime">
                {isPrivateTutorial ? "Preferred time *" : "Preferred time (optional)"}
              </label>
              <input
                id="preferredTime" aria-invalid={!!fieldErrors.preferredTime} aria-describedby={fieldErrors.preferredTime ? "preferredTime-error" : undefined}
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder={
                  isPrivateTutorial
                    ? "e.g. Weekday evenings after 6pm WAT"
                    : "Any preference within the cohort's schedule?"
                }
                required={isPrivateTutorial}
              />
              <span className="text-muted register-form__hint">
                {isPrivateTutorial
                  ? "This is a private tutorial with no fixed schedule — tell us what works for you and we'll confirm a time on WhatsApp."
                  : "Optional — a note for the admin. It won't change this cohort's actual schedule."}
              </span>
            {fieldErrors.preferredTime && <span id="preferredTime-error" className="field-error">{fieldErrors.preferredTime}</span>}
          </div>
          )}

          <div className="form-field">
            <label htmlFor="experienceLevel">Experience level</label>
            <Select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            >
              <option value="">Prefer not to say</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="form-field">
            <label htmlFor="referralSource">How did you hear about us?</label>
            <Select id="referralSource" value={referralSource} onChange={(e) => setReferralSource(e.target.value)}>
              <option value="">Prefer not to say</option>
              {REFERRAL_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </Select>
          </div>

          <label className="register-form__consent">
            <Checkbox id="consentGiven" aria-invalid={!!fieldErrors.consentGiven} aria-describedby={fieldErrors.consentGiven ? "consentGiven-error" : undefined} checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} />
            <span>
              I consent to be contacted by Bukiva Learn via email and WhatsApp about this registration, and I've read the{" "}
              <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</Link>.
            </span>
          </label>

          {fieldErrors.consentGiven && <span id="consentGiven-error" className="field-error">{fieldErrors.consentGiven}</span>}
          <button type="submit" className="btn btn-primary register-form__submit" disabled={mutation.isPending || coursesLoading || coursesError || cohortsLoading || cohortsError}>
            {mutation.isPending ? "Submitting…" : "Submit registration"}
          </button>

          <Link to="/courses" className="text-link register-form__back">
            ← Back to courses
          </Link>
        </form>
      </div>
    </>
  );
}
