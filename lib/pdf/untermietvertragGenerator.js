// lib/pdf/untermietvertragGenerator.js - MODULARE VERSION v2.0
// Separate PDFs für jeden Dokumenttyp + einfache Integration neuer Dokumente

import jsPDF from 'jspdf';

// ============================================
// HAUPT-VERTRAG (Untermietvertrag)
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

  // Helper-Funktionen - OHNE RETURN STATEMENTS
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

  const addLine = (length = 60, x = null) => {
    const startX = x || margin;
    const y = currentY - 1;
    pdf.line(startX, y, startX + length, y);
  };

  const addFieldWithLine = (label, lineLength = 60, spacing = 3) => {
    const labelWidth = pdf.getTextWidth(label);
    pdf.text(label, margin, currentY);
    addLine(lineLength, margin + labelWidth + spacing);
    currentY += lineHeight;
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
    addSection('ZWISCHEN');
    
    // Untervermieter
    addText('Untervermieter (Hauptmieter):', margin, 12, 'bold');
    currentY += 4;

    const landlordName = displayValue(formData.landlord_name);
    if (landlordName) {
      addText(`Name: ${landlordName}`);
    } else {
      addFieldWithLine('Name: ', 100);
    }

    const landlordStreet = displayValue(formData.landlord_address || formData.landlord_street);
    if (landlordStreet) {
      addText(`Straße und Hausnummer: ${landlordStreet}`);
    } else {
      addFieldWithLine('Straße und Hausnummer: ', 100);
    }

    const landlordPostal = displayValue(formData.landlord_postal);
    const landlordCity = displayValue(formData.landlord_city);
    if (landlordPostal && landlordCity) {
      addText(`PLZ und Ort: ${landlordPostal} ${landlordCity}`);
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
    if (tenantStreet) {
      addText(`Straße und Hausnummer: ${tenantStreet}`);
    } else {
      addFieldWithLine('Straße und Hausnummer: ', 100);
    }

    const tenantPostal = displayValue(formData.tenant_postal);
    const tenantCity = displayValue(formData.tenant_city);
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
    addSection('§ 1 Vertragsgegenstand');
    addText('(1) Mietobjekt');
    addText('Der Untervermieter ist alleiniger Mieter der Wohnung:');
    currentY += 4;
    
    const propertyStreet = displayValue(formData.property_address || formData.property_street);
    if (propertyStreet) {
      addText(`Straße und Hausnummer: ${propertyStreet}`);
    } else {
      addFieldWithLine('Straße und Hausnummer: ', 100);
    }

    const propertyPostal = displayValue(formData.property_postal);
    const propertyCity = displayValue(formData.property_city);
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

    // Möblierung mit Checkboxen
    addText('(2) Die Wohnung wird überlassen:', margin, 11, 'normal');
    currentY += 4;

    const isFurnished = formData.furnished === 'yes' || formData.furnished === 'furnished';
    const isPartiallyFurnished = formData.furnished === 'partially';
    const isUnfurnished = formData.furnished === 'no' || formData.furnished === 'unfurnished';

    const checkY = currentY - 3;
    const boxSize = 3;
    
    pdf.rect(margin, checkY, boxSize, boxSize);
    if (isFurnished) pdf.text('✓', margin + 0.5, checkY + 2);
    pdf.text('möbliert', margin + boxSize + 2, currentY);
    
    pdf.rect(margin + 35, checkY, boxSize, boxSize);
    if (isPartiallyFurnished) pdf.text('✓', margin + 35 + 0.5, checkY + 2);
    pdf.text('teilmöbliert', margin + 35 + boxSize + 2, currentY);
    
    pdf.rect(margin + 80, checkY, boxSize, boxSize);
    if (isUnfurnished) pdf.text('✓', margin + 80 + 0.5, checkY + 2);
    pdf.text('nicht möbliert', margin + 80 + boxSize + 2, currentY);
    
    currentY += lineHeight + 6;

    addText('(3) Dem Untermieter ist bekannt, dass der Untervermieter selbst Mieter ist und er gegenüber dem');
    addText('Eigentümer der Wohnung keinen Kündigungsschutz genießt.');

    // § 2 Mietzeit
    checkPageBreak();
    addSection('§ 2 Mietzeit');
    
    const startDate = formatDate(formData.start_date);
    const endDate = formatDate(formData.end_date);
    
    addText('(1) Das Mietverhältnis beginnt am ', margin, 11, 'normal');
    currentY -= lineHeight;
    
    if (startDate) {
      pdf.text(startDate, margin + 72, currentY);
    } else {
      const lineY = currentY - 1;
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
    addSection('§ 3 Miete und Nebenkosten');
    
    const rentAmount = displayValue(formData.rent_amount);
    
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

    const deposit = displayValue(formData.deposit);
    if (deposit) {
      addText(`(2) Der Untermieter zahlt eine Kaution in Höhe von ${deposit} EUR.`);
    } else {
      addText('(2) Der Untermieter zahlt eine Kaution in Höhe von ', margin);
      currentY -= lineHeight;
      const lineY = currentY - 1;
      pdf.line(margin + 115, lineY, margin + 145, lineY);
      pdf.text(' EUR.', margin + 147, currentY);
      currentY += lineHeight;
    }

    // Weitere Paragraphen (kompakt)
    pdf.addPage();
    currentY = margin;

    addSection('§ 4 Nutzung und Instandhaltung');
    addText('(1) Der Untermieter ist verpflichtet, die Mieträume pfleglich zu behandeln und nur zu Wohnzwecken zu nutzen.');
    addText('(2) Schönheitsreparaturen gehen zu Lasten des Untermieters, soweit sie durch normalen Gebrauch erforderlich werden.');
    addText('(3) Der Untermieter haftet für alle Schäden, die durch ihn oder seine Besucher verursacht werden.');

    addSection('§ 5 Beendigung des Mietverhältnisses');
    addText('(1) Bei Beendigung des Mietverhältnisses ist die Wohnung besenrein und in ordnungsgemäßem Zustand zu übergeben.');
    addText('(2) Schlüssel sind vollständig zurückzugeben.');
    addText('(3) Die Kaution wird nach ordnungsgemäßer Übergabe und Abrechnung zurückgezahlt.');

    addSection('§ 6 Sonstiges');
    addText('(1) Mündliche Nebenabreden bestehen nicht.');
    addText('(2) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.');
    addText('(3) Gerichtsstand ist der Ort der Mietsache.');
    currentY += 12;

    // Unterschriftsbereich
    checkPageBreak(60);
    
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

    // Unterschriftsfelder
    const signatureY = currentY;
    pdf.line(margin, signatureY, margin + 70, signatureY);
    pdf.setFontSize(10);
    pdf.text('Untervermieter', margin, signatureY + 6);
    
    pdf.line(margin + 100, signatureY, margin + 170, signatureY);
    pdf.text('Untermieter', margin + 100, signatureY + 6);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, signatureY + 20);

    return pdf;

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('PDF konnte nicht generiert werden: ' + error.message);
  }
}

// ============================================
// ÜBERGABEPROTOKOLL (Separates PDF)
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

  const addLine = (length = 60, x = null) => {
    const startX = x || margin;
    const y = currentY - 1;
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
      addFieldWithLine('Mietobjekt: ', 120);
    }

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

    // Übergabedaten
    addText('Übergabedaten:', margin, 12, 'bold');
    currentY += 3;
    
    addFieldWithLine('Datum: ', 40);
    currentY -= lineHeight;
    addFieldWithLine('Uhrzeit: ', 40);
    currentY += lineHeight + 3;

    addText('Art der Übergabe:', margin, 11, 'normal');
    currentY += 2;
    
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

    const rooms = ['Wohnzimmer', 'Schlafzimmer', 'Küche', 'Bad/WC', 'Flur', 'Balkon/Terrasse', 'Keller', 'Sonstiges'];

    rooms.forEach(room => {
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
      
      addText(`${room}:`, margin, 10, 'bold');
      currentY += 2;
      
      const checkY = currentY - 3;
      
      pdf.text('Zustand:', margin, currentY);
      pdf.rect(margin + 25, checkY, boxSize, boxSize);
      pdf.text('einwandfrei', margin + 25 + boxSize + 2, currentY);
      pdf.rect(margin + 75, checkY, boxSize, boxSize);
      pdf.text('Mängel (siehe unten)', margin + 75 + boxSize + 2, currentY);
      
      currentY += lineHeight + 1;
      addFieldWithLine('Anmerkungen: ', 110);
      currentY += 4;
    });

    if (currentY > 230) {
      pdf.addPage();
      currentY = 20;
    }

    // Zählerstände
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
// VERTRAGSERLÄUTERUNGEN (Separates PDF)
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

    return pdf;

  } catch (error) {
    console.error('Contract Explanations PDF Generation Error:', error);
    throw new Error('Vertragserläuterungen PDF konnte nicht generiert werden: ' + error.message);
  }
}

// ============================================
// MODULARE API - MULTI-PDF GENERATOR
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
// LEGACY API (Rückwärtskompatibilität)
// ============================================

/**
 * Legacy-Funktion für bestehende Integration
 * Generiert ein einzelnes PDF mit allen gewählten Dokumenten
 */
export async function generateAndReturnPDF(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔍 Legacy PDF API ENTRY POINT');
    console.log('🔍 Received formData:', formData);
    console.log('🔍 Received selectedAddons:', selectedAddons);
    
    // Für Legacy-Kompatibilität: Generiere alle Dokumente und kombiniere sie
    const documents = generateAllDocuments(formData, selectedAddons);
    
    if (documents.length === 1) {
      // Nur Haupt-Vertrag
      const pdf = documents[0].pdf;
      console.log('🔍 Single PDF generated successfully');
      
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
    } else {
      // Mehrere Dokumente: Für Legacy-API kombinieren wir sie in ein PDF
      const combinedPDF = combinePDFs(documents);
      console.log('🔍 Combined PDF generated successfully');
      
      switch (returnType) {
        case 'blob':
          return combinedPDF.output('blob');
        case 'datauri':
          return combinedPDF.output('datauristring');
        case 'arraybuffer':
          return combinedPDF.output('arraybuffer');
        default:
          return combinedPDF.output('blob');
      }
    }
    
  } catch (error) {
    console.error('🔍 Legacy PDF generation failed:', error);
    throw error;
  }
}

/**
 * Kombiniert mehrere PDF-Objekte zu einem einzigen PDF
 * (Vereinfacht - für Produktionsumgebung sollte eine bessere PDF-Merge-Lösung verwendet werden)
 */
function combinePDFs(documents) {
  // Für jetzt: Nehme das erste PDF und füge die anderen als neue Seiten hinzu
  // In Zukunft: Verwende eine echte PDF-Merge-Library
  
  const mainPDF = documents[0].pdf;
  
  // Füge eine Trennseite zwischen Dokumenten hinzu
  documents.slice(1).forEach((doc, index) => {
    mainPDF.addPage();
    
    // Trennseite
    mainPDF.setFontSize(16);
    mainPDF.setFont('helvetica', 'bold');
    mainPDF.text(`${doc.name}`, 20, 30);
    
    mainPDF.setFontSize(8);
    mainPDF.setFont('helvetica', 'italic');
    mainPDF.text('Separates Dokument - siehe nächste Seite', 20, 40);
    
    // Hinweis: Hier würde man normalerweise die Seiten des anderen PDFs importieren
    // Für diese Demo fügen wir einen Placeholder hinzu
    mainPDF.addPage();
    mainPDF.setFontSize(12);
    mainPDF.setFont('helvetica', 'normal');
    mainPDF.text(`[${doc.name} würde hier als separates PDF generiert]`, 20, 50);
    mainPDF.text('In der neuen modularen Version werden separate PDFs erstellt.', 20, 60);
  });
  
  return mainPDF;
}

// ============================================
// NEUE MODULARE API (Empfohlen für neue Integration)
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
