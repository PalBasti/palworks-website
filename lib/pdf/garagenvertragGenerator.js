// lib/pdf/garagenvertragGenerator.js - MIT jsPDF (analog zu untermietvertragGenerator.js)
import jsPDF from 'jspdf';

export function generateGaragenvertragPDF(formData, selectedAddons = []) {
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

  // Helper-Funktionen (identisch zu Untermietvertrag)
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

  // ✅ GARAGE-SPEZIFISCHE HELPER
  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';
  const contractTitle = `${garageType.toUpperCase()}MIETVERTRAG`;
  
  const getGarageAddress = () => {
    if (formData.garage_same_address) {
      return displayValue(formData.landlord_address);
    } else {
      const address = displayValue(formData.garage_address);
      const postal = displayValue(formData.garage_postal);
      const city = displayValue(formData.garage_city);
      return `${address}, ${postal} ${city}`;
    }
  };

  // PDF-Generierung starten
  try {
    // ✅ HEADER
    addText(contractTitle, margin, 16, 'bold');
    addText(`für die Miete einer ${garageType.toLowerCase()}`, margin, 11, 'italic');
    currentY += 10;

    // ✅ VERTRAGSPARTEIEN
    addSection('ZWISCHEN', '');
    
    // Vermieter
    addText('Vermieter:', margin, 11, 'bold');
    currentY += 2;
    addText(`Name: ${displayValue(formData.landlord_name)}`);
    addText(`Anschrift: ${displayValue(formData.landlord_address)}`);
    currentY += 4;

    addText('UND', margin, 11, 'bold');
    currentY += 4;

    // Mieter
    addText('Mieter:', margin, 11, 'bold');
    currentY += 2;
    addText(`Name: ${displayValue(formData.tenant_name)}`);
    addText(`Anschrift: ${displayValue(formData.tenant_address)}`);
    currentY += 4;

    addText(`wird folgender ${garageType}mietvertrag geschlossen:`, margin, 11, 'bold');
    currentY += 8;

    // ✅ § 1 MIETOBJEKT
    addSection('§ 1 Mietobjekt', '');
    
    addText(`Vermietet wird die ${garageType.toLowerCase()}:`);
    currentY += 2;
    addText(`Adresse: ${getGarageAddress()}`);
    
    if (formData.garage_number) {
      addText(`${garageType}-Nummer: ${formData.garage_number}`);
    }
    
    addText(`Anzahl Schlüssel/Toröffner: ${displayValue(formData.garage_keys, '1')} Stück`);
    currentY += 4;

    if (formData.garage_type === 'garage') {
      addText('Die Garage ist ausschließlich zum Abstellen von Kraftfahrzeugen bestimmt.');
      addText('Die Lagerung von Gegenständen ist nur im Rahmen der üblichen Garagennutzung gestattet.');
    } else {
      addText('Der Stellplatz ist ausschließlich zum Parken von Kraftfahrzeugen bestimmt.');
    }

    // ✅ § 2 MIETZEIT
    addSection('§ 2 Mietzeit', '');
    
    if (formData.garage_lease_type === 'befristet') {
      addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und endet am ${formatDate(formData.end_date)}.`);
    } else {
      addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und wird auf unbestimmte Zeit geschlossen.`);
      addText('Die Kündigungsfrist beträgt einen Monat zum Monatsende.');
    }
    
    addText('Die Kündigung bedarf der Schriftform.');
    
    if (formData.garage_lease_type === 'unbefristet') {
      currentY += 2;
      addText('Setzt der Mieter den Gebrauch der Mietsache nach Ablauf der Mietzeit fort,');
      addText('so verlängert sich das Mietverhältnis nicht auf unbestimmte Zeit. § 545 BGB findet keine Anwendung.');
    }

    // ✅ § 3 MIETZINS UND ZAHLUNGSMODALITÄTEN
    const sectionTitle = formData.has_deposit ? '§ 3 Mietzins, Zahlungsmodalitäten und Kaution' : '§ 3 Mietzins und Zahlungsmodalitäten';
    addSection(sectionTitle, '');
    
    addText(`Die Miete beträgt monatlich ${displayValue(formData.rent)} EUR.`);
    
    if (formData.has_utilities) {
      currentY += 2;
      addText(`Daneben ist eine Betriebskostenvorauszahlung von ${displayValue(formData.utilities)} EUR monatlich zu leisten.`);
      addText('Die Betriebskosten werden nach Ablauf des Abrechnungszeitraumes abgerechnet.');
    }
    
    currentY += 2;
    addText('Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines Monats');
    addText('durch Überweisung auf folgendes Konto zu zahlen:');
    currentY += 2;
    addText(`IBAN: ${displayValue(formData.iban)}`);
    addText(`Bank: ${displayValue(formData.bank)}`);
    addText(`Verwendungszweck: ${garageType} ${displayValue(formData.garage_number, '[Nr.]')} - Miete [MONAT/JAHR]`);
    
    if (formData.has_deposit) {
      currentY += 2;
      addText(`Der Mieter zahlt bei Übergabe der Schlüssel eine Kaution von ${displayValue(formData.deposit)} EUR.`);
      addText('Die Kaution wird verzinslich angelegt und nach ordnungsgemäßer Beendigung');
      addText('des Mietverhältnisses abzüglich eventueller Forderungen zurückgezahlt.');
    }

    // ✅ § 4 MIETERHÖHUNG
    addSection('§ 4 Mieterhöhung', '');
    addText('Der Vermieter kann die Miete mit einer Frist von drei Monaten zum Monatsende erhöhen,');
    addText('soweit die Erhöhung zur Deckung von Kostensteigerungen erforderlich ist.');
    addText('Eine Mieterhöhung ist nur zulässig, wenn seit der letzten Erhöhung mindestens ein Jahr vergangen ist.');

    // ✅ § 5 NUTZUNGSZWECK
    addSection('§ 5 Nutzungszweck', '');
    if (formData.garage_type === 'garage') {
      addText('Die Garage darf nur zum Abstellen von Kraftfahrzeugen und zur Lagerung von');
      addText('kraftfahrzeugbezogenen Gegenständen (Reifen, Werkzeug, Pflegemittel) verwendet werden.');
    } else {
      addText('Der Stellplatz darf ausschließlich zum Abstellen von Kraftfahrzeugen verwendet werden.');
    }
    addText('Die Lagerung von feuergefährlichen, explosiven oder umweltschädlichen Stoffen ist untersagt.');
    addText('Gewerbliche Nutzung ist nicht gestattet.');

    // ✅ § 6 ELEKTROFAHRZEUGE UND LADESTATION
    addSection('§ 6 Elektrofahrzeuge und Ladestation', '');
    addText('Das Laden von Elektrofahrzeugen ist grundsätzlich gestattet, sofern eine entsprechende');
    addText('Stromversorgung vorhanden ist und ordnungsgemäß genutzt wird.');
    currentY += 2;
    addText('Der Einbau einer Ladestation (Wallbox) bedarf der vorherigen schriftlichen Zustimmung des Vermieters.');
    addText('Die Kosten trägt der Mieter. Bei Beendigung des Mietverhältnisses kann der Vermieter');
    addText('wahlweise den Rückbau oder die Übernahme gegen Entschädigung verlangen.');

    // Neue Seite falls nötig
    if (currentY > 200) {
      pdf.addPage();
      currentY = margin;
    }

    // ✅ § 7 INSTANDHALTUNG UND HAFTUNG
    addSection('§ 7 Instandhaltung und Haftung', '');
    addText(`Der Mieter ist verpflichtet, die ${garageType.toLowerCase()} pfleglich zu behandeln und kleinere`);
    addText(`Instandhaltungsarbeiten auf eigene Kosten durchzuführen (Reinigung, Schneeräumung).`);
    currentY += 2;
    addText('Schäden sind unverzüglich dem Vermieter zu melden.');
    addText('Der Mieter haftet für alle von ihm verursachten Schäden.');
    currentY += 2;
    addText(`Der Vermieter haftet nicht für Schäden an den in der ${garageType.toLowerCase()} abgestellten`);
    addText('Fahrzeugen oder gelagerten Gegenständen, es sei denn, er hat diese vorsätzlich');
    addText('oder grob fahrlässig verursacht.');

    // ✅ § 8 UNTERVERMIETUNG
    addSection('§ 8 Untervermietung', '');
    addText(`Die Untervermietung oder sonstige Überlassung der ${garageType.toLowerCase()} an Dritte bedarf`);
    addText('der vorherigen schriftlichen Zustimmung des Vermieters.');

    // ✅ § 9 BEENDIGUNG DER MIETZEIT
    addSection('§ 9 Beendigung der Mietzeit', '');
    addText(`Bei Beendigung des Mietverhältnisses ist die ${garageType.toLowerCase()} besenrein und in dem Zustand`);
    addText('zurückzugeben, in dem sie übernommen wurde (normale Abnutzung ausgenommen).');
    currentY += 2;
    addText('Alle Schlüssel und Zugangshilfen sind vollständig zurückzugeben.');
    addText('Nicht zurückgegebene Schlüssel berechtigen den Vermieter zur Beauftragung');
    addText('eines Schlüsseldienstes auf Kosten des Mieters.');

    // ✅ § 10 SELBSTÄNDIGKEITSKLAUSEL
    addSection('§ 10 Selbständigkeitsklausel', '');
    addText('Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden,');
    addText('berührt dies die Wirksamkeit der übrigen Bestimmungen nicht.');
    addText('Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen,');
    addText('die dem wirtschaftlichen Zweck der unwirksamen am nächsten kommt.');

    // ✅ § 11 PERSONENMEHRHEIT
    addSection('§ 11 Personenmehrheit', '');
    addText('Sind mehrere Personen Vermieter oder Mieter, so haften sie als Gesamtschuldner.');
    addText('Willenserklärungen können gegenüber einem von ihnen abgegeben werden und gelten für alle.');

    // ✅ § 12 VERTRAGSÄNDERUNGEN
    addSection('§ 12 Vertragsänderungen', '');
    addText('Änderungen und Ergänzungen dieses Vertrages bedürfen zu ihrer Wirksamkeit der Schriftform.');

    // ✅ UNTERSCHRIFTENBEREICH
    currentY += 15;
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin + 20;
    }

    addText(`Ort, Datum: _________________, den ${new Date().toLocaleDateString('de-DE')}`, margin, 11, 'normal');
    currentY += 20;

    // Unterschriftsfelder
    addText('_________________________________', margin);
    addText('Unterschrift Vermieter', margin, 9);
    addText(`(${displayValue(formData.landlord_name)})`, margin, 8, 'italic');
    
    addText('_________________________________', pageWidth - margin - 80);
    addText('Unterschrift Mieter', pageWidth - margin - 80, 9);
    addText(`(${displayValue(formData.tenant_name)})`, pageWidth - margin - 80, 8, 'italic');

    // ✅ FOOTER
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, pageHeight - 10);

    // ✅ ADDONS ANHÄNGEN
    if (selectedAddons.includes('explanations')) {
      generateGarageExplanations(pdf, formData);
    }

    if (selectedAddons.includes('handover_protocol')) {
      generateGarageHandoverProtocol(pdf, formData);
    }

    return pdf;

  } catch (error) {
    console.error('Garage PDF Generation Error:', error);
    throw new Error('Garagenvertrag-PDF konnte nicht generiert werden: ' + error.message);
  }
}

// ✅ RECHTLICHE ERLÄUTERUNGEN FÜR GARAGE
function generateGarageExplanations(pdf, formData) {
  pdf.addPage();
  let currentY = 20;
  const margin = 20;
  const lineHeight = 6;
  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';

  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, 170);
    pdf.text(lines, x, currentY);
    currentY += lines.length * lineHeight;
    return currentY;
  };

  // Header Erläuterungen
  addText('RECHTLICHE ERLÄUTERUNGEN', margin, 16, 'bold');
  addText(`zu Ihrem ${garageType}mietvertrag`, margin, 11, 'italic');
  currentY += 8;

  // Überblick
  addText('ÜBERBLICK', margin, 12, 'bold');
  currentY += 4;
  addText(`Diese Erläuterungen helfen Ihnen, die wichtigsten Punkte Ihres ${garageType}mietvertrags`);
  addText('zu verstehen und Ihre Rechte und Pflichten zu kennen.');
  currentY += 8;

  // Wichtige Rechte des Vermieters
  addText('WICHTIGE RECHTE DES VERMIETERS', margin, 12, 'bold');
  currentY += 4;
  
  addText('Mieterhöhung (§ 4):', margin, 10, 'bold');
  addText('Der Vermieter kann die Miete mit 3 Monaten Frist erhöhen, wenn Kostensteigerungen');
  addText('vorliegen. Zwischen Erhöhungen muss mindestens 1 Jahr liegen.');
  currentY += 4;

  addText('Nutzungskontrolle (§ 5):', margin, 10, 'bold');
  addText(`Der Vermieter kann die zweckgemäße Nutzung der ${garageType.toLowerCase()} überwachen`);
  addText('und bei Verstößen abmahnen oder kündigen.');
  currentY += 4;

  if (formData.has_deposit) {
    addText('Kaution (§ 3):', margin, 10, 'bold');
    addText('Die Kaution dient als Sicherheit für Schäden oder ausstehende Forderungen.');
    currentY += 4;
  }

  // Wichtige Rechte des Mieters
  addText('WICHTIGE RECHTE DES MIETERS', margin, 12, 'bold');
  currentY += 4;

  addText('Mietminderung:', margin, 10, 'bold');
  addText('Bei erheblichen Mängeln können Sie die Miete angemessen mindern,');
  addText('bis der Mangel behoben ist.');
  currentY += 4;

  addText('Kündigungsschutz:', margin, 10, 'bold');
  addText('Der Vermieter kann nur bei wichtigem Grund (z.B. Eigenbedarf,');
  addText('Vertragsverletzung) außerordentlich kündigen.');
  currentY += 4;

  if (formData.has_deposit) {
    addText('Kaution-Rückzahlung:', margin, 10, 'bold');
    addText('Die Kaution muss verzinst und nach ordnungsgemäßer');
    addText('Beendigung zurückgezahlt werden.');
    currentY += 4;
  }

  // Neue Seite falls nötig
  if (currentY > 230) {
    pdf.addPage();
    currentY = 20;
  }

  // Praktische Tipps
  addText('PRAKTISCHE TIPPS', margin, 12, 'bold');
  currentY += 4;

  addText('Übergabeprotokoll:', margin, 10, 'bold');
  addText(`Dokumentieren Sie den Zustand der ${garageType.toLowerCase()} bei Übernahme mit Fotos`);
  addText('und schriftlichem Protokoll.');
  currentY += 4;

  addText('Kommunikation:', margin, 10, 'bold');
  addText('Wichtige Mitteilungen (Mängel, Kündigungen) sollten immer schriftlich erfolgen.');
  currentY += 4;

  addText('Versicherung:', margin, 10, 'bold');
  addText('Prüfen Sie, ob Ihr Fahrzeug und gelagerte Gegenstände ausreichend versichert sind.');
  currentY += 4;

  // Häufige Fallstricke
  addText('HÄUFIGE FALLSTRICKE', margin, 12, 'bold');
  currentY += 4;

  addText('Schweigepflicht bei Mängeln:', margin, 10, 'bold');
  addText('Melden Sie Schäden sofort - auch kleine! Verschwiegene Mängel können');
  addText('zu Schadensersatzforderungen führen.');
  currentY += 4;

  addText('Eigenständige Reparaturen:', margin, 10, 'bold');
  addText('Führen Sie keine größeren Reparaturen ohne Abstimmung durch -');
  addText('diese könnte der Vermieter ablehnen.');
  currentY += 4;

  addText('Kündigung:', margin, 10, 'bold');
  addText('Beachten Sie die Kündigungsfristen und die Schriftform.');
  addText('Mündliche Kündigungen sind unwirksam.');
}

// ✅ ÜBERGABEPROTOKOLL FÜR GARAGE
function generateGarageHandoverProtocol(pdf, formData) {
  pdf.addPage();
  let currentY = 20;
  const margin = 20;
  const lineHeight = 6;
  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';

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
  addText(`für ${garageType} ${formData.garage_number || '[Nr.]'}`, margin, 11, 'italic');
  currentY += 8;

  // Objektdaten
  addText('OBJEKTDATEN', margin, 12, 'bold');
  currentY += 4;
  addText(`Adresse: ${formData.garage_same_address ? 
    (formData.landlord_address || '[Adresse]') : 
    `${formData.garage_address || '[Adresse]'}, ${formData.garage_postal || '[PLZ]'} ${formData.garage_city || '[Stadt]'}`
  }`);
  addText(`Art: ${garageType}${formData.garage_number ? ` Nr. ${formData.garage_number}` : ''}`);
  addText('Übergabedatum: _________________  Übergabezeit: ___________');
  addText('Art der Übergabe:  ☐ Einzug  ☐ Auszug');
  currentY += 8;

  // Schlüsselübergabe
  addText('SCHLÜSSELÜBERGABE', margin, 12, 'bold');
  currentY += 4;
  addText(`Schlüssel: ${formData.garage_keys || '___'} Stück    Fernbedienung: ___ Stück`);
  addText('Code/Chip: ___________    Sonstiges: ________________________');
  currentY += 8;

  // Zustandsprüfung
  addText('ZUSTANDSPRÜFUNG', margin, 12, 'bold');
  currentY += 4;

  const checkItems = [
    'Tor/Eingang',
    'Boden',
    'Wände',
    ...(formData.garage_type === 'garage' ? ['Decke'] : []),
    'Beleuchtung',
    'Stromanschluss',
    'Sonstiges'
  ];

  checkItems.forEach(item => {
    addText(`${item}:  ☐ Gut  ☐ Beschädigt    Anmerkungen: ___________________`);
    currentY += 2;
  });

  currentY += 8;

  // Zusätzliche Vereinbarungen
  addText('ZUSÄTZLICHE VEREINBARUNGEN', margin, 12, 'bold');
  currentY += 4;
  addText('_________________________________________________________________');
  currentY += 6;
  addText('_________________________________________________________________');
  currentY += 6;
  addText('_________________________________________________________________');
  currentY += 6;
  addText('_________________________________________________________________');
  currentY += 12;

  // Bestätigung
  addText('BESTÄTIGUNG', margin, 12, 'bold');
  currentY += 4;
  addText('Die Übergabe erfolgte ordnungsgemäß. Beide Parteien bestätigen den dokumentierten Zustand.');
  currentY += 12;

  // Unterschriften
  addText('_____________________', margin);
  addText('Vermieter', margin, 9);
  addText(`(${formData.landlord_name || '[Name]'})`, margin, 8, 'italic');
  
  addText('_____________________', 130);
  addText('Mieter', 130, 9);
  addText(`(${formData.tenant_name || '[Name]'})`, 130, 8, 'italic');
}

// ✅ API-ENDPOINT HELPER (identisch zu Untermietvertrag)
export async function generateAndReturnGaragePDF(formData, selectedAddons, returnType = 'blob') {
  try {
    const pdf = generateGaragenvertragPDF(formData, selectedAddons);
    
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
    console.error('Garage PDF generation failed:', error);
    throw error;
  }
}

// ✅ EXPORT FÜR KOMPATIBILITÄT
export const generateGaragePDF = generateAndReturnGaragePDF;

// ✅ DEFAULT EXPORT
export default generateGaragenvertragPDF;
