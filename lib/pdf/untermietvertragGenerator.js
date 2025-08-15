// lib/pdf/untermietvertragGenerator.js - SYNTAX FIXED VERSION
// Basiert auf funktionierender "Ausfüllbaren Lücken Version" + nur generateSeparateDocuments hinzugefügt

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

  const addLine = (length = 60, x = null) => {
    const startX = x || margin;
    const y = currentY - 2;
    pdf.line(startX, y, startX + length, y);
  };

  const addFieldWithLine = (label, lineLength = 60, spacing = 3) => {
    const labelWidth = pdf.getTextWidth(label);
    addText(label, margin, 11, 'normal');
    currentY -= lineHeight;
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
    addSection('ZWISCHEN', '');
    
    // Untervermieter (Hauptmieter)
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
    if (startDate) {
      addText(`(1) Das Mietverhältnis beginnt am ${startDate} und`);
    } else {
      addFieldWithLine('(1) Das Mietverhältnis beginnt am ', 50);
      currentY -= lineHeight;
      pdf.text(' und', margin + 147, currentY);
      currentY += lineHeight;
    }

    if (formData.contract_type === 'fixed_term') {
      const endDate = formatDate(formData.end_date);
      if (endDate) {
        addText(`endet am ${endDate}, ohne dass es einer Kündigung bedarf.`);
      } else {
        addFieldWithLine('endet am ', 50);
        currentY -= lineHeight;
        pdf.text(', ohne dass es einer Kündigung bedarf.', margin + 90, currentY);
        currentY += lineHeight;
      }
    } else {
      addText('läuft auf unbestimmte Zeit. Es kann von beiden Seiten mit einer Frist von drei Monaten');
      addText('zum Ende eines Kalendermonats gekündigt werden.');
    }

    // § 3 Miete und Nebenkosten
    checkPageBreak();
    addSection('§ 3 Miete und Nebenkosten');
    
    const rentAmount = displayValue(formData.rent_amount);
    if (rentAmount) {
      addText(`(1) Die Monatsmiete beträgt ${rentAmount} EUR und ist monatlich im Voraus bis zum`);
    } else {
      addFieldWithLine('(1) Die Monatsmiete beträgt ', 40);
      currentY -= lineHeight;
      pdf.text(' EUR und ist monatlich im Voraus bis zum', margin + 80, currentY);
      currentY += lineHeight;
    }
    addText('3. Werktag eines Monats an den Untervermieter zu zahlen.');

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

    // Unterschriftenbereich
    currentY += 15;
    addText(`Ort, Datum: _________________, den ${new Date().toLocaleDateString('de-DE')}`, margin, 11, 'normal');
    currentY += 20;

    // Unterschriftsfelder
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
// NEU: NUR generateSeparateDocuments HINZUFÜGEN
// ============================================

// Minimal separate PDFs für den Anfang
export function generateContractExplanationsPDF(formData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  let currentY = 20;

  try {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VERTRAGSERLÄUTERUNGEN', margin, currentY);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erklärungen zum Untermietvertrag', margin, currentY);
    currentY += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ein Untermietvertrag liegt vor, wenn der Hauptmieter die von ihm gemietete', margin, currentY);
    currentY += 6;
    pdf.text('Wohnung ganz oder teilweise an einen Dritten weitervermietet.', margin, currentY);
    currentY += 10;

    pdf.text('Wichtige Hinweise:', margin, currentY);
    currentY += 8;
    pdf.text('• Der Untervermieter benötigt grundsätzlich die Erlaubnis des Vermieters', margin, currentY);
    currentY += 6;
    pdf.text('• Der Untermieter hat keinen direkten Anspruch gegen den Eigentümer', margin, currentY);
    currentY += 6;
    pdf.text('• Bei Kündigung des Hauptmietverhältnisses endet auch die Untermiete', margin, currentY);

    return pdf;
  } catch (error) {
    console.error('Explanations PDF Generation Error:', error);
    throw new Error('Vertragserläuterungen PDF konnte nicht generiert werden: ' + error.message);
  }
}

export function generateHandoverProtocolPDF(formData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  let currentY = 20;

  try {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ÜBERGABEPROTOKOLL', margin, currentY);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    pdf.text('zur Wohnungsübergabe', margin, currentY);
    currentY += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Datum: ___________________', margin, currentY);
    currentY += 10;
    pdf.text('Anwesend:', margin, currentY);
    currentY += 8;
    pdf.text('Untervermieter: ___________________________', margin, currentY);
    currentY += 8;
    pdf.text('Untermieter: ___________________________', margin, currentY);

    return pdf;
  } catch (error) {
    console.error('Protocol PDF Generation Error:', error);
    throw new Error('Übergabeprotokoll PDF konnte nicht generiert werden: ' + error.message);
  }
}

// Hauptfunktion für separate Downloads
export function generateAllDocuments(formData, selectedAddons = []) {
  const documents = [];

  try {
    // 1. Haupt-Vertrag (immer)
    const mainContract = generateUntermietvertragPDF(formData, selectedAddons);
    documents.push({
      type: 'contract',
      name: 'Untermietvertrag',
      filename: 'Untermietvertrag.pdf',
      pdf: mainContract
    });

    // 2. Vertragserläuterungen (falls gewählt)
    if (selectedAddons.includes('explanation') || selectedAddons.includes('explanations')) {
      const explanationsPDF = generateContractExplanationsPDF(formData);
      documents.push({
        type: 'explanations',
        name: 'Vertragserläuterungen',
        filename: 'Vertragserklaerungen.pdf',
        pdf: explanationsPDF
      });
    }

    // 3. Übergabeprotokoll (falls gewählt)
    if (selectedAddons.includes('protocol') || selectedAddons.includes('handover_protocol')) {
      const protocolPDF = generateHandoverProtocolPDF(formData);
      documents.push({
        type: 'handover_protocol',
        name: 'Übergabeprotokoll',
        filename: 'Uebergabeprotokoll.pdf',
        pdf: protocolPDF
      });
    }

    return documents;

  } catch (error) {
    console.error('Multi-PDF Generation Error:', error);
    throw new Error('Dokumente konnten nicht generiert werden: ' + error.message);
  }
}

// Die wichtige neue Funktion!
export async function generateSeparateDocuments(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔍 Modern Multi-PDF API ENTRY POINT');
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
    
    console.log(`🔍 Generated ${results.length} separate documents successfully`);
    return results;
    
  } catch (error) {
    console.error('🔍 Multi-PDF generation failed:', error);
    throw error;
  }
}

// Bestehende API bleibt unverändert
export async function generateAndReturnPDF(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔍 PDF API ENTRY POINT');
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
    console.error('🔍 PDF generation failed:', error);
    throw error;
  }
}
