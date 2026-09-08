import type { Certificate } from "../types/student";
import { formatDate } from "./formatDate";

// A4 landscape in points — a certificate reads as a certificate in landscape,
// not as a tall receipt (that's the registration-confirmation PDF's shape).
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const OUTER_BORDER = 26;
const INNER_BORDER = 36;
const CONTENT_MARGIN = 64;
const CENTER_X = PAGE_WIDTH / 2;

const BRAND_PRIMARY = "#087f68";
const BRAND_DARK = "#182c27";
const BRAND_MUTED = "#697c76";
const BRAND_BORDER = "#e0e8e5";

// jsPDF is a real dependency but this is the only place that needs it — load
// it lazily so its cost is only paid when a student actually downloads a
// certificate, not on first page load.
const loadJsPdf = async () => {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
};

type Doc = InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>;

/** Draws the DevTraining brand mark (the same rounded "</>" glyph used on the live site) directly with vector primitives, so the PDF never depends on a separate logo image file. */
function drawBrandMark(doc: Doc, x: number, y: number, size: number) {
  doc.setFillColor(BRAND_PRIMARY);
  doc.roundedRect(x, y, size, size, size * 0.28, size * 0.28, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("courier", "bold");
  doc.setFontSize(size * 0.5);
  doc.text("</>", x + size / 2, y + size / 2 + size * 0.05, { align: "center", baseline: "middle" });
}

/** Manual letter/word spacing (jsPDF's built-in fonts have no letter-spacing API) for a tracked-out caps look on short headings. */
function trackedText(text: string): string {
  return text
    .split(" ")
    .map((word) => word.split("").join(" "))
    .join("   ");
}

function addWatermark(doc: Doc) {
  doc.saveGraphicsState();
  // @ts-expect-error — GState is attached to the jsPDF instance at runtime, not in its type declarations.
  doc.setGState(new doc.GState({ opacity: 0.04 }));
  doc.setTextColor(BRAND_PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(140);
  doc.text("DEVTRAINING", CENTER_X, PAGE_HEIGHT / 2, { align: "center", angle: 22 });
  doc.restoreGraphicsState();
}

/** The double-ruled border a certificate is expected to have — a thin outer rule and a heavier brand-colored inner rule, the classic certificate frame. */
function addBorderFrame(doc: Doc) {
  doc.setDrawColor(BRAND_BORDER);
  doc.setLineWidth(1);
  doc.rect(OUTER_BORDER, OUTER_BORDER, PAGE_WIDTH - OUTER_BORDER * 2, PAGE_HEIGHT - OUTER_BORDER * 2, "S");

  doc.setDrawColor(BRAND_PRIMARY);
  doc.setLineWidth(1.75);
  doc.rect(INNER_BORDER, INNER_BORDER, PAGE_WIDTH - INNER_BORDER * 2, PAGE_HEIGHT - INNER_BORDER * 2, "S");
  doc.setLineWidth(1);
}

function addHeader(doc: Doc) {
  const markSize = 30;
  const wordmark = "DevTraining.";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const wordmarkWidth = doc.getTextWidth(wordmark);
  const startX = CENTER_X - (markSize + 10 + wordmarkWidth) / 2;
  const y = 64;
  drawBrandMark(doc, startX, y, markSize);
  doc.setTextColor(BRAND_DARK);
  doc.text(wordmark, startX + markSize + 10, y + markSize / 2 + 5);
}

/** A medallion-style seal — concentric rings plus a checkmark — drawn with vector primitives so no image asset is needed, echoing the "verified" idea without a generic clip-art look. */
function addSeal(doc: Doc, cx: number, cy: number) {
  const r = 30;
  doc.setDrawColor(BRAND_PRIMARY);
  doc.setLineWidth(1.25);
  doc.circle(cx, cy, r, "S");
  doc.setLineWidth(0.75);
  doc.circle(cx, cy, r - 5, "S");
  doc.setFillColor(BRAND_PRIMARY);
  doc.circle(cx, cy, r - 10, "F");

  doc.setDrawColor("#ffffff");
  doc.setLineWidth(2.5);
  doc.lines(
    [
      [7, 7],
      [13, -15],
    ],
    cx - 10,
    cy + 2,
    [1, 1],
    "S",
    false
  );
  doc.setLineWidth(1);
}

function addFooter(doc: Doc) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(BRAND_MUTED);
  doc.text(`Generated ${new Date().toLocaleString()}`, OUTER_BORDER + 4, PAGE_HEIGHT - 10);
  doc.text("Verify this certificate at devtraining.example/verify", PAGE_WIDTH - OUTER_BORDER - 4, PAGE_HEIGHT - 10, {
    align: "right",
  });
}

export async function downloadCertificatePdf(certificate: Certificate) {
  const JsPdf = await loadJsPdf();
  const doc = new JsPdf({ unit: "pt", format: "a4", orientation: "landscape" });

  addWatermark(doc);
  addBorderFrame(doc);
  addHeader(doc);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(BRAND_PRIMARY);
  doc.text(trackedText("CERTIFICATE OF COMPLETION"), CENTER_X, 118, { align: "center" });

  doc.setDrawColor(BRAND_PRIMARY);
  doc.setLineWidth(1.5);
  doc.line(CENTER_X - 60, 128, CENTER_X + 60, 128);
  doc.setLineWidth(1);

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(BRAND_MUTED);
  doc.text("This certifies that", CENTER_X, 168, { align: "center" });

  // The student's name is the focal point of the whole page — largest text, centered, serif.
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.setTextColor(BRAND_DARK);
  doc.text(certificate.studentName, CENTER_X, 212, { align: "center" });
  const nameWidth = doc.getTextWidth(certificate.studentName);
  doc.setDrawColor(BRAND_BORDER);
  doc.setLineWidth(1);
  doc.line(CENTER_X - nameWidth / 2 - 20, 224, CENTER_X + nameWidth / 2 + 20, 224);

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(BRAND_MUTED);
  doc.text("has successfully completed the course", CENTER_X, 254, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(BRAND_PRIMARY);
  const courseLines = doc.splitTextToSize(certificate.courseTitle, PAGE_WIDTH - CONTENT_MARGIN * 2 - 80);
  doc.text(courseLines, CENTER_X, 288, { align: "center" });
  const courseBlockHeight = courseLines.length * 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(BRAND_MUTED);
  const completedLabel = `Completed on ${formatDate(certificate.completionDate) ?? certificate.completionDate}`;
  doc.text(completedLabel, CENTER_X, 288 + courseBlockHeight + 6, { align: "center" });

  // Bottom row: a signature-style line (left), the seal (center), and the verification id (right) —
  // the layout a printed certificate normally carries, minus an actual signature image.
  const lineY = PAGE_HEIGHT - INNER_BORDER - 56;

  const leftX = CONTENT_MARGIN + 10;
  doc.setDrawColor(BRAND_MUTED);
  doc.setLineWidth(1);
  doc.line(leftX, lineY, leftX + 150, lineY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BRAND_DARK);
  doc.text("DevTraining Learning Team", leftX, lineY + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND_MUTED);
  doc.text("Program administrator", leftX, lineY + 28);

  addSeal(doc, CENTER_X, lineY - 12);

  const rightX = PAGE_WIDTH - CONTENT_MARGIN - 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND_MUTED);
  doc.text("VERIFICATION ID", rightX, lineY - 14, { align: "right" });
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(BRAND_PRIMARY);
  doc.text(certificate.verificationId, rightX, lineY + 2, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND_MUTED);
  doc.text(`Student ID ${certificate.studentCode}`, rightX, lineY + 16, { align: "right" });

  addFooter(doc);
  doc.save(`DevTraining-Certificate-${certificate.verificationId}.pdf`);
}
