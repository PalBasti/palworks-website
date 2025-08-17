// lib/pdf/untermietvertragGenerator.js - Aktualisiert für neue PDFLayoutManager-Features

import jsPDF from 'jspdf';
import { PDFLayoutManager } from './helpers/PDFLayoutManager.js';

export function generateUntermietvertragPDF(formData, selectedAddons = []) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Layout Manager mit Konfiguration initialisieren
  const layout = new PDFLayoutManager(pdf, {
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    lineHeight: 6,
    sectionSpacing: 8,
    checkboxSize: 3
  });

  // Helper-Funktionen - harmonisiert mit Garagenvertrag
  const displayValue = (value, placeholder = '') => {
    if (!value || value.toString().trim() === '') {
      return `_${'_'.repeat(Math.max(15, placeholder.length || 15))}`;
    }
    return value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return `_${'_'.repeat(12)}`;
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch {
      return `_${'_'.repeat(12)}`;
    }
  };

  try {
    // Header
    layout.addText('UNTERMIETVERTRAG', { fontSize: 16, style: 'bold' });
    layout.addText('für Wohnraum', { fontSize: 11, style: 'italic' });
    layout.addSpacing(10);

    // Vertragsparteien
    layout.addSection('ZWISCHEN');
    
    // Untervermieter
    layout.addText('Untervermieter:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    layout.addText(`Name: ${displayValue(formData.sublessor_name)}`);
    layout.addText(`Anschrift: ${displayValue(formData.sublessor_address)}`);
    if (formData.sublessor_phone) {
      layout.addText(`Telefon: ${formData.sublessor_phone}`);
    }
    layout.addSpacing(4);

    layout.addText('UND', { fontSize: 11, style: 'bold' });
    layout.addSpacing(4);

    // Untermieter
    layout.addText('Untermieter:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    layout.addText(`Name: ${displayValue(formData.sublessee_name)}`);
    layout.addText(`Anschrift: ${displayValue(formData.sublessee_address)}`);
    if (formData.sublessee_phone) {
      layout.addText(`Telefon: ${formData.sublessee_phone}`);
    }
    layout.addSpacing(4);

    layout.addText('wird folgender Untermietvertrag geschlossen:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(8);

    // § 1 Mietobjekt
    layout.addSection('§ 1 Mietobjekt');
    
    layout.addText('Untervermietet wird:');
    layout.addSpacing(2);
    layout.addText(`Adresse: ${displayValue(formData.property_address)}`);
    
    if (formData.property_type) {
      layout.addText(`Art der Wohnung: ${formData.property_type}`);
    }
    
    if (formData.room_count) {
      layout.addText(`Anzahl Zimmer: ${formData.room_count}`);
    }
    
    if (formData.property_size) {
      layout.addText(`Wohnfläche: ca. ${formData.property_size} qm`);
    }
    
    layout.addSpacing(4);

    // Zusätzliche Angaben
    if (formData.furnished) {
      layout.addText('Die Wohnung wird möbliert vermietet.');
    }
    
    if (formData.property_details) {
      layout.addText(`Besonderheiten: ${formData.property_details}`);
    }

    // § 2 Mietzeit  
    layout.addSection('§ 2 Mietzeit');
    
    if (formData.lease_type === 'befristet') {
      layout.addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und endet am ${formatDate(formData.end_date)}.`);
      layout.addText('Es endet ohne dass es einer Kündigung bedarf.');
    } else {
      layout.addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und wird auf unbestimmte Zeit geschlossen.`);
      layout.addText(`Die Kündigungsfrist beträgt ${formData.notice_period || 'einen Monat'} zum Monatsende.`);
      layout.addText('Die Kündigung bedarf der Schriftform.');
    }

    // § 3 Miete
    layout.addSection('§ 3 Miete');
    
    layout.addText(`Die Miete beträgt monatlich ${displayValue(formData.rent_amount)} EUR.`);
    
    if (formData.utilities_included) {
      layout.addText('In der Miete sind alle Nebenkosten enthalten.');
    } else {
      if (formData.utilities_amount) {
        layout.addText(`Zusätzlich fallen Nebenkosten in Höhe von ${formData.utilities_amount} EUR monatlich an.`);
      }
    }
    
    layout.addText('Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines jeden Kalendermonats zu entrichten.');

    // § 4 Kaution
    layout.addSection('§ 4 Kaution');
    
    if (formData.deposit_amount && parseFloat(formData.deposit_amount) > 0) {
      layout.addText(`Der Untermieter hinterlegt eine Kaution in Höhe von ${formData.deposit_amount} EUR.`);
      layout.addText('Die Kaution ist bei Vertragsabschluss zu zahlen.');
      layout.addText('Sie wird nach ordnungsgemäßer Beendigung des Mietverhältnisses und Erfüllung aller Verpflichtungen zurückgezahlt.');
    } else {
      layout.addText('Es wird keine Kaution verlangt.');
    }

    // § 5 Pflichten des Untermieters  
    layout.addSection('§ 5 Pflichten des Untermieters');
    
    layout.addText('(1) Der Untermieter ist verpflichtet, die Wohnung pfleglich zu behandeln.');
    layout.addText('(2) Der Untermieter haftet für alle Schäden, die durch ihn oder seine Beauftragte verursacht werden.');
    layout.addText('(3) Reparaturen und Instandhaltungsarbeiten dürfen nur mit Zustimmung des Untervermieters durchgeführt werden.');
    layout.addText('(4) Der Untermieter hat die Hausordnung zu beachten.');

    // § 6 Kündigung  
    layout.addSection('§ 6 Kündigung');
    
    layout.addText('(1) Die Kündigung muss schriftlich erfolgen.');
    
    if (formData.lease_type === 'unbefristet') {
      layout.addText(`(2) Die Kündigungsfrist beträgt ${formData.notice_period || 'einen Monat'} zum Monatsende.`);
    }
    
    layout.addText('(3) Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt.');
    layout.addText('(4) Bei Beendigung des Mietverhältnisses sind alle Schlüssel zurückzugeben.');

    // § 7 Sonstiges
    layout.addSection('§ 7 Sonstiges');
    
    layout.addText('(1) Mündliche Nebenabreden bestehen nicht.');
    layout.addText('(2) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.');
    layout.addText('(3) Gerichtsstand ist der Ort der Mietsache.');

    // Unterschrifts-Bereich
    layout.addSignatureSection([
      { 
        label: 'Unterschrift Untervermieter', 
        name: displayValue(formData.sublessor_name) 
      },
      { 
        label: 'Unterschrift Untermieter', 
        name: displayValue(formData.sublessee_name) 
      }
    ]);

    // Footer
    layout.addFooter('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen');

    // Addons anhängen (WICHTIG: Keine Addons beim Hauptvertrag)
    if (selectedAddons.includes('explanations')) {
      generateContractExplanationsPDF_WithLayout(pdf, layout, formData);
    }

    if (selectedAddons.includes('handover_protocol') || selectedAddons.includes('protocol')) {
      generateHandoverProtocolPDF_WithLayout(pdf, layout, formData);
    }

    return pdf;

  } catch (error) {
    console.error('PDF-Generierung fehlgeschlagen:', error);
    throw new Error('PDF konnte nicht generiert werden: ' + error.message);
  }
}

// Übergabeprotokoll mit Layout Manager - erweitert mit Checkbox-Tabellen
function generateHandoverProtocolPDF_WithLayout(pdf, parentLayout, formData) {
  pdf.addPage();
  
  // Neuer Layout Manager für diese Seite
  const layout = new PDFLayoutManager(pdf, parentLayout.config);

  const displayValue = (value, placeholder = '') => {
    if (!value || value.toString().trim() === '') {
      return `_${'_'.repeat(Math.max(15, placeholder.length || 15))}`;
    }
    return value;
  };

  try {
    // Header
    layout.addText('ÜBERGABEPROTOKOLL', { fontSize: 16, style: 'bold' });
    layout.addText('für die Untermietung von Wohnraum', { fontSize: 11, style: 'italic' });
    layout.addSpacing(8);

    // Objektdaten
    layout.addSection('OBJEKTDATEN');
    layout.addText(`Adresse: ${displayValue(formData.property_address)}`);
    layout.addText(`Wohnfläche: ${formData.property_size ? `ca. ${formData.property_size} qm` : displayValue('')}`);
    layout.addSpacing(6);

    // Übergabe-Details mit Eingabefeldern
    layout.addInputField('Übergabedatum: ', { width: 80 });
    layout.addSpacing(2);
    layout.addInputField('Übergabezeit: ', { width: 60 });
    layout.addSpacing(4);

    // Art der Übergabe - Checkbox-Gruppe
    layout.addText('Art der Übergabe:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    
    layout.addCheckboxGroup([
      { label: 'Einzug', checked: false },
      { label: 'Auszug', checked: false },
      { label: 'Zwischenübergabe', checked: false }
    ], { spacing: 45 });

    layout.addSpacing(8);

    // Anwesende Personen
    layout.addSection('ANWESENDE PERSONEN');
    layout.addInputField('Untervermieter/Bevollmächtigter: ', { width: 120 });
    layout.addInputField('Untermieter: ', { width: 120 });
    layout.addInputField('Weitere Personen: ', { width: 120 });
    layout.addSpacing(8);

    // Zustand der Wohnung
    layout.addSection('ZUSTAND DER WOHNUNG BEI ÜBERGABE');
    
    // Reinigungszustand - erweitert mit Checkbox-Tabelle
    layout.addText('Reinigungszustand:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    
    const cleaningData = [
      ['Wohnung ist gereinigt und besenrein', { type: 'checkbox' }],
      ['Wohnung muss noch gereinigt werden', { type: 'checkbox' }],
      ['Wohnung ist verschmutzt/unrein', { type: 'checkbox' }]
    ];
    
    layout.addTable(
      ['Zustand', '✓'],
      cleaningData,
      { columnWidths: [140, 20] }
    );
    
    layout.addSpacing(6);

    // Schönheitsreparaturen - Checkbox-Tabelle
    layout.addText('Schönheitsreparaturen:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    
    const repairData = [
      ['Alle erforderlichen Schönheitsreparaturen sind durchgeführt', { type: 'checkbox' }],
      ['Schönheitsreparaturen teilweise durchgeführt', { type: 'checkbox' }],
      ['Schönheitsreparaturen sind noch erforderlich', { type: 'checkbox' }]
    ];
    
    layout.addTable(
      ['Zustand', '✓'],
      repairData,
      { columnWidths: [140, 20] }
    );
    
    layout.addSpacing(6);

    // Allgemeiner Zustand - Checkbox-Tabelle
    layout.addText('Allgemeiner Zustand der Wohnung:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    
    const conditionData = [
      ['Einwandfreier Zustand', { type: 'checkbox' }],
      ['Gebrauchsspuren vorhanden', { type: 'checkbox' }],
      ['Mängel vorhanden (siehe unten)', { type: 'checkbox' }]
    ];
    
    layout.addTable(
      ['Zustand', '✓'],
      conditionData,
      { columnWidths: [140, 20] }
    );
    
    layout.addSpacing(8);

    // Zustandsbeschreibung der Räume
    layout.addSection('ZUSTANDSBESCHREIBUNG DER RÄUME');
    layout.addText('(Zustand: 1 = sehr gut, 2 = gut, 3 = befriedigend, 4 = ausreichend, 5 = mangelhaft)', 
                   { fontSize: 9, style: 'italic' });
    layout.addSpacing(4);

    // Raum-Tabelle
    const rooms = [
      'Wohnzimmer', 'Schlafzimmer', 'Küche', 'Bad/WC', 
      'Flur/Diele', 'Balkon/Terrasse', 'Keller', 'Abstellraum'
    ];

    const roomData = rooms.map(room => [
      room,
      { type: 'input' }, // Zustand
      { type: 'input' }  // Bemerkungen
    ]);

    layout.addTable(
      ['Raum', 'Zustand', 'Bemerkungen'],
      roomData,
      { columnWidths: [50, 25, 95] }
    );

    layout.addSpacing(8);

    // Zählerstände-Tabelle
    layout.addSection('ZÄHLERSTÄNDE');
    
    const meters = [
      'Strom (Allgemeinstrom)',
      'Strom (Wohnung)', 
      'Gas',
      'Wasser (kalt)',
      'Wasser (warm)',
      'Heizung'
    ];

    const meterData = meters.map(meter => [
      meter,
      { type: 'input' }, // Zählernummer
      { type: 'input' }, // Stand
      { type: 'input' }  // Ablesung durch
    ]);

    layout.addTable(
      ['Zähler', 'Zählernummer', 'Stand', 'Ablesung durch'],
      meterData,
      { columnWidths: [50, 40, 25, 40] }
    );

    layout.addSpacing(8);

    // Schlüsselübergabe-Tabelle
    layout.addSection('SCHLÜSSELÜBERGABE');

    const keyTypes = [
      'Wohnungsschlüssel',
      'Haustürschlüssel', 
      'Kellerschlüssel',
      'Briefkastenschlüssel',
      'Sonstige Schlüssel'
    ];

    const keyData = keyTypes.map(keyType => [
      keyType,
      { type: 'input' }, // Anzahl
      { type: 'input' }  // Bemerkungen
    ]);

    layout.addTable(
      ['Schlüsselart', 'Anzahl', 'Bemerkungen'],
      keyData,
      { columnWidths: [70, 20, 70] }
    );

    layout.addSpacing(12);

    // Mängel und Besonderheiten - neue Seite falls nötig
    layout.checkPageBreak(80);

    layout.addSection('MÄNGEL UND BESONDERHEITEN');
    layout.addText('(Vorhandene Schäden, Abnutzungen, Besonderheiten)', 
                   { fontSize: 9, style: 'italic' });
    layout.addSpacing(8);

    // Freie Eingabe-Linien
    for (let i = 0; i < 12; i++) {
      layout.addInputField('', { showLabel: false, width: 170 });
    }

    layout.addSpacing(8);

    // Besondere Vereinbarungen
    layout.addSection('BESONDERE VEREINBARUNGEN');
    layout.addText('(Zusätzliche Absprachen, Termine, Fristen)', 
                   { fontSize: 9, style: 'italic' });
    layout.addSpacing(8);

    // Weitere Eingabe-Linien
    for (let i = 0; i < 6; i++) {
      layout.addInputField('', { showLabel: false, width: 170 });
    }

    layout.addSpacing(12);

    // Bestätigung  
    layout.checkPageBreak(60);
    
    layout.addSection('BESTÄTIGUNG');
    layout.addText('Die Übergabe wurde ordnungsgemäß durchgeführt. Beide Parteien bestätigen den oben beschriebenen Zustand der Wohnung.');
    layout.addSpacing(8);

    // Unterschriften
    layout.addSignatureSection([
      { 
        label: 'Unterschrift Untervermieter',
        name: displayValue(formData.sublessor_name)
      },
      { 
        label: 'Unterschrift Untermieter',
        name: displayValue(formData.sublessee_name)
      }
    ]);

    // Footer
    layout.addFooter('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen');

  } catch (error) {
    console.error('Übergabeprotokoll-Generierung fehlgeschlagen:', error);
    throw error;
  }
}

// Vertrags-Erläuterungen mit Layout Manager
function generateContractExplanationsPDF_WithLayout(pdf, parentLayout, formData) {
  pdf.addPage();
  
  const layout = new PDFLayoutManager(pdf, parentLayout.config);

  try {
    layout.addText('VERTRAGSERLÄUTERUNGEN', { fontSize: 16, style: 'bold' });
    layout.addText('Erklärungen zum Untermietvertrag', { fontSize: 11, style: 'italic' });
    layout.addSpacing(15);

    layout.addSection('ÜBERBLICK');
    layout.addText('Ein Untermietvertrag liegt vor, wenn der Hauptmieter die von ihm gemietete Wohnung ganz oder teilweise an einen Dritten weitervermietet.');
    layout.addSpacing(6);

    layout.addSection('WICHTIGE PUNKTE');
    
    layout.addText('Zustimmung des Vermieters:', { fontSize: 10, style: 'bold' });
    layout.addText('Für die Untervermietung ist grundsätzlich die Zustimmung des Hauptvermieters erforderlich. Diese sollte schriftlich eingeholt werden.');
    layout.addSpacing(4);

    layout.addText('Mietdauer:', { fontSize: 10, style: 'bold' });
    if (formData.lease_type === 'befristet') {
      layout.addText('Ihr Untermietvertrag ist befristet und endet automatisch am vereinbarten Datum. Eine Kündigung ist nicht erforderlich.');
    } else {
      layout.addText('Ihr Untermietvertrag ist unbefristet. Sie können mit der vereinbarten Frist kündigen.');
    }
    layout.addSpacing(4);

    layout.addText('Miethöhe:', { fontSize: 10, style: 'bold' });
    layout.addText('Die Untermiete darf in der Regel nicht wesentlich höher sein als die anteilige Hauptmiete. Bei möblierten Zimmern ist ein angemessener Aufschlag zulässig.');
    layout.addSpacing(4);

    layout.addText('Kündigungsrecht:', { fontSize: 10, style: 'bold' });
    layout.addText('Sowohl Untervermieter als auch Untermieter haben ein ordentliches Kündigungsrecht. Die Kündigungsfristen sind meist kürzer als bei Hauptmietverhältnissen.');
    layout.addSpacing(4);

    layout.addText('Haftung:', { fontSize: 10, style: 'bold' });
    layout.addText('Der Untervermieter haftet dem Hauptvermieter gegenüber für alle Schäden, die durch den Untermieter verursacht werden.');
    layout.addSpacing(6);

    layout.addSection('RECHTE UND PFLICHTEN');

    layout.addText('Untervermieter:', { fontSize: 10, style: 'bold' });
    layout.addText('• Muss die Wohnung in vertragsgemäßem Zustand überlassen');
    layout.addText('• Haftet für Mängel der Mietsache');
    layout.addText('• Darf angemessene Hausregeln aufstellen');
    layout.addSpacing(4);

    layout.addText('Untermieter:', { fontSize: 10, style: 'bold' });
    layout.addText('• Muss die Miete pünktlich zahlen');
    layout.addText('• Soll die Wohnung pfleglich behandeln');
    layout.addText('• Muss die Hausordnung beachten');
    layout.addText('• Hat Anspruch auf ordnungsgemäße Nutzung');

    layout.addSpacing(8);

    layout.addSection('WICHTIGE HINWEISE');
    layout.addText('• Alle Vereinbarungen sollten schriftlich festgehalten werden');
    layout.addText('• Bei Problemen sollten Sie sich rechtlich beraten lassen');
    layout.addText('• Bewahren Sie alle wichtigen Dokumente sorgfältig auf');
    layout.addText('• Dokumentieren Sie den Zustand der Wohnung bei Ein- und Auszug');

    layout.addSpacing(12);

    layout.addSection('BESONDERE REGELUNGEN');
    
    if (formData.furnished) {
      layout.addText('Möblierte Vermietung:', { fontSize: 10, style: 'bold' });
      layout.addText('Bei möblierter Vermietung ist besondere Sorgfalt im Umgang mit dem Inventar geboten. Erstellen Sie am besten eine Inventarliste.');
      layout.addSpacing(4);
    }

    if (formData.deposit_amount && parseFloat(formData.deposit_amount) > 0) {
      layout.addText('Kaution:', { fontSize: 10, style: 'bold' });
      layout.addText(`Die vereinbarte Kaution von ${formData.deposit_amount} EUR dient der Sicherheit des Untervermieters. Sie wird nach ordnungsgemäßer Beendigung des Mietverhältnisses zurückgezahlt.`);
      layout.addSpacing(4);
    }

    if (!formData.utilities_included) {
      layout.addText('Nebenkosten:', { fontSize: 10, style: 'bold' });
      layout.addText('Die Nebenkosten sollten angemessen und nachvollziehbar sein. Sie haben das Recht auf Einsicht in die Nebenkostenabrechnung.');
    }

    layout.addSpacing(12);

    // Footer
    layout.addFooter('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen');

  } catch (error) {
    console.error('Vertragserläuterungen-Generierung fehlgeschlagen:', error);
    throw error;
  }
}

// Multi-PDF System für separate Downloads
export function generateAllDocuments(formData, selectedAddons = []) {
  try {
    const documents = [];

    // Hauptvertrag (immer) - WICHTIG: Verwende die bestehende Funktion OHNE Addons
    const mainContract = generateUntermietvertragPDF(formData, []); // ← KEIN selectedAddons hier!
    
    documents.push({
      type: 'main_contract',
      name: 'Untermietvertrag',
      filename: 'Untermietvertrag.pdf',
      pdf: mainContract
    });

    // Vertragserläuterungen (falls gewählt)
    if (selectedAddons.includes('explanations')) {
      const explanationsPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const layout = new PDFLayoutManager(explanationsPdf);
      generateContractExplanationsPDF_WithLayout(explanationsPdf, layout, formData);
      
      documents.push({
        type: 'explanations',
        name: 'Vertragserläuterungen',
        filename: 'Vertragserlauterungen.pdf',
        pdf: explanationsPdf
      });
    }

    // Übergabeprotokoll (falls gewählt)
    if (selectedAddons.includes('protocol') || selectedAddons.includes('handover_protocol')) {
      const protocolPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const layout = new PDFLayoutManager(protocolPdf);
      generateHandoverProtocolPDF_WithLayout(protocolPdf, layout, formData);
      
      documents.push({
        type: 'handover_protocol',
        name: 'Übergabeprotokoll',
        filename: 'Uebergabeprotokoll.pdf',
        pdf: protocolPdf
      });
    }

    return documents;

  } catch (error) {
    console.error('Multi-PDF Generation Error:', error);
    throw new Error('Dokumente konnten nicht generiert werden: ' + error.message);
  }
}

// Bestehende API-Funktionen bleiben unverändert für Kompatibilität
export async function generateAndReturnPDF(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔄 PDF API ENTRY POINT');
    console.log('🔍 Received formData:', formData);
    console.log('🔍 Received selectedAddons:', selectedAddons);
    
    const pdf = generateUntermietvertragPDF(formData, selectedAddons);
    
    switch (returnType) {
      case 'blob':
        return pdf.output('blob');
      case 'datauri':
        return pdf.output('datauristring');
      case 'arraybuffer':
        return pdf.output('arraybuffer');
      default:
        return pdf.output('blob');
    }
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw error;
  }
}

// Separate Documents API
export async function generateSeparateDocuments(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔄 Modern Multi-PDF API ENTRY POINT');
    console.log('🔍 Received formData:', formData);
    console.log('🔍 Received selectedAddons:', selectedAddons);
    
    const documents = generateAllDocuments(formData, selectedAddons);
    
    const results = documents.map(doc => ({
      type: doc.type,
      name: doc.name,
      filename: doc.filename,
      data: (() => {
        switch (returnType) {
          case 'blob':
            return doc.pdf.output('blob');
          case 'datauri':
            return doc.pdf.output('datauristring');
          case 'arraybuffer':
            return doc.pdf.output('arraybuffer');
          default:
            return doc.pdf.output('blob');
        }
      })()
    }));
    
    console.log(`✅ Generated ${results.length} separate documents successfully`);
    return results;
    
  } catch (error) {
    console.error('❌ Multi-PDF generation failed:', error);
    throw error;
  }
}

// Export default für Kompatibilität
export default generateUntermietvertragPDF;
