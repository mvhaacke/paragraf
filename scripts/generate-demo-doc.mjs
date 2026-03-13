import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";
import { writeFileSync } from "fs";

const doc = await PDFDocument.create();
const page = doc.addPage(PageSizes.A4);
const { width, height } = page.getSize();

const regular = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

const margin = 70;
const lineHeight = 16;
let y = height - margin;

function text(str, x, opts = {}) {
  page.drawText(str, {
    x,
    y,
    size: opts.size ?? 10,
    font: opts.bold ? bold : regular,
    color: opts.color ?? rgb(0, 0, 0),
  });
}

function line(str, opts = {}) {
  text(str, margin, opts);
  y -= opts.after ?? lineHeight;
}

function gap(n = 1) {
  y -= lineHeight * n;
}

// ── Court header ────────────────────────────────────────────
line("AMTSGERICHT HAGEN", { bold: true, size: 13 });
line("Heinitzstraße 42  •  44623 Herne", { size: 9, color: rgb(0.3, 0.3, 0.3) });
gap(0.5);

// Horizontal rule
page.drawLine({
  start: { x: margin, y },
  end: { x: width - margin, y },
  thickness: 0.8,
  color: rgb(0.4, 0.4, 0.4),
});
gap(1.5);

// ── Document title ───────────────────────────────────────────
line("MAHNBESCHEID", { bold: true, size: 15 });
line("gemäß § 693 ZPO", { size: 9, color: rgb(0.4, 0.4, 0.4) });
gap(1.5);

// ── Metadata block ───────────────────────────────────────────
const col2 = 220;

function metaRow(label, value) {
  text(label, margin, { size: 9, color: rgb(0.45, 0.45, 0.45) });
  text(value, col2, { size: 10, bold: true });
  y -= lineHeight;
}

metaRow("Aktenzeichen:", "12 B 4821/25");
metaRow("Antragsteller:", "Mustermann GmbH, 10115 Berlin");
metaRow("Antragsgegner:", "Max Muster, Musterstraße 1, 12345 Berlin");
metaRow("Hauptforderung:", "1.240,00 €");
metaRow("Zinsen:", "5 % über Basiszinssatz seit 01.03.2025");
metaRow("Kosten:", "32,00 €");
gap(0.5);
metaRow("Ausstellungsdatum:", "10. März 2025");
metaRow("Zustellungsdatum:", "12. März 2025");
gap(2);

// ── Body ─────────────────────────────────────────────────────
line("An den Antragsgegner:", { bold: true });
gap(0.5);

const body = [
  "Ihnen wird hiermit der Mahnbescheid des oben genannten Amtsgerichts zugestellt.",
  "Der Antragsteller behauptet, dass Ihnen gegenüber ein fälliger Anspruch in der",
  "oben genannten Höhe besteht.",
  "",
  "Sie haben folgende Möglichkeiten:",
  "",
  "  1.  Zahlung des geforderten Betrags innerhalb von 14 Tagen ab Zustellung.",
  "",
  "  2.  Widerspruch: Wenn Sie die Forderung bestreiten, können Sie innerhalb von",
  "       14 Tagen ab Zustellung schriftlich Widerspruch einlegen. Der Widerspruch",
  "       muss beim oben genannten Amtsgericht eingehen.",
  "",
  "  3.  Nichts tun: Legen Sie keinen Widerspruch ein und zahlen Sie nicht, wird",
  "       der Mahnbescheid nach Ablauf der Frist rechtskräftig. Der Antragsteller",
  "       kann dann einen Vollstreckungsbescheid beantragen und Ihre Konten oder",
  "       Ihr Gehalt pfänden lassen.",
  "",
  "Die Widerspruchsfrist endet am:  26. März 2025",
];

for (const row of body) {
  line(row, { size: 10 });
  if (row === "") y += 4; // tighten blank lines slightly
}

gap(2);

// ── Footer ───────────────────────────────────────────────────
page.drawLine({
  start: { x: margin, y },
  end: { x: width - margin, y },
  thickness: 0.5,
  color: rgb(0.7, 0.7, 0.7),
});
gap(1);
line("Amtsgericht Hagen  |  Dieses Schreiben wurde maschinell erstellt und ist ohne Unterschrift gültig.", {
  size: 7.5,
  color: rgb(0.5, 0.5, 0.5),
});

// ── Save ─────────────────────────────────────────────────────
const bytes = await doc.save();
writeFileSync("public/demo-mahnbescheid.pdf", bytes);
console.log("✓ Generated public/demo-mahnbescheid.pdf");