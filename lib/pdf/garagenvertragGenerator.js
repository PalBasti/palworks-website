// lib/pdf/garagenvertragGenerator.js - Mit Layout Manager Integration

import jsPDF from 'jspdf';
import { PDFLayoutManager } from './helpers/PDFLayoutManager.js';

export function generateGaragenvertragPDF(formData, selectedAddons = []) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Layout Manager mit Konfiguration initialisieren
  const layout = new PDFLayoutManager(pdf, {
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    lineHeight: 6,
    sectionSpacing: 8,
    checkboxSize: 3
  });

  // Helper-Funktionen
  const displayValue = (value, placeholder = '') => {
    if (!value || value.toString().trim() === '') {
      return `_${'_'.repeat(Math.max(15, placeholder.length || 15))}`;
    }
    return value;
  };

  const formatDate = (dateString) => {
    if (!dateString) return `_${'_'.repeat(12)}`;
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch {
      return `_${'_'.repeat(12)}`;
    }
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

  try {
    // Header
    layout.addText(contractTitle, { fontSize: 16, style: 'bold' });
    layout.addText(`für die Miete einer ${garageType.toLowerCase()}`, { fontSize: 11, style: 'italic' });
    layout.addSpacing(10);

    // Vertragsparteien
    layout.addSection('ZWISCHEN');
    
    // Vermieter
    layout.addText('Vermieter:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    layout.addText(`Name: ${displayValue(formData.landlord_name)}`);
    layout.addText(`Anschrift: ${displayValue(formData.landlord_address)}`);
    if (formData.landlord_phone) {
      layout.addText(`Telefon: ${formData.landlord_phone}`);
    }
    layout.addSpacing(4);

    layout.addText('UND', { fontSize: 11, style: 'bold' });
    layout.addSpacing(4);

    // Mieter
    layout.addText('Mieter:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    layout.addText(`Name: ${displayValue(formData.tenant_name)}`);
    layout.addText(`Anschrift: ${displayValue(formData.tenant_address)}`);
    if (formData.tenant_phone) {
      layout.addText(`Telefon: ${formData.tenant_phone}`);
    }
    layout.addSpacing(4);

    layout.addText(`wird folgender ${garageType}mietvertrag geschlossen:`, { fontSize: 11, style: 'bold' });
    layout.addSpacing(8);

    // § 1 Mietobjekt
    layout.addSection('§ 1 Mietobjekt');
    
    layout.addText(`Vermietet wird die ${garageType.toLowerCase()}:`);
    layout.addSpacing(2);
    layout.addText(`Adresse: ${getGarageAddress()}`);
    
    if (formData.garage_number) {
      layout.addText(`${garageType}-Nummer: ${formData.garage_number}`);
    }
    
    if (formData.garage_size) {
      layout.addText(`Größe: ca. ${formData.garage_size} qm`);
    }
    
    layout.addText(`Anzahl Schlüssel/Toröffner: ${displayValue(formData.garage_keys, '1')} Stück`);
    layout.addSpacing(4);

    if (formData.garage_type === 'garage') {
      layout.addText('Die Garage ist ausschließlich zum Abstellen von Kraftfahrzeugen bestimmt.');
      layout.addText('Die Lagerung von Gegenständen ist nur im Rahmen der üblichen Garagennutzung gestattet.');
    } else {
      layout.addText('Der Stellplatz ist ausschließlich zum Parken von Kraftfahrzeugen bestimmt.');
    }

    // § 2 Mietzeit
    layout.addSection('§ 2 Mietzeit');
    
    if (formData.garage_lease_type === 'befristet') {
      layout.addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und endet am ${formatDate(formData.end_date)}.`);
      layout.addText('Es endet ohne dass es einer Kündigung bedarf.');
    } else {
      layout.addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und wird auf unbestimmte Zeit geschlossen.`);
      layout.addText('Die Kündigungsfrist beträgt einen Monat zum Monatsende.');
    }
    
    layout.addText('Die Kündigung bedarf der Schriftform.');

    // § 3 Miete
    layout.addSection('§ 3 Miete');
    
    layout.addText(`Die Miete beträgt monatlich ${displayValue(formData.rent_amount)} EUR.`);
    
    if (formData.additional_costs && parseFloat(formData.additional_costs) > 0) {
      layout.addText(`Zusätzlich entstehen monatliche Nebenkosten in Höhe von ${formData.additional_costs} EUR.`);
      layout.addText(`Die Gesamtmiete beträgt somit ${(parseFloat(formData.rent_amount || 0) + parseFloat(formData.additional_costs || 0)).toFixed(2)} EUR.`);
    }
    
    layout.addText('Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines jeden Kalendermonats zu entrichten.');
    
    if (formData.payment_method) {
      if (formData.payment_method === 'bank_transfer') {
        layout.addText('Die Zahlung erfolgt per Überweisung auf folgendes Konto:');
        if (formData.bank_details) {
          layout.addSpacing(2);
          layout.addText(`${formData.bank_details}`, { x: layout.config.margins.left + 5, fontSize: 10 });
        } else {
          layout.addSpacing(2);
          layout.addText(`_${'_'.repeat(40)}`, { x: layout.config.margins.left + 5, fontSize: 10 });
        }
      } else if (formData.payment_method === 'cash') {
        layout.addText('Die Zahlung erfolgt in bar.');
      }
    }

    // § 4 Kaution (falls vorhanden)
    if (formData.deposit_amount && parseFloat(formData.deposit_amount) > 0) {
      layout.addSection('§ 4 Kaution');
      layout.addText(`Der Mieter hinterlegt eine Kaution in Höhe von ${formData.deposit_amount} EUR zur Sicherung aller Ansprüche aus dem Mietverhältnis.`);
      layout.addText('Die Kaution ist spätestens bei Übergabe der Garage/des Stellplatzes zu zahlen.');
      layout.addText('Die Kaution wird nach ordnungsgemäßer Beendigung des Mietverhältnisses zurückgezahlt.');
    }

    // § 5 Pflichten des Mieters
    layout.addSection('§ 5 Pflichten des Mieters');
    layout.addText('(1) Der Mieter ist verpflichtet, die Garage/den Stellplatz pfleglich zu behandeln.');
    layout.addText('(2) Der Mieter haftet für alle Schäden, die durch ihn oder seine Beauftragte verursacht werden.');
    layout.addText('(3) Reparaturen und Instandhaltungsarbeiten dürfen nur mit Zustimmung des Vermieters durchgeführt werden.');
    
    if (formData.garage_type === 'garage') {
      layout.addText('(4) Das Lagern von feuergefährlichen, explosiven oder umweltgefährdenden Stoffen ist untersagt.');
      layout.addText('(5) Arbeiten an Kraftfahrzeugen sind nur in üblichem Umfang gestattet.');
    }

    // § 6 Zugang und Nutzung
    layout.addSection('§ 6 Zugang und Nutzung');
    
    if (formData.access_times) {
      layout.addText(`Die Garage/der Stellplatz kann ${formData.access_times} genutzt werden.`);
    } else {
      layout.addText('Die Garage/der Stellplatz kann rund um die Uhr genutzt werden.');
    }
    
    layout.addText('Der Vermieter behält sich das Recht vor, bei wichtigem Grund den Zugang vorübergehend zu beschränken.');

    // § 7 Kündigung
    layout.addSection('§ 7 Kündigung');
    layout.addText('(1) Die Kündigung muss schriftlich erfolgen.');
    
    if (formData.garage_lease_type === 'unbefristet') {
      layout.addText('(2) Die Kündigungsfrist beträgt einen Monat zum Monatsende.');
      layout.addText('(3) Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt.');
    }
    
    layout.addText('(4) Bei Beendigung des Mietverhältnisses sind alle Schlüssel zurückzugeben.');

    // § 8 Haftung und Versicherung
    layout.addSection('§ 8 Haftung und Versicherung');
    layout.addText('(1) Der Vermieter haftet nicht für Diebstahl oder Beschädigung der abgestellten Fahrzeuge oder Gegenstände.');
    layout.addText('(2) Der Mieter wird empfohlen, eine entsprechende Versicherung abzuschließen.');
    layout.addText('(3) Für Schäden durch höhere Gewalt haftet der Vermieter nicht.');

    // § 9 Untervermietung
    layout.addSection('§ 9 Untervermietung');
    layout.addText('Die Untervermietung oder sonstige Überlassung an Dritte ist nur mit schriftlicher Zustimmung des Vermieters gestattet.');

    // § 10 Betriebskosten
    if (formData.additional_costs && parseFloat(formData.additional_costs) > 0) {
      layout.addSection('§ 10 Betriebskosten');
      layout.addText('Die Nebenkosten umfassen:');
      layout.addSpacing(2);
      
      if (formData.garage_type === 'garage') {
        layout.addText('- Strom für Beleuchtung und Torantrieb', { x: layout.config.margins.left + 5 });
        layout.addText('- Reinigung der Gemeinschaftsflächen', { x: layout.config.margins.left + 5 });
        layout.addText('- Wartung der technischen Anlagen', { x: layout.config.margins.left + 5 });
      }
      layout.addText('- Grundsteuer (anteilig)', { x: layout.config.margins.left + 5 });
      layout.addText('- Versicherungen', { x: layout.config.margins.left + 5 });
      
      layout.addSpacing(4);
      layout.addText('Eine jährliche Betriebskostenabrechnung wird erstellt.');
    }

    // § 11 Personenmehrheit
    layout.addSection('§ 11 Personenmehrheit');
    layout.addText('Sind mehrere Personen Vermieter oder Mieter, so haften sie als Gesamtschuldner.');
    layout.addText('Willenserklärungen können gegenüber einem von ihnen abgegeben werden und gelten für alle.');

    // § 12 Vertragsänderungen
    layout.addSection('§ 12 Vertragsänderungen');
    layout.addText('Änderungen und Ergänzungen dieses Vertrages bedürfen zu ihrer Wirksamkeit der Schriftform.');
    layout.addText('Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.');

    // Unterschrifts-Bereich
    layout.addSpacing(15);
    layout.addText(`Ort, Datum: ${displayValue('')}, den ${new Date().toLocaleDateString('de-DE')}`);
    layout.addSpacing(15);

    // Unterschriften
    layout.addSignatureSection([
      { 
        label: 'Unterschrift Vermieter', 
        name: displayValue(formData.landlord_name) 
      },
      { 
        label: 'Unterschrift Mieter', 
        name: displayValue(formData.tenant_name) 
      }
    ]);

    // Footer
    layout.addFooter('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen');

    // Addons anhängen (WICHTIG: Keine Addons beim Hauptvertrag)
    if (selectedAddons.includes('explanations')) {
      generateGarageExplanationsPDF_WithLayout(pdf, layout, formData);
    }

    if (selectedAddons.includes('handover_protocol') || selectedAddons.includes('protocol')) {
      generateGarageHandoverProtocolPDF_WithLayout(pdf, layout, formData);
    }

    return pdf;

  } catch (error) {
    console.error('Garage PDF Generation Error:', error);
    throw new Error('Garagenvertrag-PDF konnte nicht generiert werden: ' + error.message);
  }
}

// Übergabeprotokoll für Garage mit Layout Manager
function generateGarageHandoverProtocolPDF_WithLayout(pdf, parentLayout, formData) {
  pdf.addPage();
  
  // Neuer Layout Manager für diese Seite
  const layout = new PDFLayoutManager(pdf, parentLayout.config);

  const displayValue = (value, placeholder = '') => {
    return value && value.toString().trim() !== '' ? value : `_${'_'.repeat(15)}`;
  };

  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';

  try {
    // Header
    layout.addText('ÜBERGABEPROTOKOLL', { fontSize: 16, style: 'bold' });
    layout.addText(`${garageType}mietvertrag`, { fontSize: 14, style: 'normal' });
    layout.addSpacing(10);

    // Objektdaten
    layout.addSection('OBJEKTDATEN');
    const garageAddress = formData.garage_same_address ? 
      displayValue(formData.landlord_address) : 
      `${displayValue(formData.garage_address)}, ${displayValue(formData.garage_postal)} ${displayValue(formData.garage_city)}`;
    
    layout.addText(`${garageType}-Adresse: ${garageAddress}`);
    layout.addText(`${garageType}-Nr.: ${displayValue(formData.garage_number)}`);
    
    if (formData.garage_size) {
      layout.addText(`Größe: ca. ${formData.garage_size} qm`);
    }
    
    // Vertragsparteien
    layout.addSection('VERTRAGSPARTEIEN');
    layout.addText(`Vermieter: ${displayValue(formData.landlord_name)}`);
    layout.addText(`Mieter: ${displayValue(formData.tenant_name)}`);
    
    // Übergabe-Details mit Eingabefeldern
    layout.addSpacing(6);
    layout.addInputField('Übergabedatum: ', { width: 80 });
    layout.addSpacing(2);
    layout.addInputField('Übergabezeit: ', { width: 60 });
    layout.addSpacing(4);

    // Art der Übergabe - Checkbox-Gruppe
    layout.addText('Art der Übergabe:', { fontSize: 11, style: 'bold' });
    layout.addSpacing(2);
    
    layout.addCheckboxGroup([
      { label: 'Einzug', checked: false },
      { label: 'Auszug', checked: false }
    ], { spacing: 45 });

    layout.addSpacing(8);

    // Schlüsselübergabe
    layout.addSection('SCHLÜSSELÜBERGABE');
    layout.addText(`Schlüssel: ${displayValue(formData.garage_keys, '1')} Stück    Fernbedienung: ___ Stück`);
    layout.addText('Code/Chip: ___________    Sonstiges: ________________________');
    layout.addSpacing(8);

    // Zustandsprüfung
    layout.addSection('ZUSTANDSPRÜFUNG');

    const checkItems = [
      'Tor/Eingang',
      'Boden',
      'Wände',
      ...(formData.garage_type === 'garage' ? ['Decke'] : []),
      'Beleuchtung',
      'Stromanschluss',
      'Sonstiges'
    ];

    // Zustandsprüfung als Tabelle für bessere Struktur
    const statusData = checkItems.map(item => [
      item,
      { type: 'checkbox' }, // Gut
      { type: 'checkbox' }, // Beschädigt
      { type: 'input' }     // Anmerkungen
    ]);

    layout.addTable(
      ['Bereich', 'Gut', 'Beschädigt', 'Anmerkungen'],
      statusData,
      { columnWidths: [40, 15, 25, 90] }
    );

    layout.addSpacing(8);

    // Zusätzliche Vereinbarungen
    layout.addSection('ZUSÄTZLICHE VEREINBARUNGEN');
    for (let i = 0; i < 4; i++) {
      layout.addInputField('', { showLabel: false, width: 170 });
    }

    layout.addSpacing(12);

    // Bestätigung
    layout.addSection('BESTÄTIGUNG');
    layout.addText('Die Übergabe erfolgte ordnungsgemäß. Beide Parteien bestätigen den dokumentierten Zustand.');
    layout.addSpacing(12);

    // Unterschriften
    layout.addSignatureSection([
      { 
        label: 'Unterschrift Vermieter',
        name: displayValue(formData.landlord_name)
      },
      { 
        label: 'Unterschrift Mieter',
        name: displayValue(formData.tenant_name)
      }
    ]);

    // Footer
    layout.addFooter('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen');

  } catch (error) {
    console.error('Garage Handover Protocol Generation failed:', error);
    throw error;
  }
}

// Erläuterungen für Garage mit Layout Manager
function generateGarageExplanationsPDF_WithLayout(pdf, parentLayout, formData) {
  pdf.addPage();
  
  const layout = new PDFLayoutManager(pdf, parentLayout.config);
  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz';

  try {
    layout.addText('VERTRAGSERLÄUTERUNGEN', { fontSize: 16, style: 'bold' });
    layout.addText(`Erklärungen zum ${garageType}mietvertrag`, { fontSize: 12, style: 'italic' });
    layout.addSpacing(10);

    // Rechtliche Grundlagen
    layout.addSection('1. RECHTLICHE GRUNDLAGEN');
    layout.addText(`Ein ${garageType}mietvertrag ist ein Nutzungsüberlassungsvertrag, bei dem dem Mieter das Recht eingeräumt wird, einen ${garageType.toLowerCase()} für die Dauer des Vertrags zu nutzen.`);
    layout.addText('Das Mietrecht des BGB findet grundsätzlich Anwendung, jedoch gelten für Garagen und Stellplätze besondere Regelungen.');

    // Besonderheiten
    layout.addSection('2. BESONDERHEITEN');
    if (formData.garage_type === 'garage') {
      layout.addText('• Garagen sind bauliche Anlagen zum Schutz von Fahrzeugen');
      layout.addText('• Der Mieter hat das Recht auf verschließbare Nutzung');
      layout.addText('• Zusätzliche Nutzung als Lagerraum ist meist untersagt');
    } else {
      layout.addText('• Stellplätze sind abgegrenzte Flächen zum Abstellen von Fahrzeugen');
      layout.addText('• Meist im Freien oder in Tiefgaragen gelegen');
      layout.addText('• Keine Möglichkeit des Verschließens');
    }

    // Kündigungsfristen
    layout.addSection('3. KÜNDIGUNGSFRISTEN');
    layout.addText('Für Garagen und Stellplätze gelten grundsätzlich die gleichen Kündigungsfristen wie für Wohnraum:');
    layout.addText('• Mieter: 3 Monate zum Monatsende');
    layout.addText('• Vermieter: 3, 6 oder 9 Monate je nach Mietdauer');
    layout.addText('Sonderkündigungsrechte können vertraglich vereinbart werden.');

    // Kaution
    layout.addSection('4. KAUTION');
    if (formData.deposit_amount) {
      layout.addText(`Vereinbarte Kaution: ${formData.deposit_amount} €`);
    }
    layout.addText('Die Kaution dient der Sicherung von Ansprüchen des Vermieters aus dem Mietverhältnis.');
    layout.addText('Sie ist nach Vertragsende und ordnungsgemäßer Übergabe zurückzuzahlen.');

    // Pflichten
    layout.addSection('5. PFLICHTEN DES MIETERS');
    layout.addText('• Ordnungsgemäße Nutzung entsprechend dem Vertragszweck');
    layout.addText('• Einhaltung der Hausordnung und gesetzlichen Bestimmungen');
    layout.addText('• Schäden umgehend dem Vermieter melden');
    layout.addText('• Bei Vertragsende ordnungsgemäße Rückgabe');

    // Wichtige Hinweise
    layout.addSection('6. WICHTIGE HINWEISE');
    layout.addText('• Der Vertrag ist rechtlich bindend - lesen Sie alle Klauseln sorgfältig');
    layout.addText('• Bei Unklarheiten sollten Sie rechtlichen Rat einholen');
    layout.addText('• Bewahren Sie alle Vertragsunterlagen sorgfältig auf');
    layout.addText('• Änderungen bedürfen der Schriftform');

    // Footer
    layout.addFooter('Diese Erläuterungen dienen der Information und ersetzen keine Rechtsberatung. Erstellt mit PalWorks.de');

  } catch (error) {
    console.error('Garage Explanations Generation failed:', error);
    throw error;
  }
}

// Multi-PDF System für separate Downloads
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
      const protocolPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const layout = new PDFLayoutManager(protocolPdf);
      generateGarageHandoverProtocolPDF_WithLayout(protocolPdf, layout, formData);
      
      documents.push({
        type: 'handover_protocol',
        name: 'Übergabeprotokoll',
        filename: 'Uebergabeprotokoll.pdf',
        pdf: protocolPdf
      });
    }

    // 3. Vertragserläuterungen (falls gewählt)
    if (selectedAddons.includes('explanations') || selectedAddons.includes('contract_explanations')) {
      const explanationsPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const layout = new PDFLayoutManager(explanationsPdf);
      generateGarageExplanationsPDF_WithLayout(explanationsPdf, layout, formData);
      
      documents.push({
        type: 'explanations',
        name: 'Vertragserläuterungen',
        filename: 'Vertragserklaerungen.pdf',
        pdf: explanationsPdf
      });
    }

    console.log(`✅ Generated ${documents.length} garage documents`);
    return documents;

  } catch (error) {
    console.error('❌ Garage Multi-PDF Generation Error:', error);
    throw new Error('Garage-Dokumente konnten nicht generiert werden: ' + error.message);
  }
}

// Bestehende API-Funktionen für Kompatibilität
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

// Separate Documents API
export async function generateSeparateDocuments(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔄 Garage Multi-PDF API ENTRY POINT');
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

// Export default für Kompatibilität
export default generateGaragenvertragPDF;
