// Generates two realistic demo PDFs:
// - public/demo-mahnbescheid.pdf  (court payment order)
// - public/demo-inkassoschreiben.pdf  (debt collection letter)

const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public");
const ARIAL_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf";
const ARIAL_BOLD_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";

// ── helpers ──────────────────────────────────────────────────────────────────

function hline(page, x1, y, x2, thickness = 0.5, color = rgb(0, 0, 0)) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color });
}

function box(page, x, y, w, h, opts = {}) {
  page.drawRectangle({
    x, y, width: w, height: h,
    borderWidth: opts.borderWidth ?? 0.5,
    borderColor: opts.borderColor ?? rgb(0, 0, 0),
    color: opts.fill ?? undefined,
  });
}

// ── Mahnbescheid ─────────────────────────────────────────────────────────────

async function generateMahnbescheid() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const arialBytes = fs.readFileSync(ARIAL_PATH);
  const arialBoldBytes = fs.readFileSync(ARIAL_BOLD_PATH);
  const arial = await pdfDoc.embedFont(arialBytes, { subset: true });
  const arialBold = await pdfDoc.embedFont(arialBoldBytes, { subset: true });

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const W = 595.28;
  const H = 841.89;
  const ML = 65; // margin left
  const MR = 65; // margin right
  const CW = W - ML - MR; // content width = 465.28

  // ── Pale blue/grey header band ───────────────────────────────────────────
  page.drawRectangle({ x: 0, y: H - 110, width: W, height: 110, color: rgb(0.91, 0.93, 0.96) });

  // Court seal circle (simplified)
  page.drawCircle({ x: ML + 22, y: H - 55, size: 22, color: rgb(0.22, 0.35, 0.60) });
  page.drawCircle({ x: ML + 22, y: H - 55, size: 18, borderColor: rgb(1, 1, 1), borderWidth: 1.5, color: rgb(0.22, 0.35, 0.60) });
  page.drawText("AG", { x: ML + 15, y: H - 59, size: 10, font: arialBold, color: rgb(1, 1, 1) });

  // Court name
  page.drawText("Amtsgericht Wedding", { x: ML + 52, y: H - 42, size: 14, font: arialBold, color: rgb(0.10, 0.18, 0.40) });
  page.drawText("Gerichtliches Mahnverfahren", { x: ML + 52, y: H - 57, size: 9, font: arial, color: rgb(0.30, 0.30, 0.30) });
  page.drawText("Brunnenstr. 28 · 13355 Berlin · Tel. 030 9014-0", { x: ML + 52, y: H - 70, size: 7.5, font: arial, color: rgb(0.45, 0.45, 0.45) });

  // "MAHNBESCHEID" title centred in header
  const titleText = "MAHNBESCHEID";
  const titleW = arialBold.widthOfTextAtSize(titleText, 22);
  page.drawText(titleText, { x: (W - titleW) / 2, y: H - 47, size: 22, font: arialBold, color: rgb(0.12, 0.22, 0.50) });
  page.drawText("gemäß § 692 ZPO", { x: (W - arialBold.widthOfTextAtSize("gemäß § 692 ZPO", 9)) / 2, y: H - 61, size: 9, font: arial, color: rgb(0.35, 0.35, 0.35) });

  // Separator under header
  hline(page, 0, H - 110, W, 1.5, rgb(0.22, 0.35, 0.60));

  let y = H - 130;

  // ── Geschäftsnummer / dates row ──────────────────────────────────────────
  // Left box: Aktenzeichen
  box(page, ML, y - 28, 200, 34);
  page.drawText("Aktenzeichen (bitte bei Rückfragen angeben):", { x: ML + 5, y: y - 12, size: 7, font: arial, color: rgb(0.35, 0.35, 0.35) });
  page.drawText("26 MH 1847/26", { x: ML + 5, y: y - 24, size: 11, font: arialBold, color: rgb(0, 0, 0) });

  // Right box: Dates
  box(page, ML + 210, y - 28, 255, 34);
  page.drawText("Ausgefertigt am:", { x: ML + 215, y: y - 12, size: 7.5, font: arial });
  page.drawText("04.03.2026", { x: ML + 310, y: y - 12, size: 7.5, font: arialBold });
  page.drawText("Zugestellt am:", { x: ML + 215, y: y - 24, size: 7.5, font: arial });
  page.drawText("10.03.2026", { x: ML + 310, y: y - 24, size: 7.5, font: arialBold });

  y -= 50;

  // ── Parties section ──────────────────────────────────────────────────────
  const colMid = ML + CW / 2 + 5;

  // Section headers
  page.drawRectangle({ x: ML, y: y - 14, width: (CW / 2) - 5, height: 14, color: rgb(0.85, 0.88, 0.94) });
  page.drawText("Antragsteller (Gläubiger):", { x: ML + 5, y: y - 11, size: 7.5, font: arialBold });

  page.drawRectangle({ x: colMid, y: y - 14, width: (CW / 2) - 5, height: 14, color: rgb(0.85, 0.88, 0.94) });
  page.drawText("Antragsgegner (Schuldner):", { x: colMid + 5, y: y - 11, size: 7.5, font: arialBold });

  const partyBoxH = 72;
  box(page, ML, y - 14 - partyBoxH, (CW / 2) - 5, partyBoxH);
  box(page, colMid, y - 14 - partyBoxH, (CW / 2) - 5, partyBoxH);

  // Creditor
  const creditorLines = [
    "Klarna Bank AB",
    "(Zweigniederlassung Deutschland)",
    "Theresienhöhe 12",
    "80339 München",
    "",
    "vertreten durch: Klarna GmbH",
  ];
  creditorLines.forEach((line, i) => {
    page.drawText(line, { x: ML + 6, y: y - 24 - i * 10, size: 8, font: i === 0 ? arialBold : arial });
  });

  // Debtor
  const debtorLines = [
    "Max Mustermann",
    "Musterstraße 12",
    "10117 Berlin",
  ];
  debtorLines.forEach((line, i) => {
    page.drawText(line, { x: colMid + 6, y: y - 24 - i * 10, size: 8, font: i === 0 ? arialBold : arial });
  });

  y -= 14 + partyBoxH + 18;

  // ── Forderung table ──────────────────────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 14, width: CW, height: 14, color: rgb(0.85, 0.88, 0.94) });
  page.drawText("Forderungsaufstellung", { x: ML + 5, y: y - 11, size: 8, font: arialBold });

  const COL_AMT = W - MR - 5;
  const tableRows = [
    { label: "1. Hauptforderung (Restforderung aus Kaufvertrag vom 14.11.2025, Bestellnr. KL-2025-789034, Mahnungen vom 05.01.2026 und 22.01.2026)", amount: "312,47 €", bold: false },
    { label: "2. Verzugszinsen: 5 Prozentpunkte über dem Basiszinssatz gemäß § 288 Abs. 1 BGB seit dem 15.01.2026 aus 312,47 €", amount: "(lfd.)", bold: false },
    { label: "3. Auslagenpauschale gemäß § 288 Abs. 5 BGB", amount: "40,00 €", bold: false },
    { label: "4. Gerichtsgebühren (0,5-fache Gebühr gemäß Nr. 1100 KV-GKG)", amount: "36,00 €", bold: false },
    { label: "Gesamtbetrag der Hauptforderung(en) und bezifferter Nebenleistungen:", amount: "388,47 €", bold: true },
  ];

  const rowH = 16;
  let ty = y - 14;
  tableRows.forEach((row, i) => {
    const bg = i % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1);
    page.drawRectangle({ x: ML, y: ty - rowH, width: CW - 60, height: rowH, color: bg, borderWidth: 0 });
    page.drawRectangle({ x: W - MR - 60, y: ty - rowH, width: 60, height: rowH, color: bg, borderWidth: 0 });
    hline(page, ML, ty - rowH, W - MR, 0.3, rgb(0.8, 0.8, 0.8));

    // Wrap long label text
    const font = row.bold ? arialBold : arial;
    const maxLabelW = CW - 65;
    const words = row.label.split(" ");
    let line = "";
    let lineY = ty - 11;
    let lineCount = 0;
    words.forEach((word) => {
      const test = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(test, 7.5) > maxLabelW) {
        page.drawText(line, { x: ML + 5, y: lineY - lineCount * 9, size: 7.5, font });
        line = word;
        lineCount++;
      } else {
        line = test;
      }
    });
    if (line) page.drawText(line, { x: ML + 5, y: lineY - lineCount * 9, size: 7.5, font });

    // Amount right-aligned
    const amtW = font.widthOfTextAtSize(row.amount, 8);
    page.drawText(row.amount, { x: W - MR - 5 - amtW, y: ty - 11, size: 8, font });

    ty -= row.bold ? rowH + 2 : rowH;
    if (i === tableRows.length - 2) {
      hline(page, ML, ty + 2, W - MR, 1, rgb(0.12, 0.22, 0.50));
    }
  });

  // Final border under table
  hline(page, ML, ty, W - MR, 1, rgb(0.12, 0.22, 0.50));

  y = ty - 22;

  // ── Deadline notice ──────────────────────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 30, width: CW, height: 30, color: rgb(0.98, 0.96, 0.88), borderColor: rgb(0.80, 0.65, 0.10), borderWidth: 1 });
  page.drawText("Widerspruchsfrist:", { x: ML + 8, y: y - 13, size: 8.5, font: arialBold });
  page.drawText("Die Frist zur Einlegung des Widerspruchs beträgt zwei Wochen ab Zustellung.", { x: ML + 8, y: y - 24, size: 8, font: arial });
  const deadlineLabel = "Fristende: 24.03.2026";
  const dlW = arialBold.widthOfTextAtSize(deadlineLabel, 11);
  page.drawText(deadlineLabel, { x: W - MR - dlW - 8, y: y - 19, size: 11, font: arialBold, color: rgb(0.70, 0.10, 0.10) });

  y -= 48;

  // ── Belehrung ────────────────────────────────────────────────────────────
  page.drawText("Rechtsmittelbelehrung / Widerspruch:", { x: ML, y, size: 8.5, font: arialBold });
  y -= 13;

  const belehrung = [
    "Gegen diesen Mahnbescheid kann der Antragsgegner binnen einer Frist von zwei Wochen ab Zustellung",
    "Widerspruch einlegen. Der Widerspruch bedarf keiner Begründung. Er ist schriftlich oder zu Protokoll",
    "der Geschäftsstelle beim oben genannten Gericht einzulegen.",
    "",
    "Wird kein Widerspruch eingelegt, kann der Antragsteller nach Ablauf der Widerspruchsfrist die",
    "Erlassung eines Vollstreckungsbescheides beantragen. Ein Vollstreckungsbescheid steht einem",
    "rechtskräftigen Versäumnisurteil gleich und schafft einen 30 Jahre vollstreckbaren Titel.",
    "",
    "Zur Wahrung der Frist genügt die rechtzeitige Absendung des Widerspruchs.",
  ];

  belehrung.forEach((line) => {
    if (line === "") { y -= 5; return; }
    page.drawText(line, { x: ML, y, size: 7.5, font: arial, color: rgb(0.20, 0.20, 0.20) });
    y -= 11;
  });

  y -= 15;

  // ── Widerspruchsformular (tear-off) ──────────────────────────────────────
  // Dashed separator
  for (let x = ML; x < W - MR; x += 8) {
    page.drawLine({ start: { x, y }, end: { x: x + 4, y }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5), dashArray: [3, 5] });
  }
  page.drawText("✂  Widerspruchsformular (bitte hier abtrennen und einsenden)", {
    x: ML + 10, y: y - 11, size: 7.5, font: arial, color: rgb(0.35, 0.35, 0.35)
  });
  y -= 24;

  box(page, ML, y - 72, CW, 72);
  page.drawText("Widerspruch", { x: ML + 8, y: y - 14, size: 10, font: arialBold });
  page.drawText("Aktenzeichen: 26 MH 1847/26  |  Antragsteller: Klarna Bank AB  |  Antragsgegner: Max Mustermann", {
    x: ML + 8, y: y - 27, size: 7.5, font: arial
  });
  page.drawText("Ich/Wir legen hiermit Widerspruch gegen den Mahnbescheid vom 04.03.2026 ein.", {
    x: ML + 8, y: y - 42, size: 8, font: arial
  });
  page.drawText("Ort, Datum: ___________________________", { x: ML + 8, y: y - 60, size: 8, font: arial });
  page.drawText("Unterschrift: ___________________________", { x: ML + 240, y: y - 60, size: 8, font: arial });

  y -= 90;

  // ── Court stamp area ─────────────────────────────────────────────────────
  page.drawText("Amtsgericht Wedding · Gerichtliches Mahnverfahren", {
    x: ML, y: y, size: 7, font: arial, color: rgb(0.5, 0.5, 0.5)
  });
  page.drawText("Dieses Dokument wurde maschinell erstellt und ist ohne Unterschrift gültig (§ 703c Abs. 2 ZPO).", {
    x: ML, y: y - 11, size: 6.5, font: arial, color: rgb(0.5, 0.5, 0.5)
  });

  // Stamp circle top right
  page.drawCircle({ x: W - MR - 30, y: y - 10, size: 28, borderColor: rgb(0.22, 0.35, 0.60), borderWidth: 1 });
  page.drawText("AMTS-", { x: W - MR - 49, y: y - 4, size: 6, font: arialBold, color: rgb(0.22, 0.35, 0.60) });
  page.drawText("GERICHT", { x: W - MR - 51, y: y - 13, size: 6, font: arialBold, color: rgb(0.22, 0.35, 0.60) });
  page.drawText("WEDDING", { x: W - MR - 51, y: y - 22, size: 5.5, font: arialBold, color: rgb(0.22, 0.35, 0.60) });

  return pdfDoc.save();
}

// ── Inkassoschreiben ──────────────────────────────────────────────────────────

async function generateInkassoschreiben() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const arialBytes = fs.readFileSync(ARIAL_PATH);
  const arialBoldBytes = fs.readFileSync(ARIAL_BOLD_PATH);
  const arial = await pdfDoc.embedFont(arialBytes, { subset: true });
  const arialBold = await pdfDoc.embedFont(arialBoldBytes, { subset: true });

  const page = pdfDoc.addPage([595.28, 841.89]);
  const W = 595.28;
  const H = 841.89;
  const ML = 65;
  const MR = 65;
  const CW = W - ML - MR;

  // ── Letterhead ───────────────────────────────────────────────────────────
  // Left accent bar
  page.drawRectangle({ x: 0, y: H - 85, width: 8, height: 85, color: rgb(0.82, 0.12, 0.12) });

  // Company name
  page.drawText("EOS Deutscher Inkasso-Dienst GmbH", { x: ML, y: H - 32, size: 16, font: arialBold, color: rgb(0.12, 0.12, 0.12) });
  page.drawText("Ein Unternehmen der EOS Gruppe", { x: ML, y: H - 46, size: 8.5, font: arial, color: rgb(0.45, 0.45, 0.45) });

  // Right side contact info
  const contactLines = [
    "Steindamm 71 · 20099 Hamburg",
    "Tel. 040 2850-0 · Fax 040 2850-2666",
    "info@eos-solutions.de",
    "www.eos-solutions.de",
    "Reg.-Nr. 2010-MH-10-18-DE-01234",
  ];
  contactLines.forEach((line, i) => {
    const w = arial.widthOfTextAtSize(line, 7.5);
    page.drawText(line, { x: W - MR - w, y: H - 22 - i * 10, size: 7.5, font: arial, color: rgb(0.35, 0.35, 0.35) });
  });

  hline(page, ML, H - 88, W - MR, 0.8, rgb(0.82, 0.12, 0.12));

  let y = H - 110;

  // ── Recipient address block (DIN 5008 window position) ───────────────────
  page.drawText("EOS Deutscher Inkasso-Dienst GmbH · Steindamm 71 · 20099 Hamburg", {
    x: ML, y, size: 6.5, font: arial, color: rgb(0.5, 0.5, 0.5)
  });
  y -= 14;

  const recipientLines = ["Max Mustermann", "Musterstraße 12", "10117 Berlin"];
  recipientLines.forEach((line, i) => {
    page.drawText(line, { x: ML, y: y - i * 13, size: 10, font: i === 0 ? arialBold : arial });
  });

  // Date right-aligned
  page.drawText("Hamburg, den 28. Februar 2026", { x: W - MR - arial.widthOfTextAtSize("Hamburg, den 28. Februar 2026", 9) - 0, y: y, size: 9, font: arial });

  // Reference info block (right)
  const refLines = [
    { label: "Unser Aktenzeichen:", value: "EOS-2026-DE-3847192" },
    { label: "Ihr Zeichen:", value: "VF-2025-DE-891234" },
    { label: "Auftraggeber:", value: "Vodafone GmbH" },
    { label: "Forderungsnr.:", value: "VOD-9841203-B" },
  ];
  refLines.forEach((r, i) => {
    const ry = y - 13 - i * 11;
    page.drawText(r.label, { x: W - MR - 180, y: ry, size: 8, font: arial, color: rgb(0.45, 0.45, 0.45) });
    page.drawText(r.value, { x: W - MR - 90, y: ry, size: 8, font: arialBold });
  });

  y -= 58;

  // ── Subject line ─────────────────────────────────────────────────────────
  hline(page, ML, y + 4, W - MR, 0.3);
  y -= 10;
  page.drawText("Zahlungsaufforderung – Letzte Mahnung vor Einleitung rechtlicher Schritte", {
    x: ML, y, size: 10, font: arialBold, color: rgb(0.12, 0.12, 0.12)
  });
  y -= 6;
  hline(page, ML, y, W - MR, 0.3);
  y -= 16;

  // ── Body ─────────────────────────────────────────────────────────────────
  page.drawText("Sehr geehrter Herr Mustermann,", { x: ML, y, size: 9, font: arial });
  y -= 16;

  const intro = [
    "die Vodafone GmbH hat uns beauftragt, die nachstehende Forderung für Sie einzuziehen. Trotz zweimaliger",
    "schriftlicher Zahlungsaufforderung durch unsere Auftraggeberin (Mahnung vom 05.12.2025 und 09.01.2026)",
    "steht der unten aufgeführte Betrag noch aus.",
    "",
    "Wir fordern Sie hiermit letztmalig auf, den Gesamtbetrag von 239,05 € bis spätestens",
    "21. März 2026 auf das nachstehende Konto zu überweisen.",
    "",
    "Sofern Sie zwischenzeitlich die Zahlung veranlasst haben, bitten wir Sie, diese Mahnung als",
    "gegenstandslos zu betrachten.",
  ];

  intro.forEach((line) => {
    if (line === "") { y -= 6; return; }
    page.drawText(line, { x: ML, y, size: 8.5, font: arial, color: rgb(0.15, 0.15, 0.15) });
    y -= 12;
  });

  y -= 8;

  // ── Forderungsaufstellung table ──────────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 14, width: CW, height: 14, color: rgb(0.15, 0.15, 0.15) });
  page.drawText("Forderungsaufstellung", { x: ML + 5, y: y - 11, size: 8.5, font: arialBold, color: rgb(1, 1, 1) });
  page.drawText("Betrag", { x: W - MR - 55, y: y - 11, size: 8.5, font: arialBold, color: rgb(1, 1, 1) });

  const forderungRows = [
    { pos: "Hauptforderung (ausstehende Mobilfunkreihnungen 10/2025–11/2025)", betrag: "189,90 €", note: "Vertragskontonr. VOD-9841203-B, Vodafone GmbH" },
    { pos: "Verzugszinsen gem. § 288 Abs. 1 BGB (5 % p.a. über Basiszinssatz,\nab 01.12.2025 auf 189,90 €)", betrag: "9,15 €", note: "" },
    { pos: "Inkassogebühr gem. § 4 RDGEG (angemessene Vergütung für die\naußergerichtliche Rechtsverfolgung, RVG-Tabelle Nr. 2300)", betrag: "40,00 €", note: "" },
  ];

  ty = y - 14;
  forderungRows.forEach((row, i) => {
    const rowHeight = row.pos.includes("\n") ? 30 : 22;
    const bg = i % 2 === 0 ? rgb(0.97, 0.97, 0.97) : rgb(1, 1, 1);
    page.drawRectangle({ x: ML, y: ty - rowHeight, width: CW, height: rowHeight, color: bg, borderWidth: 0 });
    hline(page, ML, ty - rowHeight, W - MR, 0.3, rgb(0.80, 0.80, 0.80));

    const posLines = row.pos.split("\n");
    posLines.forEach((pl, pi) => {
      page.drawText(pl, { x: ML + 5, y: ty - 12 - pi * 11, size: 8, font: arial });
    });
    if (row.note) {
      page.drawText(row.note, { x: ML + 5, y: ty - 12 - posLines.length * 11, size: 7, font: arial, color: rgb(0.5, 0.5, 0.5) });
    }

    const bW = arialBold.widthOfTextAtSize(row.betrag, 8.5);
    page.drawText(row.betrag, { x: W - MR - 5 - bW, y: ty - 12, size: 8.5, font: arialBold });
    ty -= rowHeight;
  });

  // Total row
  hline(page, ML, ty, W - MR, 1, rgb(0.12, 0.12, 0.12));
  page.drawRectangle({ x: ML, y: ty - 22, width: CW, height: 22, color: rgb(0.12, 0.12, 0.12) });
  page.drawText("Gesamtbetrag (fällig bis 21.03.2026):", { x: ML + 5, y: ty - 15, size: 9, font: arialBold, color: rgb(1, 1, 1) });
  const totalW = arialBold.widthOfTextAtSize("239,05 €", 11);
  page.drawText("239,05 €", { x: W - MR - 5 - totalW, y: ty - 16, size: 11, font: arialBold, color: rgb(1, 0.85, 0.2) });
  ty -= 22;

  y = ty - 18;

  // ── Payment instructions ─────────────────────────────────────────────────
  page.drawText("Zahlungshinweis:", { x: ML, y, size: 8.5, font: arialBold });
  y -= 13;

  const payLines = [
    ["Empfänger:", "EOS Deutscher Inkasso-Dienst GmbH (für Vodafone GmbH)"],
    ["IBAN:", "DE89 2005 0550 1234 5678 90"],
    ["BIC:", "HASPDEHHXXX  (Hamburger Sparkasse)"],
    ["Verwendungszweck:", "EOS-2026-DE-3847192 / VOD-9841203-B / Mustermann"],
  ];
  payLines.forEach((row) => {
    page.drawText(row[0], { x: ML, y, size: 8, font: arialBold, color: rgb(0.35, 0.35, 0.35) });
    page.drawText(row[1], { x: ML + 110, y, size: 8, font: arial });
    y -= 12;
  });

  y -= 10;

  // ── Consequences ─────────────────────────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 36, width: CW, height: 36, color: rgb(0.99, 0.95, 0.93), borderColor: rgb(0.82, 0.12, 0.12), borderWidth: 0.8 });
  page.drawText("Sollte eine Zahlung bis zum 21.03.2026 nicht eingehen, werden wir ohne weitere Ankündigung", {
    x: ML + 8, y: y - 13, size: 7.5, font: arial, color: rgb(0.20, 0.20, 0.20)
  });
  page.drawText("ein gerichtliches Mahnverfahren (Mahnbescheid gemäß § 688 ZPO) einleiten. Die dadurch", {
    x: ML + 8, y: y - 24, size: 7.5, font: arial, color: rgb(0.20, 0.20, 0.20)
  });
  page.drawText("entstehenden Gerichtskosten und Rechtsanwaltsgebühren gehen zu Ihren Lasten.", {
    x: ML + 8, y: y - 35, size: 7.5, font: arial, color: rgb(0.20, 0.20, 0.20)
  });

  y -= 52;

  // ── Closing ──────────────────────────────────────────────────────────────
  page.drawText("Mit freundlichen Grüßen", { x: ML, y, size: 9, font: arial });
  y -= 26;
  page.drawText("EOS Deutscher Inkasso-Dienst GmbH", { x: ML, y, size: 9, font: arialBold });
  y -= 12;
  page.drawText("Abt. Forderungsmanagement", { x: ML, y, size: 8.5, font: arial, color: rgb(0.35, 0.35, 0.35) });

  // Signature lines
  hline(page, ML, y - 20, ML + 140, 0.5);
  hline(page, ML + 160, y - 20, ML + 300, 0.5);
  y -= 28;
  page.drawText("Sachbearbeiterin", { x: ML, y, size: 7.5, font: arial, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("Teamleitung", { x: ML + 160, y, size: 7.5, font: arial, color: rgb(0.5, 0.5, 0.5) });

  // ── Footer ───────────────────────────────────────────────────────────────
  hline(page, 0, 45, W, 0.5, rgb(0.82, 0.12, 0.12));
  const footerText = "EOS Deutscher Inkasso-Dienst GmbH · Steindamm 71 · 20099 Hamburg · Amtsgericht Hamburg HRB 69723 · Geschäftsführer: Marwin Ramcke · Registriert gem. § 10 RDG";
  page.drawText(footerText, { x: ML, y: 32, size: 6, font: arial, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("Registrierungsnummer im Rechtsdienstleistungsregister: 2010-MH-10-18-DE-01234 · www.rechtsdienstleistungsregister.de", {
    x: ML, y: 22, size: 6, font: arial, color: rgb(0.5, 0.5, 0.5)
  });

  return pdfDoc.save();
}

// ── Vollstreckungsbescheid ─────────────────────────────────────────────────────

async function generateVollstreckungsbescheid() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const arialBytes = fs.readFileSync(ARIAL_PATH);
  const arialBoldBytes = fs.readFileSync(ARIAL_BOLD_PATH);
  const arial = await pdfDoc.embedFont(arialBytes, { subset: true });
  const arialBold = await pdfDoc.embedFont(arialBoldBytes, { subset: true });

  const page = pdfDoc.addPage([595.28, 841.89]);
  const W = 595.28;
  const H = 841.89;
  const ML = 65;
  const MR = 65;
  const CW = W - ML - MR;

  // Header band — darker/more urgent red-tinted tone
  page.drawRectangle({ x: 0, y: H - 110, width: W, height: 110, color: rgb(0.93, 0.91, 0.91) });

  // Court seal
  page.drawCircle({ x: ML + 22, y: H - 55, size: 22, color: rgb(0.22, 0.35, 0.60) });
  page.drawCircle({ x: ML + 22, y: H - 55, size: 18, borderColor: rgb(1, 1, 1), borderWidth: 1.5, color: rgb(0.22, 0.35, 0.60) });
  page.drawText("AG", { x: ML + 15, y: H - 59, size: 10, font: arialBold, color: rgb(1, 1, 1) });

  page.drawText("Amtsgericht Wedding", { x: ML + 52, y: H - 42, size: 14, font: arialBold, color: rgb(0.10, 0.18, 0.40) });
  page.drawText("Gerichtliches Mahnverfahren", { x: ML + 52, y: H - 57, size: 9, font: arial, color: rgb(0.30, 0.30, 0.30) });
  page.drawText("Brunnenstr. 28 · 13355 Berlin · Tel. 030 9014-0", { x: ML + 52, y: H - 70, size: 7.5, font: arial, color: rgb(0.45, 0.45, 0.45) });

  const titleText = "VOLLSTRECKUNGSBESCHEID";
  const titleW = arialBold.widthOfTextAtSize(titleText, 20);
  page.drawText(titleText, { x: (W - titleW) / 2, y: H - 47, size: 20, font: arialBold, color: rgb(0.55, 0.08, 0.08) });
  page.drawText("gemäß § 699 ZPO", { x: (W - arialBold.widthOfTextAtSize("gemäß § 699 ZPO", 9)) / 2, y: H - 61, size: 9, font: arial, color: rgb(0.45, 0.25, 0.25) });

  hline(page, 0, H - 110, W, 1.5, rgb(0.55, 0.08, 0.08));

  let y = H - 130;

  // Aktenzeichen / dates
  box(page, ML, y - 28, 200, 34);
  page.drawText("Aktenzeichen:", { x: ML + 5, y: y - 12, size: 7, font: arial, color: rgb(0.35, 0.35, 0.35) });
  page.drawText("26 MH 1847/26", { x: ML + 5, y: y - 24, size: 11, font: arialBold });

  box(page, ML + 210, y - 28, 255, 34);
  page.drawText("Ausgefertigt am:", { x: ML + 215, y: y - 12, size: 7.5, font: arial });
  page.drawText("28.03.2026", { x: ML + 310, y: y - 12, size: 7.5, font: arialBold });
  page.drawText("Zugestellt am:", { x: ML + 215, y: y - 24, size: 7.5, font: arial });
  page.drawText("01.04.2026", { x: ML + 310, y: y - 24, size: 7.5, font: arialBold });

  y -= 50;

  // Reference to original Mahnbescheid
  page.drawRectangle({ x: ML, y: y - 26, width: CW, height: 26, color: rgb(0.99, 0.95, 0.93), borderColor: rgb(0.55, 0.08, 0.08), borderWidth: 0.8 });
  page.drawText("Da gegen den Mahnbescheid vom 04.03.2026 (Az. 26 MH 1847/26) innerhalb der gesetzlichen", {
    x: ML + 8, y: y - 11, size: 7.5, font: arial
  });
  page.drawText("Frist kein Widerspruch eingelegt wurde, wird auf Antrag des Antragstellers erlassen:", {
    x: ML + 8, y: y - 22, size: 7.5, font: arial
  });

  y -= 44;

  // Parties
  const colMid = ML + CW / 2 + 5;
  page.drawRectangle({ x: ML, y: y - 14, width: (CW / 2) - 5, height: 14, color: rgb(0.85, 0.88, 0.94) });
  page.drawText("Antragsteller (Gläubiger):", { x: ML + 5, y: y - 11, size: 7.5, font: arialBold });
  page.drawRectangle({ x: colMid, y: y - 14, width: (CW / 2) - 5, height: 14, color: rgb(0.85, 0.88, 0.94) });
  page.drawText("Antragsgegner (Schuldner):", { x: colMid + 5, y: y - 11, size: 7.5, font: arialBold });

  const partyBoxH = 72;
  box(page, ML, y - 14 - partyBoxH, (CW / 2) - 5, partyBoxH);
  box(page, colMid, y - 14 - partyBoxH, (CW / 2) - 5, partyBoxH);

  ["Klarna Bank AB", "(Zweigniederlassung Deutschland)", "Theresienhöhe 12", "80339 München", "", "vertreten durch: Klarna GmbH"].forEach((line, i) => {
    page.drawText(line, { x: ML + 6, y: y - 24 - i * 10, size: 8, font: i === 0 ? arialBold : arial });
  });
  ["Max Mustermann", "Musterstraße 12", "10117 Berlin"].forEach((line, i) => {
    page.drawText(line, { x: colMid + 6, y: y - 24 - i * 10, size: 8, font: i === 0 ? arialBold : arial });
  });

  y -= 14 + partyBoxH + 18;

  // Forderung table
  page.drawRectangle({ x: ML, y: y - 14, width: CW, height: 14, color: rgb(0.85, 0.88, 0.94) });
  page.drawText("Forderungsaufstellung", { x: ML + 5, y: y - 11, size: 8, font: arialBold });

  const tableRows = [
    { label: "1. Hauptforderung (Kaufvertrag vom 14.11.2025, Bestellnr. KL-2025-789034)", amount: "312,47 €" },
    { label: "2. Verzugszinsen: 5 Prozentpunkte über dem Basiszinssatz gem. § 288 Abs. 1 BGB seit 15.01.2026", amount: "(lfd.)" },
    { label: "3. Auslagenpauschale gemäß § 288 Abs. 5 BGB", amount: "40,00 €" },
    { label: "4. Gerichtsgebühren Mahnverfahren (0,5-fache Gebühr, Nr. 1100 KV-GKG)", amount: "36,00 €" },
    { label: "5. Gerichtsgebühren Vollstreckungsbescheid (0,5-fache Gebühr, Nr. 1101 KV-GKG)", amount: "36,00 €" },
    { label: "Gesamtbetrag:", amount: "424,47 €", bold: true },
  ];

  let ty = y - 14;
  const rowH = 16;
  tableRows.forEach((row, i) => {
    const bg = i % 2 === 0 ? rgb(0.98, 0.98, 0.98) : rgb(1, 1, 1);
    const font = row.bold ? arialBold : arial;
    page.drawRectangle({ x: ML, y: ty - rowH, width: CW, height: rowH, color: bg, borderWidth: 0 });
    hline(page, ML, ty - rowH, W - MR, 0.3, rgb(0.8, 0.8, 0.8));
    const words = row.label.split(" ");
    let line = ""; let lineCount = 0;
    words.forEach((word) => {
      const test = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(test, 7.5) > CW - 65) {
        page.drawText(line, { x: ML + 5, y: ty - 11 - lineCount * 9, size: 7.5, font });
        line = word; lineCount++;
      } else { line = test; }
    });
    if (line) page.drawText(line, { x: ML + 5, y: ty - 11 - lineCount * 9, size: 7.5, font });
    const bW = font.widthOfTextAtSize(row.amount, 8);
    page.drawText(row.amount, { x: W - MR - 5 - bW, y: ty - 11, size: 8, font });
    if (i === tableRows.length - 2) hline(page, ML, ty - rowH, W - MR, 1, rgb(0.55, 0.08, 0.08));
    ty -= rowH;
  });
  hline(page, ML, ty, W - MR, 1, rgb(0.55, 0.08, 0.08));

  y = ty - 22;

  // Einspruch deadline box
  page.drawRectangle({ x: ML, y: y - 30, width: CW, height: 30, color: rgb(0.99, 0.93, 0.93), borderColor: rgb(0.75, 0.12, 0.12), borderWidth: 1 });
  page.drawText("Einspruchsfrist (§ 700 ZPO):", { x: ML + 8, y: y - 13, size: 8.5, font: arialBold, color: rgb(0.55, 0.08, 0.08) });
  page.drawText("Die Frist zur Einlegung des Einspruchs beträgt zwei Wochen ab Zustellung.", { x: ML + 8, y: y - 24, size: 8, font: arial });
  const dlLabel = "Fristende: 15.04.2026";
  const dlW = arialBold.widthOfTextAtSize(dlLabel, 11);
  page.drawText(dlLabel, { x: W - MR - dlW - 8, y: y - 19, size: 11, font: arialBold, color: rgb(0.55, 0.08, 0.08) });

  y -= 48;

  // Belehrung
  page.drawText("Rechtsmittelbelehrung / Einspruch:", { x: ML, y, size: 8.5, font: arialBold });
  y -= 13;
  [
    "Gegen diesen Vollstreckungsbescheid kann der Antragsgegner binnen einer Frist von zwei Wochen ab",
    "Zustellung Einspruch einlegen. Der Einspruch bedarf keiner Begründung. Er ist schriftlich oder zu",
    "Protokoll der Geschäftsstelle beim oben genannten Gericht einzulegen.",
    "",
    "Wird kein Einspruch eingelegt, ist dieser Bescheid vollstreckbar. Der Gläubiger kann dann",
    "Zwangsvollstreckungsmaßnahmen einleiten (z.B. Kontopfändung, Lohnpfändung).",
    "",
    "Dieser Bescheid steht einem rechtskräftigen Versäumnisurteil gleich (§700 Abs. 1 ZPO).",
  ].forEach((line) => {
    if (line === "") { y -= 5; return; }
    page.drawText(line, { x: ML, y, size: 7.5, font: arial, color: rgb(0.20, 0.20, 0.20) });
    y -= 11;
  });

  y -= 15;

  // Einspruchsformular
  for (let x = ML; x < W - MR; x += 8) {
    page.drawLine({ start: { x, y }, end: { x: x + 4, y }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });
  }
  page.drawText("✂  Einspruchsformular (bitte hier abtrennen und einsenden)", {
    x: ML + 10, y: y - 11, size: 7.5, font: arial, color: rgb(0.35, 0.35, 0.35)
  });
  y -= 24;

  box(page, ML, y - 72, CW, 72);
  page.drawText("Einspruch gegen Vollstreckungsbescheid", { x: ML + 8, y: y - 14, size: 10, font: arialBold });
  page.drawText("Aktenzeichen: 26 MH 1847/26  |  Antragsteller: Klarna Bank AB  |  Antragsgegner: Max Mustermann", {
    x: ML + 8, y: y - 27, size: 7.5, font: arial
  });
  page.drawText("Ich/Wir legen hiermit Einspruch gegen den Vollstreckungsbescheid vom 28.03.2026 ein.", {
    x: ML + 8, y: y - 42, size: 8, font: arial
  });
  page.drawText("Ort, Datum: ___________________________", { x: ML + 8, y: y - 60, size: 8, font: arial });
  page.drawText("Unterschrift: ___________________________", { x: ML + 240, y: y - 60, size: 8, font: arial });

  y -= 90;

  page.drawText("Amtsgericht Wedding · Gerichtliches Mahnverfahren", { x: ML, y, size: 7, font: arial, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("Dieses Dokument wurde maschinell erstellt und ist ohne Unterschrift gültig (§ 703c Abs. 2 ZPO).", {
    x: ML, y: y - 11, size: 6.5, font: arial, color: rgb(0.5, 0.5, 0.5)
  });

  page.drawCircle({ x: W - MR - 30, y: y - 10, size: 28, borderColor: rgb(0.22, 0.35, 0.60), borderWidth: 1 });
  page.drawText("AMTS-", { x: W - MR - 49, y: y - 4, size: 6, font: arialBold, color: rgb(0.22, 0.35, 0.60) });
  page.drawText("GERICHT", { x: W - MR - 51, y: y - 13, size: 6, font: arialBold, color: rgb(0.22, 0.35, 0.60) });
  page.drawText("WEDDING", { x: W - MR - 51, y: y - 22, size: 5.5, font: arialBold, color: rgb(0.22, 0.35, 0.60) });

  return pdfDoc.save();
}

// ── Inkasso ohne Frist ────────────────────────────────────────────────────────

async function generateInkassoOhneFrist() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const arialBytes = fs.readFileSync(ARIAL_PATH);
  const arialBoldBytes = fs.readFileSync(ARIAL_BOLD_PATH);
  const arial = await pdfDoc.embedFont(arialBytes, { subset: true });
  const arialBold = await pdfDoc.embedFont(arialBoldBytes, { subset: true });

  const page = pdfDoc.addPage([595.28, 841.89]);
  const W = 595.28;
  const H = 841.89;
  const ML = 65;
  const MR = 65;
  const CW = W - ML - MR;

  // Letterhead — PAIR Finance (teal accent)
  page.drawRectangle({ x: 0, y: H - 85, width: 8, height: 85, color: rgb(0.05, 0.55, 0.55) });

  page.drawText("PAIR Finance GmbH", { x: ML, y: H - 32, size: 16, font: arialBold, color: rgb(0.05, 0.05, 0.05) });
  page.drawText("Inkasso- und Forderungsmanagement", { x: ML, y: H - 46, size: 8.5, font: arial, color: rgb(0.45, 0.45, 0.45) });

  const contactLines = [
    "Stralauer Allee 6 · 10245 Berlin",
    "Tel. 030 6098-5200",
    "info@pairfinance.com",
    "www.pairfinance.com",
    "Reg.-Nr. 2018-MH-11-19-DE-05532",
  ];
  contactLines.forEach((line, i) => {
    const w = arial.widthOfTextAtSize(line, 7.5);
    page.drawText(line, { x: W - MR - w, y: H - 22 - i * 10, size: 7.5, font: arial, color: rgb(0.35, 0.35, 0.35) });
  });

  hline(page, ML, H - 88, W - MR, 0.8, rgb(0.05, 0.55, 0.55));

  let y = H - 110;

  page.drawText("PAIR Finance GmbH · Stralauer Allee 6 · 10245 Berlin", {
    x: ML, y, size: 6.5, font: arial, color: rgb(0.5, 0.5, 0.5)
  });
  y -= 14;

  ["Max Mustermann", "Musterstraße 12", "10117 Berlin"].forEach((line, i) => {
    page.drawText(line, { x: ML, y: y - i * 13, size: 10, font: i === 0 ? arialBold : arial });
  });

  page.drawText("Berlin, den 28. Februar 2026", { x: W - MR - arial.widthOfTextAtSize("Berlin, den 28. Februar 2026", 9), y, size: 9, font: arial });

  const refLines = [
    { label: "Unser Aktenzeichen:", value: "PF-2026-TK-2194837" },
    { label: "Ihr Zeichen:", value: "TK-2025-DE-447812" },
    { label: "Auftraggeber:", value: "Telekom Deutschland GmbH" },
    { label: "Forderungsnr.:", value: "TDG-5523901-M" },
  ];
  refLines.forEach((r, i) => {
    const ry = y - 13 - i * 11;
    page.drawText(r.label, { x: W - MR - 180, y: ry, size: 8, font: arial, color: rgb(0.45, 0.45, 0.45) });
    page.drawText(r.value, { x: W - MR - 90, y: ry, size: 8, font: arialBold });
  });

  y -= 58;

  hline(page, ML, y + 4, W - MR, 0.3);
  y -= 10;
  page.drawText("Zahlungsaufforderung – Letzte Mahnung vor gerichtlichen Schritten", {
    x: ML, y, size: 10, font: arialBold
  });
  y -= 6;
  hline(page, ML, y, W - MR, 0.3);
  y -= 16;

  page.drawText("Sehr geehrter Herr Mustermann,", { x: ML, y, size: 9, font: arial });
  y -= 16;

  [
    "die Telekom Deutschland GmbH hat uns beauftragt, die nachstehende offene Forderung",
    "einzuziehen. Trotz dreimaliger Zahlungserinnerung durch unsere Auftraggeberin (zuletzt",
    "am 08.01.2026) ist der unten genannte Betrag weiterhin offen.",
    "",
    "Wir fordern Sie hiermit auf, den Gesamtbetrag von 167,35 € unverzüglich auf das",
    "nachstehende Konto zu überweisen.",
    "",
    "Sofern Sie die Zahlung bereits veranlasst haben, bitten wir Sie, dieses Schreiben",
    "als gegenstandslos zu betrachten.",
  ].forEach((line) => {
    if (line === "") { y -= 6; return; }
    page.drawText(line, { x: ML, y, size: 8.5, font: arial, color: rgb(0.15, 0.15, 0.15) });
    y -= 12;
  });

  y -= 8;

  // Table
  page.drawRectangle({ x: ML, y: y - 14, width: CW, height: 14, color: rgb(0.05, 0.55, 0.55) });
  page.drawText("Forderungsaufstellung", { x: ML + 5, y: y - 11, size: 8.5, font: arialBold, color: rgb(1, 1, 1) });
  page.drawText("Betrag", { x: W - MR - 55, y: y - 11, size: 8.5, font: arialBold, color: rgb(1, 1, 1) });

  const rows = [
    { pos: "Hauptforderung (Telefonrechnung 11/2025, Vertragskonto TDG-5523901-M)", betrag: "118,20 €" },
    { pos: "Verzugszinsen gem. § 288 Abs. 1 BGB (5 % p.a. über Basiszinssatz, ab 01.12.2025)", betrag: "9,15 €" },
    { pos: "Inkassogebühr gem. § 4 RDGEG", betrag: "40,00 €" },
  ];

  let ty = y - 14;
  rows.forEach((row, i) => {
    const rowH = 22;
    const bg = i % 2 === 0 ? rgb(0.97, 0.97, 0.97) : rgb(1, 1, 1);
    page.drawRectangle({ x: ML, y: ty - rowH, width: CW, height: rowH, color: bg, borderWidth: 0 });
    hline(page, ML, ty - rowH, W - MR, 0.3, rgb(0.80, 0.80, 0.80));
    page.drawText(row.pos, { x: ML + 5, y: ty - 14, size: 8, font: arial });
    const bW = arialBold.widthOfTextAtSize(row.betrag, 8.5);
    page.drawText(row.betrag, { x: W - MR - 5 - bW, y: ty - 14, size: 8.5, font: arialBold });
    ty -= rowH;
  });

  hline(page, ML, ty, W - MR, 1, rgb(0.05, 0.05, 0.05));
  page.drawRectangle({ x: ML, y: ty - 22, width: CW, height: 22, color: rgb(0.05, 0.55, 0.55) });
  page.drawText("Gesamtbetrag:", { x: ML + 5, y: ty - 15, size: 9, font: arialBold, color: rgb(1, 1, 1) });
  const totalW = arialBold.widthOfTextAtSize("167,35 €", 11);
  page.drawText("167,35 €", { x: W - MR - 5 - totalW, y: ty - 16, size: 11, font: arialBold, color: rgb(1, 1, 1) });
  ty -= 22;

  y = ty - 18;

  // Payment instructions
  page.drawText("Zahlungshinweis:", { x: ML, y, size: 8.5, font: arialBold });
  y -= 13;
  [
    ["Empfänger:", "PAIR Finance GmbH (für Telekom Deutschland GmbH)"],
    ["IBAN:", "DE12 1002 0890 0012 3456 78"],
    ["BIC:", "BHFBDEFF  (Bankhaus Lampe KG)"],
    ["Verwendungszweck:", "PF-2026-TK-2194837 / TDG-5523901-M / Mustermann"],
  ].forEach((row) => {
    page.drawText(row[0], { x: ML, y, size: 8, font: arialBold, color: rgb(0.35, 0.35, 0.35) });
    page.drawText(row[1], { x: ML + 110, y, size: 8, font: arial });
    y -= 12;
  });

  y -= 10;

  // No specific deadline — just "unverzüglich" notice
  page.drawRectangle({ x: ML, y: y - 30, width: CW, height: 30, color: rgb(0.93, 0.98, 0.98), borderColor: rgb(0.05, 0.55, 0.55), borderWidth: 0.8 });
  page.drawText("Bitte überweisen Sie den Betrag unverzüglich. Sollte die Zahlung weiterhin ausbleiben,", {
    x: ML + 8, y: y - 11, size: 7.5, font: arial
  });
  page.drawText("behalten wir uns vor, ohne weitere Ankündigung ein gerichtliches Mahnverfahren", {
    x: ML + 8, y: y - 22, size: 7.5, font: arial
  });

  y -= 48;

  page.drawText("Mit freundlichen Grüßen", { x: ML, y, size: 9, font: arial });
  y -= 26;
  page.drawText("PAIR Finance GmbH", { x: ML, y, size: 9, font: arialBold });
  y -= 12;
  page.drawText("Forderungsmanagement", { x: ML, y, size: 8.5, font: arial, color: rgb(0.35, 0.35, 0.35) });

  hline(page, ML, y - 20, ML + 140, 0.5);
  hline(page, ML + 160, y - 20, ML + 300, 0.5);
  y -= 28;
  page.drawText("Sachbearbeiter", { x: ML, y, size: 7.5, font: arial, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("Teamleitung", { x: ML + 160, y, size: 7.5, font: arial, color: rgb(0.5, 0.5, 0.5) });

  hline(page, 0, 45, W, 0.5, rgb(0.05, 0.55, 0.55));
  page.drawText("PAIR Finance GmbH · Stralauer Allee 6 · 10245 Berlin · Amtsgericht Charlottenburg HRB 188124 · Geschäftsführer: Julius Köhler", {
    x: ML, y: 32, size: 6, font: arial, color: rgb(0.5, 0.5, 0.5)
  });
  page.drawText("Registrierungsnummer im Rechtsdienstleistungsregister: 2018-MH-11-19-DE-05532 · www.rechtsdienstleistungsregister.de", {
    x: ML, y: 22, size: 6, font: arial, color: rgb(0.5, 0.5, 0.5)
  });

  return pdfDoc.save();
}

// ── main ──────────────────────────────────────────────────────────────────────

(async () => {
  const outputs = [
    { name: "demo-mahnbescheid-klarna.pdf", fn: generateMahnbescheid },
    { name: "demo-inkasso-mit-frist-eos-vodafone.pdf", fn: generateInkassoschreiben },
    { name: "demo-vollstreckungsbescheid-klarna.pdf", fn: generateVollstreckungsbescheid },
    { name: "demo-inkasso-ohne-frist-pair-telekom.pdf", fn: generateInkassoOhneFrist },
  ];

  for (const { name, fn } of outputs) {
    console.log(`Generating ${name}...`);
    const bytes = await fn();
    fs.writeFileSync(path.join(OUT_DIR, name), bytes);
    console.log(`  → public/${name} written (${bytes.length} bytes)`);
  }

  // Remove old filenames if present
  for (const old of ["demo-mahnbescheid.pdf", "demo-inkassoschreiben.pdf"]) {
    const p = path.join(OUT_DIR, old);
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`  → removed old ${old}`); }
  }
})();
