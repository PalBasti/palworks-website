// lib/pdf/untermietvertragGenerator.js - ERWEITERT UM SEPARATE DOWNLOADS
import jsPDF from 'jspdf';

// ============================================
// BESTEHENDE HAUPT-FUNKTION (unverändert)
// ============================================
export function generateUntermietvertragPDF(formData, selectedAddons = []) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // PDF-Konfiguration
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const lineHeight = 6;
  let currentY = margin;

  // Helper-Funktionen
  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    
    // Text-Wrapping für lange Zeilen
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    pdf.text(lines, x, currentY);
    currentY += lines.length * lineHeight;
    return currentY;
  };

  const addSection = (title, content, spacing = 8) => {
    currentY += spacing;
    addText(title, margin, 12, 'bold');
    currentY += 2;
    if (content) addText(content);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '[DATUM EINTRAGEN]';
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch {
      return '[DATUM EINTRAGEN]';
    }
  };

  const displayValue = (value, placeholder = '[EINTRAGEN]') => {
    return value && value.toString().trim() !== '' ? value : placeholder;
  };

  // PDF-Generierung starten
  try {
    // Header
    addText('UNTERMIETVERTRAG', margin, 16, 'bold');
    addText('für die Überlassung einer ganzen Wohnung', margin, 11, 'italic');
    currentY += 10;

    // Vertragsparteien
    addSection('ZWISCHEN', '');
    
    // Untervermieter (Hauptmieter)
    addText('Untervermieter (Hauptmieter):', margin, 11, 'bold');
    currentY += 2;
    addText(`Name: ${displayValue(formData.landlord_name)}`);
    addText(`Anschrift: ${displayValue(formData.landlord_address)}`);
    currentY += 4;

    addText('UND', margin, 11, 'bold');
    currentY += 4;

    // Untermieter
    addText('Untermieter:', margin, 11, 'bold');
    currentY += 2;
    addText(`Name: ${displayValue(formData.tenant_name)}`);
    addText(`Anschrift: ${displayValue(formData.tenant_address)}`);
    currentY += 4;

    addText('wird folgender Untermietvertrag geschlossen:', margin, 11, 'bold');
    currentY += 8;

    // § 1 Vertragsgegenstand
    addSection('§ 1 Vertragsgegenstand', '');
    
    addText('(1) Mietobjekt');
    addText('Der Untervermieter ist alleiniger Mieter der Wohnung:');
    currentY += 2;
    addText(`Straße und Hausnummer: ${displayValue(formData.property_address)}`);
    addText(`PLZ und Ort: ${displayValue(formData.property_postal)} ${displayValue(formData.property_city)}`);
    
    if (formData.property_floor) {
      addText(`Geschoss: ${formData.property_floor}`);
    }
    if (formData.property_number) {
      addText(`Wohnungsnummer: ${formData.property_number}`);
    }
    if (formData.property_sqm) {
      addText(`Wohnfläche: ca. ${formData.property_sqm} qm`);
    }
    currentY += 4;

    // Möblierung
    const furnishedText = {
      'furnished': 'möbliert',
      'partially': 'teilmöbliert', 
      'unfurnished': 'nicht möbliert'
    };
    addText(`(2) Die Wohnung wird ${furnishedText[formData.furnished] || 'nicht möbliert'} überlassen.`);
    currentY += 2;

    // Ausstattung
    if (formData.equipment_list && formData.equipment_list.trim()) {
      addText('(3) Mitvermietet sind folgende Ausstattungsgegenstände:');
      addText(formData.equipment_list, margin + 5);
      currentY += 2;
    }

    addText('(4) Dem Untermieter ist bekannt, dass der Untervermieter selbst Mieter ist und er gegenüber dem Eigentümer der Wohnung keinen Kündigungsschutz genießt.');

    // Neue Seite wenn nötig
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }

    // § 2 Mietzeit
    addSection('§ 2 Mietzeit', '');
    
    addText(`(1) Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und`);
    
    if (formData.contract_type === 'fixed_term') {
      addText(`endet am ${formatDate(formData.end_date)}, ohne dass es einer Kündigung bedarf.`);
    } else {
      addText('läuft auf unbestimmte Zeit. Es kann von beiden Seiten mit einer Frist von drei Monaten zum Ende eines Kalendermonats gekündigt werden.');
    }
    currentY += 2;

    addText('(2) Setzt der Untermieter nach Ablauf der Mietzeit den Gebrauch der Mietsache fort, so findet eine Verlängerung des Mietverhältnisses nach § 545 BGB nicht statt.');

    // § 3 Miete und Nebenkosten
    addSection('§ 3 Miete und Nebenkosten', '');
    
    addText(`(1) Die Monatsmiete beträgt ${displayValue(formData.rent_amount)} EUR und ist monatlich im Voraus bis zum 3. Werktag eines Monats an den Untervermieter zu zahlen.`);
    currentY += 2;

    if (formData.heating_costs && formData.heating_costs.trim()) {
      addText(`(2) Daneben wird eine Pauschale für Heizung und Warmwasser von monatlich ${formData.heating_costs} EUR geschuldet.`);
      currentY += 2;
    }

    if (formData.other_costs && formData.other_costs.trim()) {
      addText(`(3) Die Pauschale für die übrigen Nebenkosten beträgt monatlich ${formData.other_costs} EUR.`);
      currentY += 2;
    }

    if (formData.deposit && formData.deposit.trim()) {
      addText(`(4) Der Untermieter leistet eine Kaution in Höhe von ${formData.deposit} EUR. Die Zahlung kann in drei Monatsraten erfolgen.`);
    }

    // Weitere Paragraphen (kompakt)
    if (currentY > 230) {
      pdf.addPage();
      currentY = margin;
    }

    // § 4 Weitere Bestimmungen
    addSection('§ 4 Nutzung und Instandhaltung', '');
    addText('(1) Der Untermieter ist verpflichtet, die Mieträume pfleglich zu behandeln und nur zu Wohnzwecken zu nutzen.');
    addText('(2) Schönheitsreparaturen gehen zu Lasten des Untermieters, soweit sie durch normalen Gebrauch erforderlich werden.');
    addText('(3) Der Untermieter haftet für alle Schäden, die durch ihn oder seine Besucher verursacht werden.');

    addSection('§ 5 Beendigung des Mietverhältnisses', '');
    addText('(1) Bei Beendigung des Mietverhältnisses ist die Wohnung besenrein und in ordnungsgemäßem Zustand zu übergeben.');
    addText('(2) Schlüssel sind vollständig zurückzugeben.');
    addText('(3) Die Kaution wird nach ordnungsgemäßer Übergabe und Abrechnung zurückgezahlt.');

    addSection('§ 6 Sonstiges', '');
    addText('(1) Mündliche Nebenabreden bestehen nicht.');
    addText('(2) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.');
    addText('(3) Gerichtsstand ist der Ort der Mietsache.');

    // Unterschriftenbereich
    currentY += 15;
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin + 20;
    }

    addText(`Ort, Datum: _________________, den ${new Date().toLocaleDateString('de-DE')}`, margin, 11, 'normal');
    currentY += 20;

    // Unterschriftsfelder
    const signatureY = currentY;
    addText('_________________________________', margin);
    addText('Untervermieter', margin, 9);
    
    addText('_________________________________', pageWidth - margin - 80);
    addText('Untermieter', pageWidth - margin - 80, 9);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, pageHeight - 10);

    return pdf;

  } catch (error) {
    console.error('PDF-Generierung fehlgeschlagen:', error);
    throw new Error('PDF konnte nicht generiert werden: ' + error.message);
  }
}

// ============================================
// NEU: VERTRAGSERLÄUTERUNGEN (Separates PDF)
// ============================================
export function generateContractExplanationsPDF(formData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const lineHeight = 6;
  let currentY = 20;

  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    pdf.text(lines, x, currentY);
    currentY += lines.length * lineHeight;
  };

  const addSection = (title, spacing = 8) => {
    currentY += spacing;
    addText(title, margin, 12, 'bold');
    currentY += 3;
  };

  const checkPageBreak = (requiredSpace = 30) => {
    if (currentY > pageHeight - requiredSpace) {
      pdf.addPage();
      currentY = margin;
    }
  };

  try {
    // Header
    addText('VERTRAGSERLÄUTERUNGEN', margin, 16, 'bold');
    addText('Erklärungen zum Untermietvertrag', margin, 12, 'italic');
    currentY += 12;

    // § 1 Erläuterungen
    addSection('§ 1 Vertragsgegenstand - Erläuterungen');
    addText('Ein Untermietvertrag liegt vor, wenn der Hauptmieter (Untervermieter) die von ihm gemietete Wohnung ganz oder teilweise an einen Dritten (Untermieter) weitervermietet.');
    currentY += 4;

    addText('Wichtige Hinweise:');
    addText('• Der Untervermieter benötigt grundsätzlich die Erlaubnis des Vermieters');
    addText('• Der Untermieter hat keinen direkten Anspruch gegen den Eigentümer');
    addText('• Bei Kündigung des Hauptmietverhältnisses endet auch die Untermiete');
    currentY += 4;

    addText('Möblierung: Bei möblierter Vermietung muss ein Inventarverzeichnis erstellt werden. Der Zustand der Möbel sollte bei Ein- und Auszug dokumentiert werden.');

    checkPageBreak();
    addSection('§ 2 Mietzeit - Erläuterungen');
    addText('Befristete Untermiete: Ein befristeter Untermietvertrag endet automatisch zum vereinbarten Zeitpunkt, ohne dass eine Kündigung erforderlich ist.');
    currentY += 4;

    addText('Unbefristete Untermiete: Bei unbefristeten Verträgen gelten die gesetzlichen Kündigungsfristen (3 Monate zum Monatsende für Wohnraum).');
    currentY += 4;

    addText('Besonderheit: Der Untervermieter kann das Untermietverhältnis auch dann kündigen, wenn er die Räume für sich oder seine Familienangehörigen benötigt.');

    checkPageBreak();
    addSection('§ 3 Miete und Nebenkosten - Erläuterungen');
    addText('Mietpreisgestaltung: Die Untermiete darf grundsätzlich höher sein als die Hauptmiete, jedoch sind bei möblierter Vermietung und Nebenkosten bestimmte Grenzen zu beachten.');
    currentY += 4;

    addText('Nebenkosten: Diese sollten konkret aufgelistet werden. Eine pauschale Abrechnung ist möglich, bei Nachzahlungen muss der Untermieter aber informiert werden.');
    currentY += 4;

    addText('Kaution: Die Höhe ist gesetzlich nicht begrenzt, üblich sind 1-3 Monatsmieten. Die Kaution muss getrennt vom Vermögen des Untervermieters angelegt werden.');

    checkPageBreak();
    addSection('Rechtliche Hinweise');
    addText('Widerrufsrecht: Bei Verträgen, die außerhalb von Geschäftsräumen oder im Fernabsatz geschlossen werden, besteht ein 14-tägiges Widerrufsrecht.');
    currentY += 4;

    addText('Gewährleistung: Für Mängel der Mietsache haftet primär der Untervermieter. Bei versteckten Mängeln kann auch der Eigentümer in Anspruch genommen werden.');
    currentY += 4;

    addText('Mieterschutz: Auch Untermieter genießen Kündigungsschutz nach dem BGB. Missbräuchliche Kündigungen sind unwirksam.');

    // Footer
    currentY += 15;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Diese Erläuterungen dienen nur der Information und ersetzen keine Rechtsberatung.', margin, currentY);
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, currentY + 5);

    return pdf;

  } catch (error) {
    console.error('Contract Explanations PDF Generation Error:', error);
    throw new Error('Vertragserläuterungen PDF konnte nicht generiert werden: ' + error.message);
  }
}

// ============================================
// NEU: ÜBERGABEPROTOKOLL (Separates PDF)
// ============================================
export function generateHandoverProtocolPDF(formData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  const lineHeight = 6;
  let currentY = 20;

  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, 170);
    pdf.text(lines, x, currentY);
    currentY += lines.length * lineHeight;
  };

  const displayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && (value.trim() === '' || value.trim() === 'undefined')) return '';
    return value.toString().trim();
  };

  try {
    // Header
    addText('ÜBERGABEPROTOKOLL', margin, 16, 'bold');
    addText('zur Wohnungsübergabe', margin, 11, 'italic');
    currentY += 8;

    // Vertragsdaten
    addText('Vertragsbezug:', margin, 12, 'bold');
    currentY += 3;
    
    const propertyStreet = displayValue(formData.property_address || formData.property_street);
    const propertyPostal = displayValue(formData.property_postal);
    const propertyCity = displayValue(formData.property_city);
    
    if (propertyStreet && propertyPostal && propertyCity) {
      addText(`Mietobjekt: ${propertyStreet}, ${propertyPostal} ${propertyCity}`);
    } else {
      addText('Mietobjekt: _________________________________');
    }

    currentY += 4;
    addText(`Übergabedatum: ${new Date().toLocaleDateString('de-DE')}`);
    addText('Übergabezeit: ____________');
    currentY += 6;

    // Anwesende Personen
    addText('Anwesende Personen:', margin, 12, 'bold');
    currentY += 3;
    addText(`Untervermieter: ${displayValue(formData.landlord_name) || '________________________'}`);
    addText(`Untermieter: ${displayValue(formData.tenant_name) || '________________________'}`);
    addText('Weitere: ________________________________');
    currentY += 6;

    // Zustand der Räume
    addText('ZUSTAND DER RÄUME', margin, 12, 'bold');
    currentY += 4;

    const rooms = [
      'Wohnzimmer',
      'Schlafzimmer',
      'Küche',
      'Bad',
      'Flur',
      'Balkon/Terrasse'
    ];

    rooms.forEach(room => {
      addText(`${room}:`, margin, 11, 'bold');
      addText('□ einwandfrei  □ leichte Mängel  □ erhebliche Mängel');
      addText('Bemerkungen: ________________________________________________');
      addText('____________________________________________________________');
      currentY += 3;
    });

    // Schlüsselübergabe
    currentY += 4;
    addText('SCHLÜSSELÜBERGABE', margin, 12, 'bold');
    currentY += 3;
    addText('Anzahl übergebener Schlüssel:');
    addText('□ Haustürschlüssel: ____ Stück');
    addText('□ Wohnungsschlüssel: ____ Stück');
    addText('□ Briefkastenschlüssel: ____ Stück');
    addText('□ Sonstige: ________________________');
    currentY += 6;

    // Mängel und Schäden
    addText('MÄNGEL UND SCHÄDEN', margin, 12, 'bold');
    currentY += 3;
    addText('Folgende Mängel/Schäden sind bei Übergabe vorhanden:');
    currentY += 2;
    
    for (let i = 0; i < 8; i++) {
      addText('___________________________________________________________');
    }
    
    currentY += 6;
    addText('Beide Parteien bestätigen den dokumentierten Zustand.');
    currentY += 15;

    // Unterschriften
    const signatureY = currentY;
    
    pdf.line(margin, signatureY, margin + 70, signatureY);
    pdf.setFontSize(9);
    pdf.text('Datum: ___________', margin, signatureY + 5);
    pdf.text('Untervermieter', margin, signatureY + 10);
    
    pdf.line(120, signatureY, 190, signatureY);
    pdf.text('Datum: ___________', 120, signatureY + 5);
    pdf.text('Untermieter', 120, signatureY + 10);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, signatureY + 20);

    return pdf;

  } catch (error) {
    console.error('Handover Protocol PDF Generation Error:', error);
    throw new Error('Übergabeprotokoll PDF konnte nicht generiert werden: ' + error.message);
  }
}

// ============================================
// NEU: MODULARE API - MULTI-PDF GENERATOR
// ============================================

/**
 * Generiert alle gewünschten PDFs basierend auf selectedAddons
 * Gibt ein Array von PDF-Objekten zurück - ein PDF pro Dokumenttyp
 */
export function generateAllDocuments(formData, selectedAddons = []) {
  const documents = [];

  try {
    // 1. Haupt-Vertrag (immer generieren)
    console.log('🔍 Generating main contract PDF...');
    const mainContract = generateUntermietvertragPDF(formData, selectedAddons);
    documents.push({
      type: 'contract',
      name: 'Untermietvertrag',
      filename: 'Untermietvertrag.pdf',
      pdf: mainContract
    });

    // 2. Übergabeprotokoll (falls gewählt)
    if (shouldIncludeHandoverProtocol(selectedAddons)) {
      console.log('🔍 Generating handover protocol PDF...');
      const protocolPDF = generateHandoverProtocolPDF(formData);
      documents.push({
        type: 'handover_protocol',
        name: 'Übergabeprotokoll',
        filename: 'Uebergabeprotokoll.pdf',
        pdf: protocolPDF
      });
    }

    // 3. Vertragserläuterungen (falls gewählt)
    if (shouldIncludeExplanations(selectedAddons)) {
      console.log('🔍 Generating contract explanations PDF...');
      const explanationsPDF = generateContractExplanationsPDF(formData);
      documents.push({
        type: 'explanations',
        name: 'Vertragserläuterungen',
        filename: 'Vertragserklaerungen.pdf',
        pdf: explanationsPDF
      });
    }

    console.log(`🔍 Generated ${documents.length} documents total`);
    return documents;

  } catch (error) {
    console.error('Multi-PDF Generation Error:', error);
    throw new Error('Dokumente konnten nicht generiert werden: ' + error.message);
  }
}

/**
 * Helper: Prüft ob Übergabeprotokoll gewählt wurde
 */
function shouldIncludeHandoverProtocol(selectedAddons) {
  if (!selectedAddons || !Array.isArray(selectedAddons)) return false;
  
  return selectedAddons.includes('protocol') || 
         selectedAddons.includes('handover_protocol') ||
         selectedAddons.some(addon => 
           (typeof addon === 'object' && (addon.id === 'handover_protocol' || addon.name === 'Übergabeprotokoll')) ||
           (typeof addon === 'string' && addon.includes('protocol'))
         );
}

/**
 * Helper: Prüft ob Vertragserläuterungen gewählt wurden
 */
function shouldIncludeExplanations(selectedAddons) {
  if (!selectedAddons || !Array.isArray(selectedAddons)) return false;
  
  return selectedAddons.includes('explanation') || 
         selectedAddons.includes('explanations') ||
         selectedAddons.some(addon => 
           (typeof addon === 'object' && (addon.id === 'explanation' || addon.name === 'Vertragserläuterungen')) ||
           (typeof addon === 'string' && addon.includes('explanation'))
         );
}

// ============================================
// NEU: MODERNE API FÜR SEPARATE DOWNLOADS
// ============================================

/**
 * Moderne API: Gibt separate PDFs zurück
 * Empfohlen für neue Implementierungen
 */
export async function generateSeparateDocuments(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔍 Modern Multi-PDF API ENTRY POINT');
    console.log('🔍 Received formData:', formData);
    console.log('🔍 Received selectedAddons:', selectedAddons);
    
    const documents = generateAllDocuments(formData, selectedAddons);
    
    // Konvertiere jedes PDF zum gewünschten Format
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
    
    console.log(`🔍 Generated ${results.length} separate documents successfully`);
    return results;
    
  } catch (error) {
    console.error('🔍 Multi-PDF generation failed:', error);
    throw error;
  }
}

// ============================================
// BESTEHENDE API (Rückwärtskompatibilität)
// ============================================

/**
 * Legacy-Funktion für bestehende Integration
 * Generiert ein einzelnes PDF mit allen gewählten Dokumenten
 */
export async function generateAndReturnPDF(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔍 === PDF API ENTRY POINT ===');
    console.log('🔍 Received formData:', formData);
    console.log('🔍 Received selectedAddons:', selectedAddons);
    console.log('🔍 Addons type:', typeof selectedAddons, Array.isArray(selectedAddons));
    console.log('🔍 Return type:', returnType);
    console.log('🔍 === CALLING PDF GENERATOR ===');
    
    const pdf = generateUntermietvertragPDF(formData, selectedAddons);
    
    console.log('🔍 PDF generated successfully');
    
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
    console.error('🔍 PDF generation failed:', error);
    throw error;
  }
}
