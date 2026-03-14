import { TriageResult } from "@/types";

export interface CaseTemplate {
  whatIsThis: string;
  consequence: string;
  optionALabel: string;
  optionAExplanation: string;
  optionBLabel: string;
  optionBExplanation: string;
  optionBStat: string; // factual outcome context shown below option B — Rechtsinformation only
  ourOffer: string;
  documentLabel: string;
  blurredBody: string; // placeholder body text shown blurred in the document preview
  whatHappensNext: string; // shown on the case dashboard after payment — what to expect
  sendingRecipient: string; // "das Gericht" or "das Inkassobüro" — used in sending instructions
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
        optionBStat:
          `Viele Gläubiger erheben nach einem Widerspruch keine Klage — besonders ` +
          `bei kleinen Beträgen oder wenn die Forderung schwer zu belegen ist.`,

        ourOffer:
          `Wenn Sie Widerspruch einlegen möchten, bereiten wir das Dokument für Sie vor — ` +
          `adressiert an ${court}, mit Ihrem Aktenzeichen, druckfertig.`,

        documentLabel: "Widerspruch gegen Mahnbescheid",

        whatHappensNext:
          `Nach Eingang Ihres Widerspruchs muss ${triage.creditorName ?? "der Gläubiger"} aktiv Klage erheben, ` +
          `um die Forderung weiterzuverfolgen. Viele Gläubiger sehen davon ab — besonders bei kleineren Beträgen ` +
          `oder wenn die Forderung schwer zu belegen ist.\n\n` +
          `Sie werden wahrscheinlich wochenlang nichts hören. Das ist normal und kein schlechtes Zeichen. ` +
          `Die Beweislast liegt nun beim Gläubiger.`,

        sendingRecipient: "das Gericht",

        blurredBody:
          `hiermit lege ich fristgerecht Widerspruch gegen den oben genannten Mahnbescheid ein. ` +
          `Der geltend gemachte Anspruch wird dem Grunde und der Höhe nach vollumfänglich bestritten.\n\n` +
          `Ich behalte mir vor, die Einwendungen gegen die Forderung im weiteren Verfahren darzulegen. ` +
          `Eine Zahlung werde ich nicht leisten.\n\n` +
          `Bitte bestätigen Sie den Eingang dieses Widerspruchs schriftlich.`,
      };

    case "vollstreckungsbescheid": {
      const creditorVB = triage.creditorName ?? "der Gläubiger";
      const courtVB = triage.courtName ?? "das zuständige Gericht";
      return {
        whatIsThis:
          `Ein Vollstreckungsbescheid wird vom Gericht erlassen, wenn auf einen Mahnbescheid kein Widerspruch eingelegt wurde (§699 ZPO). ` +
          `Das Gericht hat die Forderung nicht geprüft — ${triage.creditorName ?? "der Gläubiger"} behauptet, Sie schulden${amount}. ` +
          `Dieser Bescheid steht einem Versäumnisurteil gleich und ist vorläufig vollstreckbar.`,

        consequence:
          `Wenn Sie keinen Einspruch einlegen, kann ${creditorVB} sofort Zwangsvollstreckungsmaßnahmen einleiten — ` +
          `etwa Kontopfändung oder Lohnpfändung.`,

        optionALabel: "Zahlen",
        optionAExplanation:
          `Wenn Sie die Forderung anerkennen, zahlen Sie direkt an ${creditorVB}. ` +
          `Das Verfahren wird damit beendet.`,

        optionBLabel: "Einspruch einlegen",
        optionBExplanation:
          `Ein Einspruch (§700 ZPO) stoppt die Vollstreckung sofort. ` +
          `Das Gericht leitet dann das streitige Verfahren ein — ${triage.creditorName ?? "der Gläubiger"} muss die Forderung dann vor Gericht belegen.`,
        optionBStat:
          `Die Beweispflicht liegt beim Gläubiger. Nach einem Einspruch müssen Forderungen vollständig belegt werden.`,

        ourOffer:
          `Wenn Sie Einspruch einlegen möchten, bereiten wir das Dokument für Sie vor — ` +
          `adressiert an ${courtVB}, mit Ihrem Aktenzeichen, druckfertig.`,

        documentLabel: "Einspruch gegen Vollstreckungsbescheid",

        whatHappensNext:
          `Nach Ihrem Einspruch muss ${triage.creditorName ?? "der Gläubiger"} aktiv Klage erheben, um die Forderung weiterzuverfolgen. ` +
          `Ohne Klage verliert der Vollstreckungsbescheid seine Wirkung.\n\n` +
          `Die Beweislast liegt nun vollständig beim Gläubiger.`,

        sendingRecipient: "das Gericht",

        blurredBody:
          `hiermit lege ich fristgerecht Einspruch gegen den oben genannten Vollstreckungsbescheid ein. ` +
          `Der geltend gemachte Anspruch wird dem Grunde und der Höhe nach vollumfänglich bestritten.\n\n` +
          `Ich behalte mir vor, die Einwendungen gegen die Forderung im weiteren Verfahren darzulegen. ` +
          `Eine Zahlung werde ich nicht leisten.\n\n` +
          `Bitte bestätigen Sie den Eingang dieses Einspruchs schriftlich.`,
      };
    }

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
        optionBStat:
          `Inkassobüros haben keine behördliche Befugnis. Viele Forderungen sind verjährt ` +
          `oder unzureichend belegt — ein Widerspruch beendet den Kontakt häufig.`,

        ourOffer:
          `Wenn Sie die Forderung bestreiten möchten, bereiten wir ein Bestreitungsschreiben ` +
          `für Sie vor — adressiert an ${creditor}, druckfertig.`,

        documentLabel: "Bestreitungsschreiben",

        whatHappensNext:
          `Ein Inkassobüro hat keine behördliche Befugnis und kann keine rechtlichen Maßnahmen direkt einleiten. ` +
          `Nach Ihrem Widerspruch sind weitere Inkassoschreiben ohne Nachweis der Forderung unzulässig.\n\n` +
          `Viele Forderungen — besonders ältere oder schlecht belegte — werden nach einem Widerspruch nicht weiter ` +
          `verfolgt. Sollten Sie dennoch weitere Post erhalten, laden Sie diese unten hoch.`,

        sendingRecipient: "das Inkassobüro",

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
        optionBStat: "",
        ourOffer: "",
        documentLabel: "Rechtsdokument",
        blurredBody: "",
        whatHappensNext: "",
        sendingRecipient: "die Gegenseite",
      };
  }
}