// lib/pdf/garagenvertragGenerator.js
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

  // Garage-spezifische Helper
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
    // Header
    addText(contractTitle, margin, 16, 'bold');
    addText(`für die Miete einer ${garageType.toLowerCase()}`, margin, 11, 'italic');
    currentY += 10;

    // Vertragsparteien
    addSection('ZWISCHEN', '');
    
    // Vermieter
    addText('Vermieter:', margin, 11, 'bold');
    currentY += 2;
    addText(`Name: ${displayValue(formData.landlord_name)}`);
    addText(`Anschrift: ${displayValue(formData.landlord_address)}`);
    if (formData.landlord_phone) {
      addText(`Telefon: ${formData.landlord_phone}`);
    }
    currentY += 4;

    addText('UND', margin, 11, 'bold');
    currentY += 4;

    // Mieter
    addText('Mieter:', margin, 11, 'bold');
    currentY += 2;
    addText(`Name: ${displayValue(formData.tenant_name)}`);
    addText(`Anschrift: ${displayValue(formData.tenant_address)}`);
    if (formData.tenant_phone) {
      addText(`Telefon: ${formData.tenant_phone}`);
    }
    currentY += 4;

    addText(`wird folgender ${garageType}mietvertrag geschlossen:`, margin, 11, 'bold');
    currentY += 8;

    // § 1 Mietobjekt
    addSection('§ 1 Mietobjekt', '');
    
    addText(`Vermietet wird die ${garageType.toLowerCase()}:`);
    currentY += 2;
    addText(`Adresse: ${getGarageAddress()}`);
    
    if (formData.garage_number) {
      addText(`${garageType}-Nummer: ${formData.garage_number}`);
    }
    
    if (formData.garage_size) {
      addText(`Größe: ca. ${formData.garage_size} qm`);
    }
    
    addText(`Anzahl Schlüssel/Toröffner: ${displayValue(formData.garage_keys, '1')} Stück`);
    currentY += 4;

    if (formData.garage_type === 'garage') {
      addText('Die Garage ist ausschließlich zum Abstellen von Kraftfahrzeugen bestimmt.');
      addText('Die Lagerung von Gegenständen ist nur im Rahmen der üblichen Garagennutzung gestattet.');
    } else {
      addText('Der Stellplatz ist ausschließlich zum Parken von Kraftfahrzeugen bestimmt.');
    }

    // § 2 Mietzeit
    addSection('§ 2 Mietzeit', '');
    
    if (formData.garage_lease_type === 'befristet') {
      addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und endet am ${formatDate(formData.end_date)}.`);
      addText('Es endet ohne dass es einer Kündigung bedarf.');
    } else {
      addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und wird auf unbestimmte Zeit geschlossen.`);
      addText('Die Kündigungsfrist beträgt einen Monat zum Monatsende.');
    }
    
    addText('Die Kündigung bedarf der Schriftform.');

    // § 3 Miete
    addSection('§ 3 Miete', '');
    
    addText(`Die Miete beträgt monatlich ${displayValue(formData.rent_amount, '[BETRAG]')} EUR.`);
    
    if (formData.additional_costs && parseFloat(formData.additional_costs) > 0) {
      addText(`Zusätzlich entstehen monatliche Nebenkosten in Höhe von ${formData.additional_costs} EUR.`);
      addText(`Die Gesamtmiete beträgt somit ${(parseFloat(formData.rent_amount || 0) + parseFloat(formData.additional_costs || 0)).toFixed(2)} EUR.`);
    }
    
    addText('Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines jeden Kalendermonats zu entrichten.');
    
    if (formData.payment_method) {
      if (formData.payment_method === 'bank_transfer') {
        addText('Die Zahlung erfolgt per Überweisung auf folgendes Konto:');
        if (formData.bank_details) {
          currentY += 2;
          addText(`${formData.bank_details}`, margin + 5, 10);
        } else {
          currentY += 2;
          addText('[BANKVERBINDUNG EINTRAGEN]', margin + 5, 10);
        }
      } else if (formData.payment_method === 'cash') {
        addText('Die Zahlung erfolgt in bar.');
      }
    }

    // § 4 Kaution (falls vorhanden)
    if (formData.deposit_amount && parseFloat(formData.deposit_amount) > 0) {
      addSection('§ 4 Kaution', '');
      addText(`Der Mieter hinterlegt eine Kaution in Höhe von ${formData.deposit_amount} EUR zur Sicherung aller Ansprüche aus dem Mietverhältnis.`);
      addText('Die Kaution ist spätestens bei Übergabe der Garage/des Stellplatzes zu zahlen.');
      addText('Die Kaution wird nach ordnungsgemäßer Beendigung des Mietverhältnisses zurückgezahlt.');
    }

    // Neue Seite falls nötig
    if (currentY > 220) {
      pdf.addPage();
      currentY = margin;
    }

    // § 5 Pflichten des Mieters
    addSection('§ 5 Pflichten des Mieters', '');
    addText('(1) Der Mieter ist verpflichtet, die Garage/den Stellplatz pfleglich zu behandeln.');
    addText('(2) Der Mieter haftet für alle Schäden, die durch ihn oder seine Beauftragte verursacht werden.');
    addText('(3) Reparaturen und Instandhaltungsarbeiten dürfen nur mit Zustimmung des Vermieters durchgeführt werden.');
    
    if (formData.garage_type === 'garage') {
      addText('(4) Das Lagern von feuergefährlichen, explosiven oder umweltgefährdenden Stoffen ist untersagt.');
      addText('(5) Arbeiten an Kraftfahrzeugen sind nur in üblichem Umfang gestattet.');
    }

    // § 6 Zugang und Nutzung
    addSection('§ 6 Zugang und Nutzung', '');
    
    if (formData.access_times) {
      addText(`Die Garage/der Stellplatz kann ${formData.access_times} genutzt werden.`);
    } else {
      addText('Die Garage/der Stellplatz kann rund um die Uhr genutzt werden.');
    }
    
    addText('Der Vermieter behält sich das Recht vor, bei wichtigem Grund den Zugang vorübergehend zu beschränken.');

    // § 7 Kündigung
    addSection('§ 7 Kündigung', '');
    addText('(1) Die Kündigung muss schriftlich erfolgen.');
    
    if (formData.garage_lease_type === 'unbefristet') {
      addText('(2) Die Kündigungsfrist beträgt einen Monat zum Monatsende.');
      addText('(3) Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt.');
    }
    
    addText('(4) Bei Beendigung des Mietverhältnisses sind alle Schlüssel zurückzugeben.');

    // § 8 Haftung und Versicherung
    addSection('§ 8 Haftung und Versicherung', '');
    addText('(1) Der Vermieter haftet nicht für Diebstahl oder Beschädigung der abgestellten Fahrzeuge oder Gegenstände.');
    addText('(2) Der Mieter wird empfohlen, eine entsprechende Versicherung abzuschließen.');
    addText('(3) Für Schäden durch höhere Gewalt haftet der Vermieter nicht.');

    // § 9 Untervermietung
    addSection('§ 9 Untervermietung', '');
    addText('Die Untervermietung oder sonstige Überlassung an Dritte ist nur mit schriftlicher Zustimmung des Vermieters gestattet.');

    // § 10 Betriebskosten
    if (formData.additional_costs && parseFloat(formData.additional_costs) > 0) {
      addSection('§ 10 Betriebskosten', '');
      addText('Die Nebenkosten umfassen:');
      currentY += 2;
      
      if (formData.garage_type === 'garage') {
        addText('- Strom für Beleuchtung und Torantrieb', margin + 5);
        addText('- Reinigung der Gemeinschaftsflächen', margin + 5);
        addText('- Wartung der technischen Anlagen', margin + 5);
      }
      addText('- Grundsteuer (anteilig)', margin + 5);
      addText('- Versicherungen', margin + 5);
      
      currentY += 4;
      addText('Eine jährliche Betriebskostenabrechnung wird erstellt.');
    }

    // § 11 Personenmehrheit
    addSection('§ 11 Personenmehrheit', '');
    addText('Sind mehrere Personen Vermieter oder Mieter, so haften sie als Gesamtschuldner.');
    addText('Willenserklärungen können gegenüber einem von ihnen abgegeben werden und gelten für alle.');

    // § 12 Vertragsänderungen
    addSection('§ 12 Vertragsänderungen', '');
    addText('Änderungen und Ergänzungen dieses Vertrages bedürfen zu ihrer Wirksamkeit der Schriftform.');
    addText('Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.');

    // Unterschriftenbereich
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

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, pageHeight - 10);

    // Addons anhängen
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

// Rechtliche Erläuterungen für Garage
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
  addText(`Diese Erläuterungen helfen Ihnen, die wichtigsten Punkte Ihres ${garageType}mietvertrags zu verstehen und Ihre Rechte und Pflichten zu kennen.`);
  currentY += 6;

  // Wichtige Punkte
  addText('WICHTIGE PUNKTE', margin, 12, 'bold');
  currentY += 4;

  addText('Nutzung:', margin, 10, 'bold');
  if (formData.garage_type === 'garage') {
    addText('Ihre Garage darf nur zum Abstellen von Kraftfahrzeugen verwendet werden. Arbeiten am Fahrzeug sind nur im üblichen Rahmen erlaubt.');
  } else {
    addText('Ihr Stellplatz darf nur zum Parken von Kraftfahrzeugen verwendet werden.');
  }
  currentY += 4;

  addText('Haftung:', margin, 10, 'bold');
  addText('Der Vermieter haftet nicht für Schäden an Ihrem Fahrzeug oder gestohlene Gegenstände. Schließen Sie unbedingt eine entsprechende Versicherung ab.');
  currentY += 4;

  addText('Kündigung:', margin, 10, 'bold');
  if (formData.garage_lease_type === 'unbefristet') {
    addText('Sie können mit einer Frist von einem Monat zum Monatsende kündigen. Die Kündigung muss schriftlich erfolgen.');
  } else {
    addText('Der Vertrag endet automatisch zum vereinbarten Datum. Eine Kündigung ist nicht erforderlich.');
  }
  currentY += 4;

  addText('Schlüsselrückgabe:', margin, 10, 'bold');
  addText('Bei Vertragsende müssen alle Schlüssel und Fernbedienungen vollständig zurückgegeben werden. Andernfalls können Kosten für den Austausch entstehen.');
  currentY += 4;

  if (formData.garage_type === 'garage') {
    addText('Verbotene Tätigkeiten:', margin, 10, 'bold');
    addText('Das Lagern von feuergefährlichen, explosiven oder umweltschädlichen Stoffen ist strengstens untersagt. Größere Reparaturen benötigen die Zustimmung des Vermieters.');
  }
}

// Übergabeprotokoll für Garage
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
  if (formData.garage_size) {
    addText(`Größe: ca. ${formData.garage_size} qm`);
  }
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
    currentY += 3;
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

// Export-Funktionen für verschiedene Formate
export async function generateAndReturnGaragePDF(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔄 Generiere Garagenvertrag PDF...');
    console.log('🔍 FormData:', formData);
    console.log('🔍 SelectedAddons:', selectedAddons);
    
    const pdf = generateGaragenvertragPDF(formData, selectedAddons);
    
    switch (returnType) {
      case 'blob':
        return pdf.output('blob');
      case 'arraybuffer':
        return pdf.output('arraybuffer');
      case 'datauristring':
        return pdf.output('datauristring');
      case 'dataurlstring':
        return pdf.output('dataurlstring');
      default:
        return pdf.output('blob');
    }
  } catch (error) {
    console.error('❌ Garage PDF Generation failed:', error);
    throw error;
  }
}

// Alternative Export-Namen für Kompatibilität
export const generateGaragePDF = generateAndReturnGaragePDF;
export default generateGaragenvertragPDF;

// ============================================
// WICHTIG: Diese Funktionen am ENDE der garagenvertragGenerator.js Datei hinzufügen
// ============================================

/**
 * Generiert das Übergabeprotokoll für Garage/Stellplatz (SEPARATE VERSION)
 */
export function generateGarageHandoverProtocolSeparate(formData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 20;
  let currentY = margin;

  // Helper-Funktionen (gleiche wie im Hauptgenerator)
  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    pdf.text(lines, x, currentY);
    currentY += lines.length * 6;
    return currentY;
  };

  const addSection = (title, spacing = 8) => {
    currentY += spacing;
    addText(title, margin, 12, 'bold');
    currentY += 2;
  };

  const displayValue = (value, placeholder = '[EINTRAGEN]') => {
    return value && value.toString().trim() !== '' ? value : placeholder;
  };

  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';

  try {
    // Header
    addText('ÜBERGABEPROTOKOLL', margin, 16, 'bold');
    addText(`${garageType}mietvertrag`, margin, 14, 'normal');
    currentY += 10;

    // Objektdaten
    addSection('OBJEKTDATEN');
    const garageAddress = formData.garage_same_address ? 
      displayValue(formData.landlord_address) : 
      `${displayValue(formData.garage_address)}, ${displayValue(formData.garage_postal)} ${displayValue(formData.garage_city)}`;
    
    addText(`${garageType}-Adresse: ${garageAddress}`);
    addText(`${garageType}-Nr.: ${displayValue(formData.garage_number, '[NUMMER]')}`);
    
    if (formData.garage_size) {
      addText(`Größe: ca. ${formData.garage_size} qm`);
    }
    
    // Parteien
    addSection('VERTRAGSPARTEIEN');
    addText(`Vermieter: ${displayValue(formData.landlord_name)}`);
    addText(`Mieter: ${displayValue(formData.tenant_name)}`);
    addText(`Übergabedatum: ${formData.start_date ? new Date(formData.start_date).toLocaleDateString('de-DE') : '[DATUM]'}`);

    // Zustandserfassung
    addSection('ZUSTAND BEI ÜBERGABE');
    
    // Checklist für Garage
    const garageChecklist = [
      'Zustand der Wände',
      'Zustand des Bodens', 
      'Zustand des Tors/der Türen',
      'Elektrische Anlagen',
      'Wasseranschlüsse (falls vorhanden)',
      'Heizung (falls vorhanden)',
      'Beleuchtung',
      'Schlüsselübergabe'
    ];

    const stellplatzChecklist = [
      'Zustand der Stellplatzmarkierung',
      'Zustand der Oberfläche',
      'Zugang zum Stellplatz',
      'Beschilderung/Nummerierung'
    ];

    const checklist = formData.garage_type === 'garage' ? garageChecklist : stellplatzChecklist;
    
    checklist.forEach(item => {
      addText(`☐ ${item}: ________________________________`);
    });

    // Mängel
    addSection('FESTGESTELLTE MÄNGEL');
    addText('□ Keine Mängel feststellbar');
    addText('□ Folgende Mängel wurden festgestellt:');
    
    // Platz für Einträge
    for (let i = 0; i < 5; i++) {
      addText('_'.repeat(80));
    }

    // Zusätzliche Vereinbarungen
    addSection('ZUSÄTZLICHE VEREINBARUNGEN');
    for (let i = 0; i < 4; i++) {
      addText('_'.repeat(80));
    }

    // Unterschriften
    addSection('BESTÄTIGUNG', 15);
    addText('Mit ihrer Unterschrift bestätigen beide Parteien die Richtigkeit der Angaben und den dokumentierten Zustand.');
    currentY += 15;

    addText('_____________________', margin);
    addText('Vermieter', margin, 9);
    addText(`(${displayValue(formData.landlord_name)})`, margin, 8, 'italic');
    
    addText('_____________________', 130);
    addText('Mieter', 130, 9);
    addText(`(${displayValue(formData.tenant_name)})`, 130, 8, 'italic');

    return pdf;

  } catch (error) {
    console.error('❌ Garage Handover Protocol Generation failed:', error);
    throw error;
  }
}

/**
 * Generiert Erläuterungen zum Garagenmietvertrag (SEPARATE VERSION)
 */
export function generateGarageExplanationsSeparate(formData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  let currentY = 20;

  // Helper-Funktionen
  const addText = (text, x = margin, fontSize = 11, style = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = pdf.splitTextToSize(text, 170);
    pdf.text(lines, x, currentY);
    currentY += lines.length * 6;
    return currentY;
  };

  const addSection = (title, spacing = 8) => {
    currentY += spacing;
    addText(title, margin, 12, 'bold');
    currentY += 4;
  };

  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';

  try {
    // Header
    addText('VERTRAGSERLÄUTERUNGEN', margin, 16, 'bold');
    addText(`Erklärungen zum ${garageType}mietvertrag`, margin, 12, 'italic');
    currentY += 10;

    // Rechtliche Grundlagen
    addSection('1. RECHTLICHE GRUNDLAGEN');
    addText(`Ein ${garageType}mietvertrag ist ein Nutzungsüberlassungsvertrag, bei dem dem Mieter das Recht eingeräumt wird, einen ${garageType.toLowerCase()} für die Dauer des Vertrags zu nutzen.`);
    addText('Das Mietrecht des BGB findet grundsätzlich Anwendung, jedoch gelten für Garagen und Stellplätze besondere Regelungen.');

    // Besonderheiten
    addSection('2. BESONDERHEITEN');
    if (formData.garage_type === 'garage') {
      addText('• Garagen sind bauliche Anlagen zum Schutz von Fahrzeugen');
      addText('• Der Mieter hat das Recht auf verschließbare Nutzung');
      addText('• Zusätzliche Nutzung als Lagerraum ist meist untersagt');
    } else {
      addText('• Stellplätze sind abgegrenzte Flächen zum Abstellen von Fahrzeugen');
      addText('• Meist im Freien oder in Tiefgaragen gelegen');
      addText('• Keine Möglichkeit des Verschließens');
    }

    // Kündigungsfristen
    addSection('3. KÜNDIGUNGSFRISTEN');
    addText('Für Garagen und Stellplätze gelten grundsätzlich die gleichen Kündigungsfristen wie für Wohnraum:');
    addText('• Mieter: 3 Monate zum Monatsende');
    addText('• Vermieter: 3, 6 oder 9 Monate je nach Mietdauer');
    addText('Sonderkündigungsrechte können vertraglich vereinbart werden.');

    // Kaution
    addSection('4. KAUTION');
    if (formData.deposit_amount) {
      addText(`Vereinbarte Kaution: ${formData.deposit_amount} €`);
    }
    addText('Die Kaution dient der Sicherung von Ansprüchen des Vermieters aus dem Mietverhältnis.');
    addText('Sie ist nach Vertragsende und ordnungsgemäßer Übergabe zurückzuzahlen.');

    // Pflichten
    addSection('5. PFLICHTEN DES MIETERS');
    addText('• Ordnungsgemäße Nutzung entsprechend dem Vertragszweck');
    addText('• Einhaltung der Hausordnung und gesetzlichen Bestimmungen');
    addText('• Schäden umgehend dem Vermieter melden');
    addText('• Bei Vertragsende ordnungsgemäße Rückgabe');

    // Wichtige Hinweise
    addSection('6. WICHTIGE HINWEISE');
    addText('• Der Vertrag ist rechtlich bindend - lesen Sie alle Klauseln sorgfältig');
    addText('• Bei Unklarheiten sollten Sie rechtlichen Rat einholen');
    addText('• Bewahren Sie alle Vertragsunterlagen sorgfältig auf');
    addText('• Änderungen bedürfen der Schriftform');

    // Footer
    currentY = 280;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Diese Erläuterungen dienen der Information und ersetzen keine Rechtsberatung.', margin, currentY);
    pdf.text('Erstellt mit PalWorks.de', margin, currentY + 5);

    return pdf;

  } catch (error) {
    console.error('❌ Garage Explanations Generation failed:', error);
    throw error;
  }
}

/**
 * Generiert alle separaten Dokumente für Garage-Vertrag
 */
export function generateAllGarageDocuments(formData, selectedAddons = []) {
  try {
    console.log('🔍 Generating all garage documents...');
    console.log('🔍 Selected addons:', selectedAddons);

    const documents = [];

    // 1. Hauptvertrag (immer) - WICHTIG: Verwende die bestehende Funktion OHNE Addons
    const mainContract = generateGaragenvertragPDF(formData, []); // ← KEIN selectedAddons hier!
    const garageType = formData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag';
    
    documents.push({
      type: 'contract',
      name: garageType,
      filename: `${garageType}.pdf`,
      pdf: mainContract
    });

    // 2. Übergabeprotokoll (falls gewählt)
    if (selectedAddons.includes('protocol') || selectedAddons.includes('handover_protocol')) {
      const protocolPDF = generateGarageHandoverProtocolSeparate(formData);
      documents.push({
        type: 'handover_protocol',
        name: 'Übergabeprotokoll',
        filename: 'Uebergabeprotokoll.pdf',
        pdf: protocolPDF
      });
    }

    // 3. Vertragserläuterungen (falls gewählt)
    if (selectedAddons.includes('explanations') || selectedAddons.includes('contract_explanations')) {
      const explanationsPDF = generateGarageExplanationsSeparate(formData);
      documents.push({
        type: 'explanations',
        name: 'Vertragserläuterungen',
        filename: 'Vertragserklaerungen.pdf',
        pdf: explanationsPDF
      });
    }

    console.log(`✅ Generated ${documents.length} garage documents`);
    return documents;

  } catch (error) {
    console.error('❌ Garage Multi-PDF Generation Error:', error);
    throw new Error('Garage-Dokumente konnten nicht generiert werden: ' + error.message);
  }
}

/**
 * HAUPTFUNKTION: Generiert separate Dokumente (wie im Untermietvertrag)
 */
export async function generateSeparateDocuments(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔍 Garage Multi-PDF API ENTRY POINT');
    console.log('🔍 Received formData:', formData);
    console.log('🔍 Received selectedAddons:', selectedAddons);
    
    const documents = generateAllGarageDocuments(formData, selectedAddons);
    
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
    
    console.log(`✅ Generated ${results.length} separate garage documents successfully`);
    return results;
    
  } catch (error) {
    console.error('❌ Garage Multi-PDF generation failed:', error);
    throw error;
  }
}
