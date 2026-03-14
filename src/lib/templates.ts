import { TriageResult } from "@/types";

export interface CaseTemplate {
  whatIsThis: string;
  consequence: string;
  optionALabel: string;
  optionAExplanation: string;
  optionBLabel: string;
  optionBExplanation: string;
  ourOffer: string;
  documentLabel: string;
  blurredBody: string; // placeholder body text shown blurred in the document preview
}

export function getCaseTemplate(triage: TriageResult): CaseTemplate {
  const creditor = triage.creditorName ?? "der Gläubiger";
  const amount = triage.claimedAmount ? ` ${triage.claimedAmount}` : "";
  const court = triage.courtName ?? "das zuständige Gericht";

  switch (triage.caseType) {
    case "mahnbescheid":
      return {
        whatIsThis:
          `Ein Mahnbescheid wird automatisch vom Gericht ausgestellt, wenn ein Gläubiger ihn beantragt — ` +
          `ohne Prüfung, ob die Forderung berechtigt ist. Das ist kein Urteil. ` +
          `${triage.creditorName ?? "Der Gläubiger"} behauptet, Sie schulden${amount}.`,

        consequence:
          `Wenn Sie innerhalb der Frist weder zahlen noch widersprechen, wird der Mahnbescheid rechtskräftig. ` +
          `${triage.creditorName ?? "Der Gläubiger"} kann dann einen Vollstreckungsbescheid beantragen.`,

        optionALabel: "Zahlen",
        optionAExplanation:
          `Wenn Sie die Forderung anerkennen, zahlen Sie direkt an ${creditor}. ` +
          `Das Verfahren wird damit beendet.`,

        optionBLabel: "Widerspruch einlegen",
        optionBExplanation:
          `Ein Widerspruch stoppt das Verfahren sofort (§694 ZPO) — ohne Begründung. ` +
          `${triage.creditorName ?? "Der Gläubiger"} müsste dann Klage erheben, ` +
          `um die Forderung weiterzuverfolgen.`,

        ourOffer:
          `Wenn Sie Widerspruch einlegen möchten, bereiten wir das Dokument für Sie vor — ` +
          `adressiert an ${court}, mit Ihrem Aktenzeichen, druckfertig.`,

        documentLabel: "Widerspruch gegen Mahnbescheid",

        blurredBody:
          `hiermit lege ich fristgerecht Widerspruch gegen den oben genannten Mahnbescheid ein. ` +
          `Der geltend gemachte Anspruch wird dem Grunde und der Höhe nach vollumfänglich bestritten.\n\n` +
          `Ich behalte mir vor, die Einwendungen gegen die Forderung im weiteren Verfahren darzulegen. ` +
          `Eine Zahlung werde ich nicht leisten.\n\n` +
          `Bitte bestätigen Sie den Eingang dieses Widerspruchs schriftlich.`,
      };

    case "consumer_debt":
      return {
        whatIsThis:
          `Das ist ein Schreiben eines privaten Inkassobüros — kein Gerichtsdokument. ` +
          `${triage.creditorName ?? "Das Inkassobüro"} behauptet, Sie schulden${amount}. ` +
          `Ein Inkassobüro hat keine behördliche Befugnis und kann keine rechtlichen Konsequenzen direkt einleiten.`,

        consequence:
          `Wenn Sie nicht reagieren, könnte ${creditor} einen gerichtlichen Mahnbescheid beantragen. ` +
          `Weitere Mahngebühren könnten hinzukommen.`,

        optionALabel: "Zahlen",
        optionAExplanation:
          `Wenn Sie die Forderung anerkennen, zahlen Sie direkt an ${creditor}. ` +
          `Das Verfahren wird damit beendet.`,

        optionBLabel: "Forderung bestreiten",
        optionBExplanation:
          `Sie bestreiten die Forderung schriftlich. ${triage.creditorName ?? "Das Inkassobüro"} ` +
          `muss die Forderung dann belegen. Weitere Inkassoschreiben sind bis dahin unzulässig.`,

        ourOffer:
          `Wenn Sie die Forderung bestreiten möchten, bereiten wir ein Bestreitungsschreiben ` +
          `für Sie vor — adressiert an ${creditor}, druckfertig.`,

        documentLabel: "Bestreitungsschreiben",

        blurredBody:
          `hiermit bestreite ich die von Ihnen geltend gemachte Forderung ausdrücklich und vollumfänglich.\n\n` +
          `Ich fordere Sie auf, die Forderung durch Vorlage geeigneter Nachweise zu belegen. ` +
          `Bis zum Nachweis der Forderung werde ich keine Zahlung leisten.\n\n` +
          `Von weiteren Inkassomaßnahmen bitte ich abzusehen.`,
      };

    default:
      return {
        whatIsThis: "",
        consequence: "",
        optionALabel: "Zahlen",
        optionAExplanation: "",
        optionBLabel: "Bestreiten",
        optionBExplanation: "",
        ourOffer: "",
        documentLabel: "Rechtsdokument",
        blurredBody: "",
      };
  }
}