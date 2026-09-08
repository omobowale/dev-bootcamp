import type { Certificate } from "../types/student";
import { formatDate } from "./formatDate";

const W = 841.89, H = 595.28;
const INK = "#183B31", GREEN = "#104C3C", GOLD = "#C3A36B", MUTED = "#62736A";
const loadJsPdf = async () => (await import("jspdf")).jsPDF;
type Doc = InstanceType<Awaited<ReturnType<typeof loadJsPdf>>>;

function label(doc: Doc, text: string, x: number, y: number, color = MUTED) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(color);
  doc.setCharSpace(1.5); doc.text(text, x, y); doc.setCharSpace(0);
}

/** Fit complete values into their reserved area; never truncate a recipient's name. */
function fitted(doc: Doc, text: string, x: number, y: number, width: number, size: number, maxLines = 2) {
  const clean = text.replace(/\s+/g, " ").trim();
  let lines: string[] = [];
  do { doc.setFontSize(size); lines = doc.splitTextToSize(clean, width); if (lines.length <= maxLines) break; size -= 1; } while (size > 8);
  doc.text(lines, x, y, { lineHeightFactor: 1.15 });
}

function seal(doc: Doc, x: number, y: number) {
  doc.setDrawColor(GOLD); doc.setLineWidth(.6);
  for (let i = 0; i < 48; i++) {
    const a = i * Math.PI / 24;
    doc.line(x + Math.cos(a)*35,y + Math.sin(a)*35,x + Math.cos(a)*39,y + Math.sin(a)*39);
  }
  doc.circle(x,y,31,"S"); doc.circle(x,y,27,"S");
  doc.setLineWidth(2);doc.line(x-10,y,x-2,y+8);doc.line(x-2,y+8,x+13,y-10);
}

/** Vector artwork remains sharp on screen and in print; no external images required. */
export async function createCertificatePdf(certificate: Certificate, origin = window.location.origin) {
  const JsPdf = await loadJsPdf();
  const doc = new JsPdf({ unit: "pt", format: "a4", orientation: "landscape", compress: true });
  doc.setProperties({ title: `Certificate of Completion - ${certificate.studentName}`, subject: certificate.courseTitle, author: "DevTraining", creator: "DevTraining Learning Platform" });
  doc.setFillColor("#FAF9F5");doc.rect(0,0,W,H,"F");
  doc.setFillColor(GREEN);doc.rect(20,20,168,H-40,"F");
  doc.setDrawColor("#28614E");doc.setLineWidth(.5);
  for(let i=0;i<9;i++) { doc.line(20,220+i*25,188,85+i*25); }
  doc.setFillColor(GREEN);doc.rect(35,38,138,99,"F");
  doc.setTextColor("#FFFFFF");doc.setFont("courier","bold");doc.setFontSize(29);doc.text("</>",53,77);
  doc.setFont("helvetica","bold");doc.setFontSize(17);doc.text("DevTraining.",40,110);
  label(doc,"LEARN. BUILD. GROW.",40,130,"#D5E5DA");
  seal(doc,104,376);
  label(doc,"COMPLETION",62,435,"#E6D5B3");label(doc,"AWARD",83,451,"#E6D5B3");
  doc.setDrawColor(GOLD);doc.setLineWidth(1);doc.line(60,480,148,480);
  doc.setFont("times","italic");doc.setFontSize(12);doc.setTextColor("#DFEAE0");
  doc.text(["A milestone earned.","A future in the making."],104,510,{align:"center",lineHeightFactor:1.5});

  doc.setDrawColor("#DCD9CC");doc.setLineWidth(.6);doc.rect(202,20,W-222,H-40,"S");
  doc.setDrawColor(GOLD);doc.setLineWidth(2);doc.line(226,43,271,43);doc.line(226,43,226,68);
  doc.line(W-39,H-43,W-84,H-43);doc.line(W-39,H-43,W-39,H-68);
  const x=236, width=544;
  label(doc,"DEVTRAINING LEARNING PLATFORM",x,77);
  doc.setFont("times","normal");doc.setFontSize(46);doc.setTextColor(INK);doc.text("Certificate",x,132);
  label(doc,"OF COMPLETION",x+2,155,GREEN);
  doc.setDrawColor(GOLD);doc.setLineWidth(.8);doc.line(x,177,x+width,177);
  doc.setFont("helvetica","normal");doc.setFontSize(11);doc.setTextColor(MUTED);doc.text("This certificate is proudly presented to",x,211);
  doc.setFont("times","bold");doc.setTextColor(INK);fitted(doc,certificate.studentName,x,256,width,37);
  doc.setFont("helvetica","normal");doc.setFontSize(11);doc.setTextColor(MUTED);
  doc.text("for successfully completing the course",x,321);
  doc.setFont("helvetica","bold");doc.setTextColor(GREEN);fitted(doc,certificate.courseTitle,x,354,width,23);
  doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(MUTED);
  doc.text("Awarded in recognition of meeting the course completion requirements.",x,414);
  doc.setDrawColor("#DCD9CC");doc.setLineWidth(.6);doc.line(x,443,x+width,443);
  label(doc,"COMPLETION DATE",x,467);label(doc,"STUDENT ID",x+272,467);
  doc.setFont("helvetica","bold");doc.setTextColor(INK);
  fitted(doc,formatDate(certificate.completionDate) || certificate.completionDate,x,490,246,12,1);
  fitted(doc,certificate.studentCode,x+272,490,272,12,1);
  label(doc,"ISSUED BY DEVTRAINING",x,520);
  const verifyUrl = new URL(`/verify/${encodeURIComponent(certificate.verificationId)}`,origin).href;
  doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(MUTED);
  doc.text("Certificate ID",x,543);
  doc.setFont("courier","bold");doc.setTextColor(GREEN);fitted(doc,certificate.verificationId,x+65,543,325,9,1);
  doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(GREEN);
  doc.textWithLink("Verify certificate",x+width-74,543,{url:verifyUrl});
  doc.setDrawColor(GOLD);doc.setLineWidth(.5);doc.line(x+width-74,546,x+width,546);
  return doc;
}

export async function downloadCertificatePdf(certificate: Certificate) {
  const doc = await createCertificatePdf(certificate);
  doc.save(`DevTraining-Certificate-${certificate.verificationId.replace(/[^a-zA-Z0-9_-]/g,"_")}.pdf`);
}
