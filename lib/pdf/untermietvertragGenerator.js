// lib/pdf/untermietvertragGenerator.js
import jsPDF from 'jspdf';

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

    // Übergabeprotokoll anhängen falls ausgewählt
    if (selectedAddons.includes('protocol')) {
      generateHandoverProtocol(pdf, formData);
    }

    return pdf;

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('PDF konnte nicht generiert werden: ' + error.message);
  }
}

// Übergabeprotokoll anhängen
function generateHandoverProtocol(pdf, formData) {
  pdf.addPage();
  let currentY = 20;
  const margin = 20;
  const lineHeight = 6;

  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, 170);
    pdf.text(lines, x, currentY);
    currentY += lines.length * lineHeight;
    return currentY;
  };

  // Header Übergabeprotokoll
  addText('ÜBERGABEPROTOKOLL', margin, 16, 'bold');
  addText('zur Wohnungsübergabe', margin, 11, 'italic');
  currentY += 8;

  // Vertragsdaten
  addText('Vertragsbezug:', margin, 11, 'bold');
  addText(`Mietobjekt: ${formData.property_address || '[ADRESSE]'}, ${formData.property_postal || '[PLZ]'} ${formData.property_city || '[ORT]'}`);
  addText(`Untervermieter: ${formData.landlord_name || '[NAME]'}`);
  addText(`Untermieter: ${formData.tenant_name || '[NAME]'}`);
  currentY += 8;

  // Übergabedaten
  addText('Übergabedaten:', margin, 11, 'bold');
  addText('Datum: ________________  Uhrzeit: ___________');
  addText('Art der Übergabe:  ☐ Einzug  ☐ Auszug');
  currentY += 8;

  // Zustandsbeschreibung
  addText('ZUSTANDSBESCHREIBUNG', margin, 12, 'bold');
  currentY += 4;

  const rooms = [
    'Wohnzimmer', 'Schlafzimmer', 'Küche', 'Bad/WC', 
    'Flur', 'Balkon/Terrasse', 'Keller', 'Sonstiges'
  ];

  rooms.forEach(room => {
    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }
    
    addText(`${room}:`, margin, 10, 'bold');
    currentY += 2;
    addText('Zustand: ☐ einwandfrei  ☐ Mängel (siehe unten)');
    addText('Anmerkungen: _________________________________');
    currentY += 4;
  });

  // Zählerstände
  if (currentY > 230) {
    pdf.addPage();
    currentY = 20;
  }

  addText('ZÄHLERSTÄNDE', margin, 12, 'bold');
  currentY += 4;
  addText('Strom: ___________  Gas: ___________  Wasser: ___________');
  currentY += 8;

  // Schlüsselübergabe
  addText('SCHLÜSSELÜBERGABE', margin, 12, 'bold');
  currentY += 4;
  addText('Haustür: ___ Stück    Wohnungstür: ___ Stück    Keller: ___ Stück');
  addText('Briefkasten: ___ Stück    Sonstige: ________________________');
  currentY += 8;

  // Unterschriften
  addText('BESTÄTIGUNG', margin, 12, 'bold');
  currentY += 4;
  addText('Die Übergabe erfolgte ordnungsgemäß. Beide Parteien bestätigen den dokumentierten Zustand.');
  currentY += 12;

  addText('_____________________', margin);
  addText('Untervermieter', margin, 9);
  
  addText('_____________________', 130);
  addText('Untermieter', 130, 9);
}

// API-Endpoint Helper
export async function generateAndReturnPDF(formData, selectedAddons, returnType = 'blob') {
  try {
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
    console.error('PDF generation failed:', error);
    throw error;
  }
}
