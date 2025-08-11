// lib/pdf/wgUntermietvertragGenerator.js
import jsPDF from 'jspdf';

export function generateWGUntermietvertragPDF(formData, selectedAddons = []) {
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

  // WG-spezifische Helper-Funktionen
  const getSharedRooms = () => {
    const shared = [];
    if (formData.shared_living) shared.push('Wohnzimmer');
    if (formData.shared_kitchen) shared.push('Küche');
    if (formData.shared_bathroom) shared.push('Bad mit Toilette');
    if (formData.shared_hallway) shared.push('Diele/Flur');
    if (formData.shared_balcony) shared.push('Balkon/Terrasse');
    if (formData.shared_cellar) shared.push('Keller(anteil)');
    if (formData.shared_attic) shared.push('Dachboden');
    if (formData.shared_garden) shared.push('Gartenanteil');
    
    return shared.length > 0 ? shared.join(', ') : 'keine';
  };

  const getSharedFacilities = () => {
    const facilities = [];
    if (formData.shared_washroom) facilities.push('Waschraum');
    if (formData.shared_dryroom) facilities.push('Trockenraum/-boden');
    if (formData.shared_other && formData.shared_other.trim()) {
      facilities.push(formData.shared_other);
    }
    
    return facilities.length > 0 ? facilities.join(', ') : 'keine';
  };

  // PDF-Generierung starten
  try {
    // Header
    addText('UNTERMIETVERTRAG', margin, 16, 'bold');
    addText('(WG-Zimmer)', margin, 11, 'italic');
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
    addText(`Name: ${displayValue(formData.tenant_name, '[Name des Untermieters]')}`);
    addText(`Anschrift: ${displayValue(formData.tenant_address, '[Anschrift des Untermieters]')}`);
    currentY += 4;

    addText('wird folgender Untermietvertrag geschlossen:', margin, 11, 'bold');
    currentY += 8;

    // § 1 Vertragsgegenstand
    addSection('§ 1 Vertragsgegenstand', '');
    
    addText('(1) Mietobjekt (Gesamtwohnung)');
    addText('Der Untervermieter ist alleiniger Mieter der Wohnung in:');
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

    addText('(2) Zimmer zur alleinigen Nutzung');
    addText('Der Untermieter wird in die Wohnung mit aufgenommen und erhält zur alleinigen Nutzung den folgenden Raum zu Wohnzwecken zugewiesen:');
    currentY += 2;
    addText(`${displayValue(formData.exclusive_room, '[Zimmerbezeichnung]')}`, margin + 5, 11, 'bold');
    currentY += 4;

    addText('(3) Gemeinschaftlich nutzbare Räume');
    addText('Der Untermieter ist berechtigt, die folgenden Räume und Flächen gemeinschaftlich mit dem Untervermieter zu Wohnzwecken zu benutzen:');
    currentY += 2;
    addText(`${getSharedRooms()}`, margin + 5);
    currentY += 4;

    addText('(4) Gemeinschaftseinrichtungen');
    addText('Der Untermieter ist berechtigt, folgende Gemeinschaftseinrichtungen gemäß den Vorschriften der Hausordnung mit zu benutzen:');
    currentY += 2;
    addText(`${getSharedFacilities()}`, margin + 5);
    currentY += 4;

    // Equipment falls vorhanden
    if (formData.equipment_list && formData.equipment_list.trim()) {
      addText('(5) Ausstattungsgegenstände');
      addText('Mitvermietet sind folgende Ausstattungsgegenstände:');
      currentY += 2;
      addText(`${formData.equipment_list}`, margin + 5, 10, 'italic');
      addText('Diese sind bei Auszug vollständig und in ordnungsgemäßem Zustand zurückzulassen.', margin + 5, 10);
      currentY += 4;
    }

    addText('Der Untermieter ist sich bewusst, dass der Untervermieter selbst Mieter ist und er gegenüber dem Eigentümer der Wohnung keinen Kündigungsschutz genießt.');
    currentY += 4;

    // Neue Seite falls nötig
    if (currentY > 220) {
      pdf.addPage();
      currentY = margin;
    }

    // § 2 Mietzeit
    addSection('§ 2 Mietzeit', '');
    addText(`Das Mietverhältnis beginnt am ${formatDate(formData.start_date)} und`);
    
    if (formData.contract_type === 'unlimited') {
      addText('läuft auf unbestimmte Zeit; es ist nach den gesetzlichen Vorschriften kündbar.');
    } else {
      addText(`endet am ${formatDate(formData.end_date)} ohne dass es hierzu einer Kündigung bedarf.`);
    }
    currentY += 4;

    // § 3 Verhältnis zum Vermieter
    addSection('§ 3 Verhältnis zum Vermieter', '');
    addText('(1) Der Untermieter erkennt an, dass zwischen ihm und dem Vermieter kein Mietverhältnis besteht.');
    addText('(2) Der Untermieter hat keinen Anspruch auf Fortsetzung des Mietverhältnisses über die Beendigung des Hauptmietverhältnisses hinaus.');
    addText('(3) Der Untermieter verpflichtet sich, im Falle der Beendigung des Hauptmietverhältnisses die Räume unverzüglich zu räumen.');

    // § 4 Miete
    addSection('§ 4 Miete', '');
    addText(`Die Miete beträgt monatlich ${displayValue(formData.rent_amount, '[BETRAG]')} EUR inklusive sämtlicher Betriebskosten; diese umfassen Heizung und Warmwasser, sonstige Betriebskosten und Strom.`);
    
    if (formData.telecom_costs && formData.telecom_costs.trim()) {
      currentY += 3;
      addText(`Telekommunikationskosten trägt der Untermieter nach folgender Maßgabe: ${formData.telecom_costs}`);
    }
    
    currentY += 3;
    addText('Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines jeden Kalendermonats an den Untervermieter zu entrichten.');

    // § 5 Kaution (falls vorhanden)
    if (formData.deposit_amount && parseFloat(formData.deposit_amount) > 0) {
      addSection('§ 5 Kaution', '');
      addText(`Der Untermieter hinterlegt eine Kaution in Höhe von ${formData.deposit_amount} EUR zur Sicherung aller Ansprüche aus dem Mietverhältnis.`);
      
      if (formData.deposit_installments && formData.deposit_installments === 'yes') {
        addText('Die Zahlung kann in drei Monatsraten erfolgen.');
      }
    }

    // Neue Seite falls nötig
    if (currentY > 220) {
      pdf.addPage();
      currentY = margin;
    }

    // § 6 Nutzung und Behandlung der Mieträume
    addSection('§ 6 Nutzung und Behandlung der Mieträume', '');
    addText('(1) Der Untermieter ist verpflichtet, die überlassenen Räume pfleglich zu behandeln und nur zu Wohnzwecken zu nutzen.');
    addText('(2) Die Aufnahme weiterer Personen bedarf der schriftlichen Zustimmung des Untervermieters.');
    addText('(3) Haustiere dürfen nur mit ausdrücklicher schriftlicher Erlaubnis des Untervermieters gehalten werden.');

    // Reinigungsplan falls vorhanden
    if (formData.cleaning_plan && formData.cleaning_plan.trim()) {
      currentY += 4;
      addText('(4) Reinigungsvereinbarung');
      addText('Der Untermieter hat sich an der regelmäßigen Reinigung der gemeinschaftlich benutzten Räume, Flächen und Einrichtungen nach Maßgabe des folgenden Reinigungsplans zu beteiligen:');
      currentY += 2;
      addText(`${formData.cleaning_plan}`, margin + 5, 10, 'italic');
    }

    // § 7 Duldungspflicht
    addSection('§ 7 Duldungspflicht', '');
    addText('Der Untermieter hat Besichtigungen, Reparaturen und Modernisierungsmaßnahmen während der üblichen Geschäftszeiten zu dulden, soweit diese vom Vermieter angeordnet oder vom Untervermieter für erforderlich gehalten werden.');

    // § 8 Untervermieterpfandrecht
    addSection('§ 8 Untervermieterpfandrecht', '');
    addText('Dem Untervermieter steht an den in die Räume eingebrachten Sachen des Untermieters ein Pfandrecht für alle Forderungen aus dem Mietverhältnis zu.');

    // § 9 Anzeigepflicht und Haftung
    addSection('§ 9 Anzeigepflicht und Haftung', '');
    addText('(1) Der Untermieter ist verpflichtet, Mängel der Mietsache unverzüglich anzuzeigen.');
    addText('(2) Der Untermieter haftet für alle Schäden, die durch ihn, seine Familienangehörigen oder Besucher verursacht werden.');
    addText('(3) Der Untermieter ist verpflichtet, eine angemessene Haftpflichtversicherung abzuschließen.');

    // Neue Seite falls nötig
    if (currentY > 220) {
      pdf.addPage();
      currentY = margin;
    }

    // § 10 Beendigung der Mietzeit
    addSection('§ 10 Beendigung der Mietzeit', '');
    addText('(1) Bei Beendigung des Mietverhältnisses ist der zur alleinigen Nutzung überlassene Raum besenrein und in ordnungsgemäßem Zustand zu übergeben.');
    addText('(2) Alle Schlüssel sind vollständig zurückzugeben.');
    addText('(3) Eine hinterlegte Kaution wird nach ordnungsgemäßer Übergabe und Abrechnung zurückgezahlt.');

    // § 11 Meldepflicht
    addSection('§ 11 Meldepflicht', '');
    addText('Der Untermieter ist verpflichtet, sich unverzüglich bei der zuständigen Meldebehörde anzumelden. Der Untervermieter stellt eine entsprechende Wohnungsgeberbestätigung aus.');

    // § 12 Weitere Vertragsbestandteile
    addSection('§ 12 Weitere Vertragsbestandteile', '');
    addText('(1) Die Hausordnung ist Bestandteil dieses Vertrages.');
    addText('(2) Mündliche Nebenabreden bestehen nicht.');
    addText('(3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.');
    addText('(4) Gerichtsstand ist der Ort der Mietsache.');

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
    addText('Untervermieter', margin, 9);
    
    addText('_________________________________', pageWidth - margin - 80);
    addText('Untermieter', pageWidth - margin - 80, 9);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Erstellt mit PalWorks.de - Rechtssichere Vertragsvorlagen', margin, pageHeight - 10);

    // WG-Übergabeprotokoll anhängen falls ausgewählt
    if (selectedAddons.includes('protocol')) {
      generateWGHandoverProtocol(pdf, formData);
    }

    return pdf;

  } catch (error) {
    console.error('WG PDF Generation Error:', error);
    throw new Error('WG-Untermietvertrag PDF konnte nicht generiert werden: ' + error.message);
  }
}

// WG-spezifisches Übergabeprotokoll
function generateWGHandoverProtocol(pdf, formData) {
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
  addText('für WG-Zimmer', margin, 11, 'italic');
  currentY += 8;

  // Vertragsdaten
  addText('Vertragsbezug:', margin, 11, 'bold');
  addText(`Wohnung: ${formData.property_address || '[ADRESSE]'}, ${formData.property_postal || '[PLZ]'} ${formData.property_city || '[ORT]'}`);
  addText(`Zimmer: ${formData.exclusive_room || '[ZIMMER]'}`);
  addText(`Untervermieter: ${formData.landlord_name || '[NAME]'}`);
  addText(`Untermieter: ${formData.tenant_name || '[NAME]'}`);
  currentY += 8;

  // Übergabedaten
  addText('Übergabedaten:', margin, 11, 'bold');
  addText('Datum: ________________  Uhrzeit: ___________');
  addText('Art der Übergabe:  ☐ Einzug  ☐ Auszug');
  currentY += 8;

  // Zimmer-spezifische Zustandsbeschreibung
  addText('ZUSTANDSBESCHREIBUNG', margin, 12, 'bold');
  currentY += 4;

  // Privates Zimmer
  addText('1. PRIVATES ZIMMER', margin, 11, 'bold');
  currentY += 2;
  addText(`Raum: ${formData.exclusive_room || '[ZIMMER]'}`);
  addText('Zustand: ☐ einwandfrei  ☐ Mängel (siehe unten)');
  addText('Wände: ______________________  Boden: ______________________');
  addText('Fenster: ____________________  Heizung: ____________________');
  addText('Besondere Anmerkungen: _________________________________');
  currentY += 6;

  // Gemeinschaftsräume
  addText('2. GEMEINSCHAFTSRÄUME', margin, 11, 'bold');
  currentY += 2;

  const sharedRooms = [];
  if (formData.shared_kitchen) sharedRooms.push('Küche');
  if (formData.shared_bathroom) sharedRooms.push('Bad/WC');
  if (formData.shared_living) sharedRooms.push('Wohnzimmer');
  if (formData.shared_hallway) sharedRooms.push('Flur/Diele');
  if (formData.shared_balcony) sharedRooms.push('Balkon/Terrasse');

  sharedRooms.forEach(room => {
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

  // Ausstattung falls vorhanden
  if (formData.equipment_list && formData.equipment_list.trim()) {
    if (currentY > 230) {
      pdf.addPage();
      currentY = 20;
    }

    addText('3. AUSSTATTUNG', margin, 11, 'bold');
    currentY += 2;
    addText('Im Zimmer/Wohnung befindliche Gegenstände:');
    currentY += 2;
    
    // Equipment-Liste in Checkboxen umwandeln
    const equipment = formData.equipment_list.split(',').map(item => item.trim());
    equipment.forEach(item => {
      if (item) {
        addText(`☐ ${item} (Zustand: ________________)`);
      }
    });
    currentY += 4;
  }

  // Zählerstände
  if (currentY > 230) {
    pdf.addPage();
    currentY = 20;
  }

  addText('4. ZÄHLERSTÄNDE (falls separat abgerechnet)', margin, 11, 'bold');
  currentY += 4;
  addText('Strom: ___________  Gas: ___________  Wasser: ___________');
  currentY += 8;

  // Schlüsselübergabe
  addText('5. SCHLÜSSELÜBERGABE', margin, 11, 'bold');
  currentY += 4;
  addText('Haustür: ___ Stück    Wohnungstür: ___ Stück');
  addText('Zimmertür: ___ Stück  Briefkasten: ___ Stück');
  addText('Keller: ___ Stück     Sonstige: ________________________');
  currentY += 8;

  // Mängel und Besonderheiten
  addText('6. MÄNGEL UND BESONDERHEITEN', margin, 11, 'bold');
  currentY += 4;
  addText('_________________________________________________________________');
  addText('_________________________________________________________________');
  addText('_________________________________________________________________');
  addText('_________________________________________________________________');
  currentY += 8;

  // Unterschriften
  addText('BESTÄTIGUNG', margin, 12, 'bold');
  currentY += 4;
  addText('Die Übergabe erfolgte ordnungsgemäß. Beide Parteien bestätigen den dokumentierten Zustand.');
  currentY += 8;

  // Unterschriftsfelder
  addText('_________________________________', margin);
  addText(`Datum: ______________`, margin, 9);
  addText('Untervermieter', margin, 9);

  addText('_________________________________', 120);
  addText(`Datum: ______________`, 120, 9);
  addText('Untermieter', 120, 9);
}

// Export-Funktionen für verschiedene Formate
export async function generateAndReturnWGPDF(formData, selectedAddons = [], returnType = 'blob') {
  try {
    console.log('🔄 Generiere WG-Untermietvertrag PDF...');
    console.log('🔍 FormData:', formData);
    console.log('🔍 SelectedAddons:', selectedAddons);
    
    const pdf = generateWGUntermietvertragPDF(formData, selectedAddons);
    
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
    console.error('❌ WG PDF Generation failed:', error);
    throw error;
  }
}
