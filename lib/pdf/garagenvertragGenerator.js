// lib/pdf/garagenvertragGenerator.js - FEHLENDE DATEI ERSTELLEN
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

  const displayValue = (value, placeholder = '[EINTRAGEN]') => {
    return value && value.toString().trim() !== '' ? value : placeholder;
  };

  // PDF-Generierung starten
  try {
    // Header
    const contractTitle = formData.garage_type === 'garage' ? 'GARAGENMIETVERTRAG' : 'STELLPLATZMIETVERTRAG';
    addText(contractTitle, margin, 16, 'bold');
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
    if (formData.landlord_email) {
      addText(`E-Mail: ${formData.landlord_email}`);
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
    if (formData.tenant_email) {
      addText(`E-Mail: ${formData.tenant_email}`);
    }
    currentY += 4;

    addText('wird folgender Mietvertrag geschlossen:', margin, 11, 'bold');
    currentY += 8;

    // § 1 Mietobjekt
    addSection('§ 1 Mietobjekt', '');
    
    const objectType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';
    addText(`(1) Vermietet wird ${objectType.toLowerCase()}:`);
    currentY += 2;
    
    if (!formData.garage_same_address) {
      addText(`Standort: ${displayValue(formData.garage_address)}`);
      addText(`PLZ und Ort: ${displayValue(formData.garage_postal)} ${displayValue(formData.garage_city)}`);
    } else {
      addText('Standort: Am gleichen Ort wie die Wohnung des Vermieters');
    }
    
    if (formData.garage_number) {
      addText(`${objectType}-Nr.: ${formData.garage_number}`);
    }
    if (formData.garage_size) {
      addText(`Größe: ca. ${formData.garage_size} m²`);
    }
    
    currentY += 6;
    addText(`(2) Der ${objectType.toLowerCase()} wird ausschließlich zum Abstellen von Kraftfahrzeugen vermietet.`);

    // § 2 Mietdauer
    addSection('§ 2 Mietdauer', '');
    addText(`Das Mietverhältnis beginnt am ${displayValue(formData.start_date, '[DATUM EINTRAGEN]')}.`);
    
    if (formData.contract_duration === 'unlimited') {
      addText('Das Mietverhältnis wird auf unbestimmte Zeit geschlossen.');
    } else if (formData.contract_duration === 'limited' && formData.end_date) {
      addText(`Das Mietverhältnis endet am ${displayValue(formData.end_date)}.`);
    }

    // § 3 Miete
    addSection('§ 3 Miete', '');
    addText(`(1) Die monatliche Miete beträgt ${displayValue(formData.rent_amount, '[BETRAG]')} EUR.`);
    addText('(2) Die Miete ist monatlich im Voraus bis zum 3. eines jeden Monats zu zahlen.');
    
    if (formData.payment_method === 'bank_transfer' && formData.bank_details) {
      currentY += 4;
      addText('Zahlungsverbindung:', margin, 11, 'bold');
      addText(`IBAN: ${displayValue(formData.iban, '[IBAN EINTRAGEN]')}`);
      addText(`Bank: ${displayValue(formData.bank, '[BANK EINTRAGEN]')}`);
      addText(`Kontoinhaber: ${displayValue(formData.account_holder || formData.landlord_name)}`);
    }

    // § 4 Kaution (falls vorhanden)
    if (formData.deposit_amount && parseFloat(formData.deposit_amount) > 0) {
      addSection('§ 4 Kaution', '');
      addText(`(1) Der Mieter zahlt eine Kaution in Höhe von ${formData.deposit_amount} EUR.`);
      addText('(2) Die Kaution ist spätestens bei Mietbeginn zu zahlen.');
      addText('(3) Die Kaution wird nach ordnungsgemäßer Beendigung des Mietverhältnisses zurückgezahlt.');
    }

    // § 5 Kündigungsfristen
    addSection('§ 5 Kündigung', '');
    if (formData.notice_period) {
      addText(`Das Mietverhältnis kann von beiden Parteien mit einer Frist von ${formData.notice_period} zum Monatsende gekündigt werden.`);
    } else {
      addText('Das Mietverhältnis kann von beiden Parteien mit einer Frist von einem Monat zum Monatsende gekündigt werden.');
    }

    // § 6 Sonstige Bestimmungen
    addSection('§ 6 Sonstige Bestimmungen', '');
    addText('(1) Reparaturen und Instandhaltung gehen zu Lasten des Vermieters, soweit sie nicht durch unsachgemäße Behandlung des Mieters verursacht wurden.');
    addText('(2) Die Untervermietung oder Überlassung an Dritte ist nicht gestattet.');
    addText('(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt der übrige Vertrag wirksam.');

    // Zusätzliche Vereinbarungen
    if (formData.additional_agreements && formData.additional_agreements.trim()) {
      addSection('§ 7 Zusätzliche Vereinbarungen', '');
      addText(formData.additional_agreements);
    }

    currentY += 10;

    // Unterschriften
    addText('Ort, Datum:', margin, 11, 'bold');
    addText('_________________________________', margin);
    currentY += 8;

    addText('_________________________________          _________________________________', margin);
    addText('Vermieter                                                     Mieter', margin, 9);

    // Addons hinzufügen falls gewählt
    if (selectedAddons && selectedAddons.length > 0) {
      currentY += 20;
      addText('ZUSÄTZLICHE DOKUMENTE', margin, 14, 'bold');
      currentY += 6;
      
      selectedAddons.forEach(addonKey => {
        if (addonKey === 'explanations') {
          addSection('Rechtliche Erläuterungen', 'Die rechtlichen Erläuterungen wurden als separates Dokument beigefügt.');
        } else if (addonKey === 'handover_protocol') {
          addSection('Übergabeprotokoll', 'Das Übergabeprotokoll wurde als separates Dokument beigefügt.');
        }
      });
    }

    return pdf;

  } catch (error) {
    console.error('❌ Garagenvertrag PDF-Generierung fehlgeschlagen:', error);
    throw error;
  }
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

// Fallback-Export für Kompatibilität
export { generateAndReturnGaragePDF as generateGaragePDF };
