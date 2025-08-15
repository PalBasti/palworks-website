// lib/pdf/untermietvertragGenerator.js - LÜCKEN VERSION
// Ersetzt Klammer-Platzhalter durch ausfüllbare Lücken und Checkboxen

import jsPDF from 'jspdf';

export function generateUntermietvertragPDF(formData, selectedAddons = []) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  }

// ✅ NEU: Vertragserläuterungen-Funktion
function generateContractExplanations(pdf, formData) {
  pdf.addPage();
  let currentY = 20;
  const margin = 20;
  const lineHeight = 6;

  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    pdf.text(lines, x, currentY);
    currentY += lines.length * lineHeight;
    return currentY;
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

  // Header
  addText('VERTRAGSERLÄUTERUNGEN', margin, 16, 'bold');
  addText('Erklärungen zum Untermietvertrag', margin, 12, 'italic');
  currentY += 12;

  // § 1 Erläuterungen
  addSection('§ 1 Vertragsgegenstand - Erläuterungen');
  addText('Ein Untermietvertrag liegt vor, wenn der Hauptmieter (Untervermieter) die von ihm gemietete');
  addText('Wohnung ganz oder teilweise an einen Dritten (Untermieter) weitervermietet.');
  currentY += 4;

  addText('Wichtige Hinweise:');
  addText('• Der Untervermieter benötigt grundsätzlich die Erlaubnis des Vermieters');
  addText('• Der Untermieter hat keinen direkten Anspruch gegen den Eigentümer');
  addText('• Bei Kündigung des Hauptmietverhältnisses endet auch die Untermiete');
  currentY += 4;

  addText('Möblierung: Bei möblierter Vermietung muss ein Inventarverzeichnis erstellt werden.');
  addText('Der Zustand der Möbel sollte bei Ein- und Auszug dokumentiert werden.');

  checkPageBreak();
  addSection('§ 2 Mietzeit - Erläuterungen');
  addText('Befristete Untermiete: Ein befristeter Untermietvertrag endet automatisch zum vereinbarten');
  addText('Zeitpunkt, ohne dass eine Kündigung erforderlich ist.');
  currentY += 4;

  addText('Unbefristete Untermiete: Bei unbefristeten Verträgen gelten die gesetzlichen');
  addText('Kündigungsfristen (3 Monate zum Monatsende für Wohnraum).');
  currentY += 4;

  addText('Besonderheit: Der Untervermieter kann das Untermietverhältnis auch dann kündigen,');
  addText('wenn er die Räume für sich oder seine Familienangehörigen benötigt.');

  checkPageBreak();
  addSection('§ 3 Miete und Nebenkosten - Erläuterungen');
  addText('Mietpreisgestaltung: Die Untermiete darf grundsätzlich höher sein als die Hauptmiete,');
  addText('jedoch sind bei möblierter Vermietung und Nebenkosten bestimmte Grenzen zu beachten.');
  currentY += 4;

  addText('Nebenkosten: Diese sollten konkret aufgelistet werden. Eine pauschale Abrechnung');
  addText('ist möglich, bei Nachzahlungen muss der Untermieter aber informiert werden.');
  currentY += 4;

  addText('Kaution: Die Höhe ist gesetzlich nicht begrenzt, üblich sind 1-3 Monatsmieten.');
  addText('Die Kaution muss getrennt vom Vermögen des Untervermieters angelegt werden.');

  checkPageBreak();
  addSection('§ 4 Rechte und Pflichten - Erläuterungen');
  addText('Untermieter-Rechte:');
  addText('• Ungestörte Nutzung der vermieteten Räume');
  addText('• Anspruch auf ordnungsgemäße Instandhaltung');
  addText('• Schutz vor willkürlicher Kündigung');
  currentY += 4;

  addText('Untermieter-Pflichten:');
  addText('• Pflegliche Behandlung der Mietsache');
  addText('• Pünktliche Mietzahlung');
  addText('• Rücksichtnahme auf andere Hausbewohner');
  addText('• Information bei Schäden oder Mängeln');

  checkPageBreak();
  addSection('§ 5 Beendigung des Mietverhältnisses - Erläuterungen');
  addText('Ordentliche Kündigung: Beide Parteien können mit einer Frist von 3 Monaten');
  addText('zum Ende eines Kalendermonats kündigen.');
  currentY += 4;

  addText('Außerordentliche Kündigung: Bei erheblichen Pflichtverletzungen (z.B. Mietrückstand');
  addText('von mehr als 2 Monatsmieten) ist eine fristlose Kündigung möglich.');
  currentY += 4;

  addText('Wohnungsübergabe: Bei Beendigung muss die Wohnung besenrein und im');
  addText('vertragsgemäßen Zustand zurückgegeben werden.');

  checkPageBreak();
  addSection('Rechtliche Hinweise');
  addText('Widerrufsrecht: Bei Verträgen, die außerhalb von Geschäftsräumen oder im');
  addText('Fernabsatz geschlossen werden, besteht ein 14-tägiges Widerrufsrecht.');
  currentY += 4;

  addText('Gewährleistung: Für Mängel der Mietsache haftet primär der Untervermieter.');
  addText('Bei versteckten Mängeln kann auch der Eigentümer in Anspruch genommen werden.');
  currentY += 4;

  addText('Mieterschutz: Auch Untermieter genießen Kündigungsschutz nach dem BGB.');
  addText('Missbräuchliche Kündigungen sind unwirksam.');

  // Footer
  currentY += 15;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Diese Erläuterungen dienen nur der Information und ersetzen keine Rechtsberatung.', margin, currentY);
  pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, currentY + 5);
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

  // Lücken-Funktionen - KORRIGIERT
  const addLine = (length = 60, x = null) => {
    const startX = x || margin;
    const y = currentY - 1; // Linie näher zum Text
    pdf.line(startX, y, startX + length, y);
  };

  const addFieldWithLine = (label, lineLength = 60, spacing = 3) => {
    const labelWidth = pdf.getTextWidth(label);
    pdf.text(label, margin, currentY); // Text schreiben
    addLine(lineLength, margin + labelWidth + spacing); // Linie auf gleicher Höhe
    currentY += lineHeight; // Zur nächsten Zeile
  };

  const addCheckbox = (label, checked = false) => {
    const boxSize = 3;
    const y = currentY - 3;
    
    // Checkbox zeichnen
    pdf.rect(margin, y, boxSize, boxSize);
    if (checked) {
      pdf.text('✓', margin + 0.5, y + 2);
    }
    
    // Label
    pdf.text(label, margin + boxSize + 2, currentY);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch {
      return dateString;
    }
  };

  const displayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && (value.trim() === '' || value.trim() === 'undefined')) return '';
    return value.toString().trim();
  };

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
    
    // Untervermieter (Hauptmieter)
    addText('Untervermieter (Hauptmieter):', margin, 12, 'bold');
    currentY += 4;

    // Name mit Lücke oder Wert
    const landlordName = displayValue(formData.landlord_name);
    if (landlordName) {
      addText(`Name: ${landlordName}`);
    } else {
      addFieldWithLine('Name: ', 100);
    }

    // Anschrift mit Lücken
    const landlordStreet = displayValue(formData.landlord_address || formData.landlord_street);
    const landlordPostal = displayValue(formData.landlord_postal);
    const landlordCity = displayValue(formData.landlord_city);

    if (landlordStreet) {
      addText(`Straße und Hausnummer: ${landlordStreet}`);
    } else {
      addFieldWithLine('Straße und Hausnummer: ', 100);
    }

    if (landlordPostal && landlordCity) {
      addText(`PLZ und Ort: ${landlordPostal} ${landlordCity}`);
    } else {
      // Separate Lücken für PLZ und Ort
      const postalText = 'PLZ und Ort: ';
      const postalWidth = pdf.getTextWidth(postalText);
      addText(postalText, margin, 11, 'normal');
      currentY -= lineHeight;
      
      // PLZ Lücke (kurz)
      addLine(25, margin + postalWidth);
      
      // Ort Lücke (länger)
      addLine(60, margin + postalWidth + 30);
      currentY += lineHeight;
    }

    currentY += 8;

    addText('UND', margin, 12, 'bold');
    currentY += 6;

    // Untermieter
    addText('Untermieter:', margin, 12, 'bold');
    currentY += 4;

    const tenantName = displayValue(formData.tenant_name);
    if (tenantName) {
      addText(`Name: ${tenantName}`);
    } else {
      addFieldWithLine('Name: ', 100);
    }

    const tenantStreet = displayValue(formData.tenant_address || formData.tenant_street);
    const tenantPostal = displayValue(formData.tenant_postal);
    const tenantCity = displayValue(formData.tenant_city);

    if (tenantStreet) {
      addText(`Straße und Hausnummer: ${tenantStreet}`);
    } else {
      addFieldWithLine('Straße und Hausnummer: ', 100);
    }

    if (tenantPostal && tenantCity) {
      addText(`PLZ und Ort: ${tenantPostal} ${tenantCity}`);
    } else {
      const postalText = 'PLZ und Ort: ';
      const postalWidth = pdf.getTextWidth(postalText);
      addText(postalText, margin, 11, 'normal');
      currentY -= lineHeight;
      addLine(25, margin + postalWidth);
      addLine(60, margin + postalWidth + 30);
      currentY += lineHeight;
    }

    currentY += 8;

    addText('wird folgender Untermietvertrag geschlossen:', margin, 12, 'bold');
    currentY += 10;

    // § 1 Vertragsgegenstand
    checkPageBreak();
    addSection('§ 1 Vertragsgegenstand', '');
    
    addText('(1) Mietobjekt');
    addText('Der Untervermieter ist alleiniger Mieter der Wohnung:');
    currentY += 4;
    
    // Objektadresse mit Lücken
    const propertyStreet = displayValue(formData.property_address || formData.property_street);
    const propertyPostal = displayValue(formData.property_postal);
    const propertyCity = displayValue(formData.property_city);

    if (propertyStreet) {
      addText(`Straße und Hausnummer: ${propertyStreet}`);
    } else {
      addFieldWithLine('Straße und Hausnummer: ', 100);
    }

    if (propertyPostal && propertyCity) {
      addText(`PLZ und Ort: ${propertyPostal} ${propertyCity}`);
    } else {
      const postalText = 'PLZ und Ort: ';
      const postalWidth = pdf.getTextWidth(postalText);
      addText(postalText, margin, 11, 'normal');
      currentY -= lineHeight;
      addLine(25, margin + postalWidth);
      addLine(60, margin + postalWidth + 30);
      currentY += lineHeight;
    }

    // Zusätzliche Objektdaten
    const propertyFloor = displayValue(formData.property_floor);
    if (propertyFloor) {
      addText(`Geschoss: ${propertyFloor}`);
    } else {
      addFieldWithLine('Geschoss: ', 30);
    }

    const propertySqm = displayValue(formData.property_sqm);
    if (propertySqm) {
      addText(`Wohnfläche: ca. ${propertySqm} m²`);
    } else {
      addFieldWithLine('Wohnfläche: ca. ', 30);
      currentY -= lineHeight;
      pdf.text(' m²', margin + 60, currentY);
      currentY += lineHeight;
    }

    currentY += 6;

    // Möblierung mit Checkboxen - KORRIGIERT
    addText('(2) Die Wohnung wird überlassen:', margin, 11, 'normal');
    currentY += 4;

    const isFurnished = formData.furnished === 'yes' || formData.furnished === 'furnished';
    const isPartiallyFurnished = formData.furnished === 'partially';
    const isUnfurnished = formData.furnished === 'no' || formData.furnished === 'unfurnished';

    // Checkboxen richtig positioniert
    const checkY = currentY - 3;
    const boxSize = 3;
    
    // Checkbox 1: möbliert
    pdf.rect(margin, checkY, boxSize, boxSize);
    if (isFurnished) pdf.text('✓', margin + 0.5, checkY + 2);
    pdf.text('möbliert', margin + boxSize + 2, currentY);
    
    // Checkbox 2: teilmöbliert  
    pdf.rect(margin + 35, checkY, boxSize, boxSize);
    if (isPartiallyFurnished) pdf.text('✓', margin + 35 + 0.5, checkY + 2);
    pdf.text('teilmöbliert', margin + 35 + boxSize + 2, currentY);
    
    // Checkbox 3: nicht möbliert
    pdf.rect(margin + 80, checkY, boxSize, boxSize);
    if (isUnfurnished) pdf.text('✓', margin + 80 + 0.5, checkY + 2);
    pdf.text('nicht möbliert', margin + 80 + boxSize + 2, currentY);
    
    currentY += lineHeight + 2;

    currentY += 4;

    addText('(3) Dem Untermieter ist bekannt, dass der Untervermieter selbst Mieter ist und er gegenüber dem');
    addText('Eigentümer der Wohnung keinen Kündigungsschutz genießt.');

    // § 2 Mietzeit
    checkPageBreak();
    addSection('§ 2 Mietzeit', '');
    
    // Mietzeit mit Lücken oder Werten
    const startDate = formatDate(formData.start_date);
    const endDate = formatDate(formData.end_date);
    
    // Mietzeit mit korrigierter Formatierung
    addText('(1) Das Mietverhältnis beginnt am ', margin, 11, 'normal');
    currentY -= lineHeight;
    
    if (startDate) {
      pdf.text(startDate, margin + 72, currentY);
    } else {
      const lineY = currentY - 1; // Linie näher zum Text
      pdf.line(margin + 72, lineY, margin + 97, lineY);
    }
    
    pdf.text(' und', margin + 100, currentY);
    currentY += lineHeight;

    if (endDate && formData.contract_type === 'fixed_term') {
      addText(`endet am ${endDate}.`, margin);
    } else if (formData.contract_type === 'fixed_term') {
      addText('endet am ', margin, 11, 'normal');
      currentY -= lineHeight;
      const lineY = currentY - 1;
      pdf.line(margin + 20, lineY, margin + 45, lineY);
      pdf.text('.', margin + 48, currentY);
      currentY += lineHeight;
    } else {
      addText('läuft auf unbestimmte Zeit. Es kann von beiden Seiten mit einer Frist von drei Monaten zum Ende');
      addText('eines Kalendermonats gekündigt werden.');
    }

    currentY += 4;

    addText('(2) Setzt der Untermieter nach Ablauf der Mietzeit den Gebrauch der Mietsache fort, so findet eine');
    addText('Verlängerung des Mietverhältnisses nach § 545 BGB nicht statt.');

    // § 3 Miete und Nebenkosten
    checkPageBreak();
    addSection('§ 3 Miete und Nebenkosten', '');
    
    // Miete mit Lücke oder Wert
    const rentAmount = displayValue(formData.rent_amount);
    
    // Miete mit korrigierter Linie
    addText('(1) Die Monatsmiete beträgt ', margin, 11, 'normal');
    currentY -= lineHeight;
    
    if (rentAmount) {
      pdf.text(`${rentAmount} EUR`, margin + 60, currentY);
    } else {
      const lineY = currentY - 1;
      pdf.line(margin + 60, lineY, margin + 90, lineY);
      pdf.text(' EUR', margin + 92, currentY);
    }
    currentY += lineHeight;
    
    addText('und ist monatlich im Voraus bis zum 3. Werktag eines Monats an den Untervermieter zu zahlen.');
    currentY += 4;

    // Nebenkosten falls angegeben
    const additionalCosts = displayValue(formData.additional_costs);
    const heatingCosts = displayValue(formData.heating_costs);
    const otherCosts = displayValue(formData.other_costs);

    if (additionalCosts || heatingCosts || otherCosts) {
      if (heatingCosts) {
        addText(`(2) Daneben wird eine Pauschale für Heizung und Warmwasser von monatlich ${heatingCosts} EUR geschuldet.`);
      } else {
        addText('(2) Daneben wird eine Pauschale für Heizung und Warmwasser von monatlich ', margin);
        currentY -= lineHeight;
        const lineY = currentY - 1;
        pdf.line(margin + 150, lineY, margin + 180, lineY);
        pdf.text(' EUR geschuldet.', margin + 182, currentY);
        currentY += lineHeight;
      }
      currentY += 2;
    }

    // Kaution
    const deposit = displayValue(formData.deposit);
    if (deposit) {
      addText(`(3) Der Untermieter zahlt eine Kaution in Höhe von ${deposit} EUR.`);
    } else {
      addText('(3) Der Untermieter zahlt eine Kaution in Höhe von ', margin);
      currentY -= lineHeight;
      const lineY = currentY - 1;
      pdf.line(margin + 115, lineY, margin + 145, lineY);
      pdf.text(' EUR.', margin + 147, currentY);
      currentY += lineHeight;
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
    currentY += 12;

    // Unterschriftsbereich
    checkPageBreak(60);
    
    // Ort und Datum mit Lücken
    const contractCity = displayValue(formData.property_city || formData.contract_city);
    const contractDate = formatDate(formData.contract_date || new Date().toISOString().slice(0,10));
    
    if (contractCity && contractDate) {
      addText(`Ort, Datum: ${contractCity}, den ${contractDate}`);
    } else {
      addText('Ort, Datum: ', margin, 11, 'normal');
      currentY -= lineHeight;
      
      if (contractCity) {
        pdf.text(contractCity, margin + 28, currentY);
        pdf.text(', den ', margin + 28 + pdf.getTextWidth(contractCity), currentY);
        const lineY = currentY - 1;
        pdf.line(margin + 28 + pdf.getTextWidth(contractCity) + 12, lineY, margin + 28 + pdf.getTextWidth(contractCity) + 42, lineY);
      } else {
        const lineY = currentY - 1;
        pdf.line(margin + 28, lineY, margin + 68, lineY);
        pdf.text(', den ', margin + 70, currentY);
        pdf.line(margin + 82, lineY, margin + 112, lineY);
      }
      currentY += lineHeight;
    }

    currentY += 20;

    // Unterschriftsfelder mit großzügigen Linien
    const signatureY = currentY;
    
    // Linie für Untervermieter (links)
    pdf.line(margin, signatureY, margin + 70, signatureY);
    pdf.setFontSize(10);
    pdf.text('Untervermieter', margin, signatureY + 6);
    
    // Linie für Untermieter (rechts)  
    pdf.line(margin + 100, signatureY, margin + 170, signatureY);
    pdf.text('Untermieter', margin + 100, signatureY + 6);
    
    currentY = signatureY + 20;

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, currentY);

    // Übergabeprotokoll falls ausgewählt
    if (selectedAddons && Array.isArray(selectedAddons) && 
        (selectedAddons.includes('protocol') || 
         selectedAddons.includes('handover_protocol') ||
         selectedAddons.some(addon => 
           (typeof addon === 'object' && (addon.id === 'handover_protocol' || addon.name === 'Übergabeprotokoll')) ||
           (typeof addon === 'string' && addon.includes('protocol'))
         ))) {
      generateHandoverProtocol(pdf, formData);
    }

    // ✅ NEU: Vertragserläuterungen hinzufügen
    if (selectedAddons && Array.isArray(selectedAddons) && 
        (selectedAddons.includes('explanation') || 
         selectedAddons.includes('explanations') ||
         selectedAddons.some(addon => 
           (typeof addon === 'object' && (addon.id === 'explanation' || addon.name === 'Vertragserläuterungen')) ||
           (typeof addon === 'string' && addon.includes('explanation'))
         ))) {
      generateContractExplanations(pdf, formData);
    }

    return pdf;

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('PDF konnte nicht generiert werden: ' + error.message);
  }
}

// Übergabeprotokoll mit Lücken
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

  // Lücke-Funktion für Protokoll - KORRIGIERT
  const addLine = (length = 60, x = null) => {
    const startX = x || margin;
    const y = currentY - 1; // Näher zum Text
    pdf.line(startX, y, startX + length, y);
  };

  const addFieldWithLine = (label, lineLength = 60) => {
    const labelWidth = pdf.getTextWidth(label);
    pdf.text(label, margin, currentY);
    addLine(lineLength, margin + labelWidth + 3);
    currentY += lineHeight;
  };

  const displayValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && (value.trim() === '' || value.trim() === 'undefined')) return '';
    return value.toString().trim();
  };

  // Header Übergabeprotokoll
  addText('ÜBERGABEPROTOKOLL', margin, 16, 'bold');
  addText('zur Wohnungsübergabe', margin, 11, 'italic');
  currentY += 8;

  // Vertragsdaten
  addText('Vertragsbezug:', margin, 12, 'bold');
  currentY += 3;
  
  // Mietobjekt
  const propertyStreet = displayValue(formData.property_address || formData.property_street);
  const propertyPostal = displayValue(formData.property_postal);
  const propertyCity = displayValue(formData.property_city);
  
  if (propertyStreet && propertyPostal && propertyCity) {
    addText(`Mietobjekt: ${propertyStreet}, ${propertyPostal} ${propertyCity}`);
  } else {
    addFieldWithLine('Mietobjekt: ', 120);
  }

  // Namen
  const landlordName = displayValue(formData.landlord_name);
  const tenantName = displayValue(formData.tenant_name);
  
  if (landlordName) {
    addText(`Untervermieter: ${landlordName}`);
  } else {
    addFieldWithLine('Untervermieter: ', 100);
  }

  if (tenantName) {
    addText(`Untermieter: ${tenantName}`);
  } else {
    addFieldWithLine('Untermieter: ', 100);
  }

  currentY += 8;

  // Übergabedaten mit Lücken
  addText('Übergabedaten:', margin, 12, 'bold');
  currentY += 3;
  
  addFieldWithLine('Datum: ', 40);
  currentY -= lineHeight;
  addFieldWithLine('Uhrzeit: ', 40);
  currentY += lineHeight + 3;

  addText('Art der Übergabe:', margin, 11, 'normal');
  currentY += 2;
  
  // Checkboxen für Übergabe-Art
  const checkY = currentY - 3;
  const boxSize = 3;
  
  pdf.rect(margin + 5, checkY, boxSize, boxSize);
  pdf.text('Einzug', margin + 5 + boxSize + 2, currentY);
  
  pdf.rect(margin + 50, checkY, boxSize, boxSize);
  pdf.text('Auszug', margin + 50 + boxSize + 2, currentY);
  
  currentY += lineHeight + 6;

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
    
    // Checkboxen für Zustand
    const checkY = currentY - 3;
    const boxSize = 3;
    
    pdf.text('Zustand:', margin, currentY);
    pdf.rect(margin + 25, checkY, boxSize, boxSize);
    pdf.text('einwandfrei', margin + 25 + boxSize + 2, currentY);
    pdf.rect(margin + 75, checkY, boxSize, boxSize);
    pdf.text('Mängel (siehe unten)', margin + 75 + boxSize + 2, currentY);
    
    currentY += lineHeight + 1;
    addFieldWithLine('Anmerkungen: ', 110);
    currentY += 4;
  });

  // Neue Seite falls nötig
  if (currentY > 230) {
    pdf.addPage();
    currentY = 20;
  }

  // Zählerstände
  // Zählerstände mit korrigierten Linien
  addText('ZÄHLERSTÄNDE', margin, 12, 'bold');
  currentY += 4;
  
  const countersY = currentY - 1;
  pdf.text('Strom: ', margin, currentY);
  pdf.line(margin + 15, countersY, margin + 40, countersY);
  
  pdf.text('Gas: ', margin + 50, currentY);
  pdf.line(margin + 65, countersY, margin + 90, countersY);
  
  pdf.text('Wasser: ', margin + 100, currentY);
  pdf.line(margin + 125, countersY, margin + 150, countersY);
  currentY += lineHeight + 8;

  // Schlüsselübergabe
  // Schlüsselübergabe mit korrigierten Linien
  addText('SCHLÜSSELÜBERGABE', margin, 12, 'bold');
  currentY += 4;
  
  const keysY = currentY - 1;
  pdf.text('Haustür: ', margin, currentY);
  pdf.line(margin + 20, keysY, margin + 35, keysY);
  pdf.text(' Stück', margin + 37, currentY);
  
  pdf.text('Wohnungstür: ', margin + 65, currentY);
  pdf.line(margin + 100, keysY, margin + 115, keysY);
  pdf.text(' Stück', margin + 117, currentY);
  currentY += lineHeight + 2;
  
  const keys2Y = currentY - 1;
  pdf.text('Keller: ', margin, currentY);
  pdf.line(margin + 20, keys2Y, margin + 35, keys2Y);
  pdf.text(' Stück', margin + 37, currentY);
  
  pdf.text('Briefkasten: ', margin + 65, currentY);
  pdf.line(margin + 100, keys2Y, margin + 115, keys2Y);
  pdf.text(' Stück', margin + 117, currentY);
  currentY += lineHeight + 2;
  
  addFieldWithLine('Sonstige: ', 100);
  currentY += 8;

  // Bestätigung
  addText('BESTÄTIGUNG', margin, 12, 'bold');
  currentY += 4;
  addText('Die Übergabe erfolgte ordnungsgemäß. Beide Parteien bestätigen den dokumentierten Zustand.');
  currentY += 15;

  // Unterschriftslinien für Protokoll
  const signatureY = currentY;
  
  // Untervermieter links
  pdf.line(margin, signatureY, margin + 70, signatureY);
  pdf.setFontSize(9);
  addFieldWithLine('Datum: ', 25);
  currentY = signatureY + 8;
  pdf.text('Untervermieter', margin, currentY);
  
  // Untermieter rechts
  pdf.line(120, signatureY, 190, signatureY);
  pdf.line(120, signatureY + 8, 145, signatureY + 8);
  pdf.text('Datum: ', 120, signatureY + 6);
  pdf.text('Untermieter', 120, signatureY + 16);
}

// Export-Funktionen
export async function generateAndReturnPDF(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔍 PDF API ENTRY POINT - Lücken Version');
    console.log('🔍 Received formData:', formData);
    console.log('🔍 Received selectedAddons:', selectedAddons);
    
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
