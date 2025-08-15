// lib/pdf/untermietvertragGenerator.js - LÜCKEN VERSION
// Ersetzt Klammer-Platzhalter durch ausfüllbare Lücken und Checkboxen

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

  // Lücken-Funktionen
  const addLine = (length = 60, x = null) => {
    const startX = x || margin;
    const y = currentY - 2;
    pdf.line(startX, y, startX + length, y);
  };

  const addFieldWithLine = (label, lineLength = 60, spacing = 3) => {
    const labelWidth = pdf.getTextWidth(label);
    addText(label, margin, 11, 'normal');
    currentY -= lineHeight; // Zurück auf gleiche Zeile
    addLine(lineLength, margin + labelWidth + spacing);
    currentY += lineHeight;
  };

  const addCheckbox = (label, checked = false) => {
    const boxSize = 3;
    const y = currentY - 2;
    
    // Checkbox zeichnen
    pdf.rect(margin, y - boxSize, boxSize, boxSize);
    if (checked) {
      pdf.text('✓', margin + 0.5, y + 0.5);
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

    // Möblierung mit Checkboxen
    addText('(2) Die Wohnung wird überlassen:', margin, 11, 'normal');
    currentY += 4;

    const isFurnished = formData.furnished === 'yes' || formData.furnished === 'furnished';
    const isPartiallyFurnished = formData.furnished === 'partially';
    const isUnfurnished = formData.furnished === 'no' || formData.furnished === 'unfurnished';

    // Checkboxen in einer Zeile
    addCheckbox('☐ möbliert', isFurnished);
    currentY -= lineHeight;
    addCheckbox('☐ teilmöbliert', isPartiallyFurnished);
    pdf.text('☐ teilmöbliert', margin + 35, currentY);
    addCheckbox('☐ nicht möbliert', isUnfurnished);
    pdf.text('☐ nicht möbliert', margin + 80, currentY);
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
    
    addText('(1) Das Mietverhältnis beginnt am ', margin, 11, 'normal');
    currentY -= lineHeight;
    
    if (startDate) {
      pdf.text(startDate, margin + 72, currentY);
    } else {
      addLine(25, margin + 72);
    }
    
    pdf.text(' und', margin + 100, currentY);
    currentY += lineHeight;

    if (endDate && formData.contract_type === 'fixed_term') {
      addText(`endet am ${endDate}.`, margin);
    } else if (formData.contract_type === 'fixed_term') {
      addText('endet am ', margin, 11, 'normal');
      currentY -= lineHeight;
      addLine(25, margin + 20);
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
    
    addText('(1) Die Monatsmiete beträgt ', margin, 11, 'normal');
    currentY -= lineHeight;
    
    if (rentAmount) {
      pdf.text(`${rentAmount} EUR`, margin + 60, currentY);
    } else {
      addLine(30, margin + 60);
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
        addLine(30, margin + 150);
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
      addLine(30, margin + 115);
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
        addLine(30, margin + 28 + pdf.getTextWidth(contractCity) + 12);
      } else {
        addLine(40, margin + 28);
        pdf.text(', den ', margin + 70, currentY);
        addLine(30, margin + 82);
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

  const addLine = (length = 60, x = null) => {
    const startX = x || margin;
    const y = currentY - 2;
    pdf.line(startX, y, startX + length, y);
  };

  const addFieldWithLine = (label, lineLength = 60) => {
    const labelWidth = pdf.getTextWidth(label);
    addText(label, margin, 11, 'normal');
    currentY -= lineHeight;
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
  pdf.text('☐ Einzug     ☐ Auszug', margin + 5, currentY);
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
    pdf.text('Zustand:  ☐ einwandfrei  ☐ Mängel (siehe unten)', margin, currentY);
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
  addText('ZÄHLERSTÄNDE', margin, 12, 'bold');
  currentY += 4;
  
  addText('Strom: ', margin, 11, 'normal');
  currentY -= lineHeight;
  addLine(25, margin + 15);
  
  pdf.text('Gas: ', margin + 50, currentY);
  addLine(25, margin + 65);
  
  pdf.text('Wasser: ', margin + 100, currentY);
  addLine(25, margin + 125);
  currentY += lineHeight + 8;

  // Schlüsselübergabe
  addText('SCHLÜSSELÜBERGABE', margin, 12, 'bold');
  currentY += 4;
  
  addText('Haustür: ', margin, 11, 'normal');
  currentY -= lineHeight;
  addLine(15, margin + 20);
  pdf.text(' Stück', margin + 37, currentY);
  
  pdf.text('Wohnungstür: ', margin + 65, currentY);
  addLine(15, margin + 100);
  pdf.text(' Stück', margin + 117, currentY);
  currentY += lineHeight + 2;
  
  addText('Keller: ', margin, 11, 'normal');
  currentY -= lineHeight;
  addLine(15, margin + 20);
  pdf.text(' Stück', margin + 37, currentY);
  
  pdf.text('Briefkasten: ', margin + 65, currentY);
  addLine(15, margin + 100);
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
