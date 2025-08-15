// lib/pdf/untermietvertragGenerator.js - FIXED VERSION
// Behebt: Blank fields, Unterschriftenzeile, bessere Formatierung

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
      return dateString; // Falls schon formatiert
    }
  };

  // FIXED: Bessere Behandlung von leeren Feldern
  const displayValue = (value, placeholder = '[EINTRAGEN]') => {
    if (!value) return placeholder;
    if (typeof value === 'string' && value.trim() === '') return placeholder;
    if (typeof value === 'string' && value.trim() === 'undefined') return placeholder;
    return value.toString().trim();
  };

  // FIXED: Intelligente Adressformatierung
  const formatAddress = (street, postal, city) => {
    const streetVal = displayValue(street);
    const postalVal = displayValue(postal);
    const cityVal = displayValue(city);
    
    if (streetVal === '[EINTRAGEN]' && postalVal === '[EINTRAGEN]' && cityVal === '[EINTRAGEN]') {
      return '[VOLLSTÄNDIGE ANSCHRIFT EINTRAGEN]';
    }
    
    const addressParts = [];
    if (streetVal !== '[EINTRAGEN]') addressParts.push(streetVal);
    if (postalVal !== '[EINTRAGEN]' && cityVal !== '[EINTRAGEN]') {
      addressParts.push(`${postalVal} ${cityVal}`);
    } else if (postalVal !== '[EINTRAGEN]' || cityVal !== '[EINTRAGEN]') {
      addressParts.push(`${postalVal} ${cityVal}`.trim());
    }
    
    return addressParts.length > 0 ? addressParts.join(', ') : '[VOLLSTÄNDIGE ANSCHRIFT EINTRAGEN]';
  };

  // FIXED: Neue Seite bei Bedarf
  const checkPageBreak = (requiredSpace = 30) => {
    if (currentY > pageHeight - requiredSpace) {
      pdf.addPage();
      currentY = margin;
    }
  };

  // PDF-Generierung starten
  try {
    // Header
    addText('UNTERMIETVERTRAG', margin, 18, 'bold');
    addText('für die Überlassung einer ganzen Wohnung', margin, 12, 'italic');
    currentY += 12;

    // Vertragsparteien
    addSection('ZWISCHEN', '');
    
    // Untervermieter (Hauptmieter) - FIXED
    addText('Untervermieter (Hauptmieter):', margin, 12, 'bold');
    currentY += 3;
    addText(`Name: ${displayValue(formData.landlord_name, '[NAME DES UNTERVERMIETERS]')}`);
    
    // FIXED: Bessere Adressformatierung für Untervermieter
    const landlordAddress = formatAddress(
      formData.landlord_address || formData.landlord_street,
      formData.landlord_postal,
      formData.landlord_city
    );
    addText(`Anschrift: ${landlordAddress}`);
    currentY += 6;

    addText('UND', margin, 12, 'bold');
    currentY += 6;

    // Untermieter - FIXED
    addText('Untermieter:', margin, 12, 'bold');
    currentY += 3;
    addText(`Name: ${displayValue(formData.tenant_name, '[NAME DES UNTERMIETERS]')}`);
    
    // FIXED: Bessere Adressformatierung für Untermieter
    const tenantAddress = formatAddress(
      formData.tenant_address || formData.tenant_street,
      formData.tenant_postal,
      formData.tenant_city
    );
    addText(`Anschrift: ${tenantAddress}`);
    currentY += 8;

    addText('wird folgender Untermietvertrag geschlossen:', margin, 12, 'bold');
    currentY += 10;

    // § 1 Vertragsgegenstand
    checkPageBreak();
    addSection('§ 1 Vertragsgegenstand', '');
    
    addText('(1) Mietobjekt');
    addText('Der Untervermieter ist alleiniger Mieter der Wohnung:');
    currentY += 3;
    
    // FIXED: Bessere Objektadresse
    const propertyAddress = formatAddress(
      formData.property_address || formData.property_street,
      formData.property_postal,
      formData.property_city
    );
    addText(`Straße und Hausnummer: ${displayValue(formData.property_address || formData.property_street, '[STRASSE UND HAUSNUMMER]')}`);
    addText(`PLZ und Ort: ${displayValue(formData.property_postal, '[PLZ]')} ${displayValue(formData.property_city, '[ORT]')}`);
    
    // Zusätzliche Objektdaten falls vorhanden
    if (formData.property_floor && formData.property_floor !== '') {
      addText(`Geschoss: ${formData.property_floor}`);
    }
    if (formData.property_number && formData.property_number !== '') {
      addText(`Wohnungsnummer: ${formData.property_number}`);
    }
    if (formData.property_sqm && formData.property_sqm !== '') {
      addText(`Wohnfläche: ca. ${formData.property_sqm} m²`);
    }
    currentY += 4;

    // FIXED: Möblierung Status
    const isFurnished = formData.furnished === 'yes' || formData.furnished === true;
    addText(`(2) Die Wohnung wird ${isFurnished ? 'möbliert' : 'nicht möbliert'} überlassen.`);
    currentY += 6;

    addText('(4) Dem Untermieter ist bekannt, dass der Untervermieter selbst Mieter ist und er gegenüber dem');
    addText('Eigentümer der Wohnung keinen Kündigungsschutz genießt.');

    // § 2 Mietzeit
    checkPageBreak();
    addSection('§ 2 Mietzeit', '');
    
    // FIXED: Intelligente Mietzeit-Behandlung
    const startDate = formatDate(formData.start_date);
    const endDate = formData.end_date ? formatDate(formData.end_date) : null;
    
    if (endDate && endDate !== '[DATUM EINTRAGEN]') {
      addText(`(1) Das Mietverhältnis beginnt am ${startDate} und`);
      addText(`endet am ${endDate}.`);
    } else {
      addText(`(1) Das Mietverhältnis beginnt am ${startDate} und`);
      addText('läuft auf unbestimmte Zeit. Es kann von beiden Seiten mit einer Frist von drei Monaten zum Ende');
      addText('eines Kalendermonats gekündigt werden.');
    }
    currentY += 4;

    addText('(2) Setzt der Untermieter nach Ablauf der Mietzeit den Gebrauch der Mietsache fort, so findet eine');
    addText('Verlängerung des Mietverhältnisses nach § 545 BGB nicht statt.');

    // § 3 Miete und Nebenkosten
    checkPageBreak();
    addSection('§ 3 Miete und Nebenkosten', '');
    
    // FIXED: Bessere Miete-Formatierung
    const rentAmount = displayValue(formData.rent_amount, '[BETRAG]');
    const currency = formData.currency || 'EUR';
    
    addText(`(1) Die Monatsmiete beträgt ${rentAmount} ${currency} und ist monatlich im Voraus bis zum 3. Werktag eines`);
    addText('Monats an den Untervermieter zu zahlen.');
    currentY += 4;

    // FIXED: Nebenkosten falls angegeben
    if (formData.additional_costs && formData.additional_costs !== '') {
      addText(`(2) Zusätzliche Kosten in Höhe von ${displayValue(formData.additional_costs)} ${currency} sind`);
      addText('für Nebenkosten zu entrichten.');
      currentY += 4;
    }

    // FIXED: Kaution falls angegeben
    if (formData.deposit && formData.deposit !== '') {
      addText(`(3) Der Untermieter zahlt eine Kaution in Höhe von ${displayValue(formData.deposit)} ${currency}.`);
      currentY += 4;
    }

    // Neue Seite für weitere Paragraphen
    pdf.addPage();
    currentY = margin;

    // § 4 Nutzung und Instandhaltung
    addSection('§ 4 Nutzung und Instandhaltung', '');
    
    addText('(1) Der Untermieter ist verpflichtet, die Mieträume pfleglich zu behandeln und nur zu Wohnzwecken');
    addText('zu nutzen.');
    currentY += 4;

    addText('(2) Schönheitsreparaturen gehen zu Lasten des Untermieters, soweit sie durch normalen Gebrauch');
    addText('erforderlich werden.');
    currentY += 4;

    addText('(3) Der Untermieter haftet für alle Schäden, die durch ihn oder seine Besucher verursacht werden.');

    // § 5 Beendigung des Mietverhältnisses
    addSection('§ 5 Beendigung des Mietverhältnisses', '');
    
    addText('(1) Bei Beendigung des Mietverhältnisses ist die Wohnung besenrein und in ordnungsgemäßem');
    addText('Zustand zu übergeben.');
    currentY += 4;

    addText('(2) Schlüssel sind vollständig zurückzugeben.');
    currentY += 4;

    addText('(3) Die Kaution wird nach ordnungsgemäßer Übergabe und Abrechnung zurückgezahlt.');

    // § 6 Sonstiges
    addSection('§ 6 Sonstiges', '');
    
    addText('(1) Mündliche Nebenabreden bestehen nicht.');
    currentY += 4;

    addText('(2) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen');
    addText('Bestimmungen unberührt.');
    currentY += 4;

    addText('(3) Gerichtsstand ist der Ort der Mietsache.');
    currentY += 10;

    // FIXED: Bessere Unterschriftszeile
    checkPageBreak(50);
    
    // Ort und Datum
    const contractCity = displayValue(formData.property_city || formData.contract_city, '[ORT]');
    const contractDate = formatDate(formData.contract_date || new Date().toISOString().slice(0,10));
    
    addText(`Ort, Datum: ${contractCity}, den ${contractDate}`);
    currentY += 15;

    // FIXED: Professionelle Unterschriftsfelder
    const signatureY = currentY;
    
    // Linie für Untervermieter
    pdf.line(margin, signatureY, margin + 60, signatureY);
    pdf.setFontSize(10);
    pdf.text('Untervermieter', margin, signatureY + 5);
    
    // Linie für Untermieter
    pdf.line(margin + 90, signatureY, margin + 150, signatureY);
    pdf.text('Untermieter', margin + 90, signatureY + 5);
    
    currentY = signatureY + 15;

    // Footer
    currentY += 10;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, currentY);

    // FIXED: Übergabeprotokoll falls ausgewählt
    if (selectedAddons && Array.isArray(selectedAddons) && 
        (selectedAddons.includes('protocol') || 
         selectedAddons.includes('handover_protocol') ||
         selectedAddons.some(addon => 
           (typeof addon === 'object' && (addon.id === 'handover_protocol' || addon.name === 'Übergabeprotokoll')) ||
           (typeof addon === 'string' && addon.includes('protocol'))
         ))) {
      console.log('🔍 PDF Generator - ADDING HANDOVER PROTOCOL');
      generateHandoverProtocol(pdf, formData);
    }

    return pdf;

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('PDF konnte nicht generiert werden: ' + error.message);
  }
}

// FIXED: Verbessertes Übergabeprotokoll
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

  const displayValue = (value, placeholder = '[EINTRAGEN]') => {
    if (!value) return placeholder;
    if (typeof value === 'string' && value.trim() === '') return placeholder;
    return value.toString().trim();
  };

  // Header Übergabeprotokoll
  addText('ÜBERGABEPROTOKOLL', margin, 16, 'bold');
  addText('zur Wohnungsübergabe', margin, 11, 'italic');
  currentY += 8;

  // FIXED: Vertragsdaten mit besserer Formatierung
  addText('Vertragsbezug:', margin, 12, 'bold');
  currentY += 2;
  
  const propertyAddr = `${displayValue(formData.property_address || formData.property_street)}, ${displayValue(formData.property_postal)} ${displayValue(formData.property_city)}`;
  addText(`Mietobjekt: ${propertyAddr}`);
  addText(`Untervermieter: ${displayValue(formData.landlord_name, '[NAME DES UNTERVERMIETERS]')}`);
  addText(`Untermieter: ${displayValue(formData.tenant_name, '[NAME DES UNTERMIETERS]')}`);
  currentY += 8;

  // Übergabedaten
  addText('Übergabedaten:', margin, 12, 'bold');
  currentY += 2;
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

  // FIXED: Bessere Unterschriften für Protokoll
  addText('BESTÄTIGUNG', margin, 12, 'bold');
  currentY += 4;
  addText('Die Übergabe erfolgte ordnungsgemäß. Beide Parteien bestätigen den dokumentierten Zustand.');
  currentY += 12;

  // Unterschriftslinien
  const signatureY = currentY;
  
  pdf.line(margin, signatureY, margin + 60, signatureY);
  pdf.setFontSize(9);
  pdf.text('Datum: ___________', margin, signatureY + 5);
  pdf.text('Untervermieter', margin, signatureY + 10);
  
  pdf.line(130, signatureY, 130 + 60, signatureY);
  pdf.text('Datum: ___________', 130, signatureY + 5);
  pdf.text('Untermieter', 130, signatureY + 10);
}

// Export-Funktionen für verschiedene Formate
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
