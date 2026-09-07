import type { RegistrationResponse } from "../types/registration";

// A4 in points (jsPDF's "pt" unit) and a shared page margin.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;

const BRAND_PRIMARY = "#087f68";
const BRAND_DARK = "#182c27";
const BRAND_MUTED = "#697c76";
const BRAND_BORDER = "#e0e8e5";

// jsPDF is a real dependency but this is the only place that needs it — load
// it lazily so its cost is only paid when a student actually downloads a
// confirmation, not on first page load.
const loadJsPdf = async () => {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
};

/** Draws the DevTraining brand mark (the same rounded "</>" glyph used on the live site) directly with vector primitives, so the PDF never depends on a separate logo image file. */
function drawBrandMark(doc: InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>, x: number, y: number, size: number) {
  doc.setFillColor(BRAND_PRIMARY);
  doc.roundedRect(x, y, size, size, size * 0.28, size * 0.28, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("courier", "bold");
  doc.setFontSize(size * 0.5);
  doc.text("</>", x + size / 2, y + size / 2 + size * 0.05, { align: "center", baseline: "middle" });
}

function addWatermark(doc: InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>) {
  doc.saveGraphicsState();
  // @ts-expect-error — GState is attached to the jsPDF instance at runtime, not in its type declarations.
  doc.setGState(new doc.GState({ opacity: 0.05 }));
  doc.setTextColor(BRAND_PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(92);
  doc.text("DEVTRAINING", PAGE_WIDTH / 2, PAGE_HEIGHT / 2, { align: "center", angle: 35 });
  doc.restoreGraphicsState();
}

function addLetterhead(doc: InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>) {
  doc.setFillColor(BRAND_DARK);
  doc.rect(0, 0, PAGE_WIDTH, 74, "F");
  drawBrandMark(doc, MARGIN, 20, 34);
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("DevTraining.", MARGIN + 44, 33);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#c9dcd6");
  doc.text("Registration confirmation", MARGIN + 44, 49);
}

function addFooter(doc: InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND_MUTED);
  doc.text(`Generated ${new Date().toLocaleString()}`, MARGIN, PAGE_HEIGHT - 28);
  doc.text("This confirms your registration of interest, not payment. devtraining.example", PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 28, { align: "right" });
}

function row(
  doc: InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>,
  y: number,
  label: string,
  value: string
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(BRAND_MUTED);
  doc.text(label.toUpperCase(), MARGIN, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(BRAND_DARK);
  doc.text(value, MARGIN, y + 16);
  return y + 40;
}

export async function downloadRegistrationConfirmationPdf(registration: RegistrationResponse) {
  const JsPdf = await loadJsPdf();
  const doc = new JsPdf({ unit: "pt", format: "a4" });

  addWatermark(doc);
  addLetterhead(doc);

  let y = 130;

  // Registration number — the single most important thing on the page — gets its own
  // highlighted card rather than sitting in the same key/value list as everything else.
  doc.setFillColor("#eef3f1");
  doc.setDrawColor(BRAND_BORDER);
  doc.roundedRect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 64, 10, 10, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(BRAND_MUTED);
  doc.text("REGISTRATION NUMBER", MARGIN + 20, y + 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(BRAND_PRIMARY);
  doc.text(registration.registrationNumber, MARGIN + 20, y + 48);
  y += 100;

  doc.setDrawColor(BRAND_BORDER);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 30;

  y = row(doc, y, "Full name", registration.fullName);
  y = row(doc, y, "Email", registration.email);
  y = row(doc, y, "Course", registration.courseTitle);
  y = row(
    doc,
    y,
    "Cohort",
    registration.cohortName + (registration.privateTutorial ? " (Private 1-on-1 tutorial)" : "")
  );
  if (registration.preferredTime) {
    y = row(doc, y, "Preferred time", registration.preferredTime);
  }

  y += 10;
  doc.setDrawColor(BRAND_BORDER);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(BRAND_DARK);
  doc.text("What happens next", MARGIN, y);
  y += 20;

  const nextSteps = registration.privateTutorial
    ? "This is a private tutorial with no fixed schedule. Our team will message you on WhatsApp to confirm a time that works for both you and the instructor. Payment details are handled manually and will be shared during that conversation."
    : "Our team will contact you on WhatsApp with next steps, including how to join the course group. Payment details are handled manually and will be shared during that conversation.";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(BRAND_MUTED);
  const wrapped = doc.splitTextToSize(nextSteps, PAGE_WIDTH - MARGIN * 2);
  doc.text(wrapped, MARGIN, y);

  addFooter(doc);
  doc.save(`DevTraining-${registration.registrationNumber}.pdf`);
}
