// lib/pdf/garagenvertragGenerator.js - PDF-GENERATOR FÜR GARAGENVERTRÄGE
import puppeteer from 'puppeteer'

// ✅ HILFSFUNKTIONEN
const formatName = (data, prefix) => {
  return data[`${prefix}_name`] || `[${prefix.toUpperCase()}_NAME]`
}

const formatAddress = (data, prefix) => {
  if (prefix === 'garage' && data.garage_same_address) {
    return formatAddress(data, 'landlord')
  }
  
  if (prefix === 'garage') {
    const address = data.garage_address || '[GARAGE_ADRESSE]'
    const postal = data.garage_postal || '[PLZ]'
    const city = data.garage_city || '[STADT]'
    return `${address}, ${postal} ${city}`
  }
  
  return data[`${prefix}_address`] || `[${prefix.toUpperCase()}_ADRESSE]`
}

const formatDate = (dateString) => {
  if (!dateString) return '[DATUM]'
  try {
    return new Date(dateString).toLocaleDateString('de-DE')
  } catch {
    return dateString
  }
}

const formatCurrency = (amount) => {
  if (!amount) return '[BETRAG]'
  return parseFloat(amount).toFixed(2).replace('.', ',')
}

// ✅ HAUPTFUNKTION - GARAGENVERTRAG HTML GENERIEREN
const generateGarageContractHTML = (formData, selectedAddons = []) => {
  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'
  const contractTitle = `${garageType}mietvertrag`
  
  // Addon-Flags
  const hasExplanations = selectedAddons.includes('explanations') || formData.include_explanations
  const hasProtocol = selectedAddons.includes('handover_protocol') || formData.include_protocol

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${contractTitle}</title>
      <style>
        @page {
          margin: 2cm;
          size: A4;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 0;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }
        
        .title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .subtitle {
          font-size: 11pt;
          color: #666;
          font-style: italic;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ccc;
        }
        
        .paragraph {
          margin-bottom: 15px;
          text-align: justify;
        }
        
        .parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .party {
          width: 45%;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .party-title {
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 10px;
          color: #333;
        }
        
        .highlight {
          background-color: #fffacd;
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: bold;
        }
        
        .important {
          background-color: #e8f4fd;
          padding: 10px;
          border-left: 4px solid #007bff;
          margin: 15px 0;
          font-size: 11pt;
        }
        
        .signatures {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          width: 40%;
          border-top: 1px solid #000;
          padding-top: 10px;
          text-align: center;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 10pt;
          color: #666;
          text-align: center;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      
      <!-- ✅ HEADER -->
      <div class="header">
        <div class="title">${contractTitle}</div>
        <div class="subtitle">Erstellt mit PalWorks.de - Rechtssichere DIY-Verträge</div>
      </div>

      <!-- ✅ PARTEIEN -->
      <div class="parties">
        <div class="party">
          <div class="party-title">🏢 Vermieter</div>
          <strong>${formatName(formData, 'landlord')}</strong><br>
          ${formatAddress(formData, 'landlord')}
        </div>
        
        <div class="party">
          <div class="party-title">👤 Mieter</div>
          <strong>${formatName(formData, 'tenant')}</strong><br>
          ${formatAddress(formData, 'tenant')}
        </div>
      </div>

      <!-- ✅ VERTRAGSBEGINN -->
      <div class="section">
        <div class="paragraph">
          Der <strong>Vermieter</strong> vermietet an den <strong>Mieter</strong> die nachstehend beschriebene 
          ${garageType.toLowerCase()} zu den folgenden Bedingungen:
        </div>
      </div>

      <!-- ✅ § 1 MIETOBJEKT -->
      <div class="section">
        <div class="section-title">§ 1 Mietobjekt</div>
        
        <div class="paragraph">
          Vermietet wird die <span class="highlight">${garageType.toLowerCase()}${formData.garage_number ? ` Nr. ${formData.garage_number}` : ''}</span> 
          in <span class="highlight">${formatAddress(formData, 'garage')}</span>.
        </div>
        
        <div class="paragraph">
          Dem Mieter werden für die Mietzeit folgende Schlüssel/Codeschlüssel/Toröffner ausgehändigt: 
          <span class="highlight">${formData.garage_keys || '1'} Stück</span>.
        </div>
        
        ${formData.garage_type === 'garage' ? `
          <div class="important">
            <strong>Hinweis:</strong> Die Garage ist ausschließlich zum Abstellen von Kraftfahrzeugen bestimmt. 
            Die Lagerung von Gegenständen ist nur im Rahmen der üblichen Garagennutzung gestattet.
          </div>
        ` : `
          <div class="important">
            <strong>Hinweis:</strong> Der Stellplatz ist ausschließlich zum Parken von Kraftfahrzeugen bestimmt. 
            Eine anderweitige Nutzung ist nicht gestattet.
          </div>
        `}
      </div>

      <!-- ✅ § 2 MIETZEIT -->
      <div class="section">
        <div class="section-title">§ 2 Mietzeit</div>
        
        <div class="paragraph">
          ${formData.garage_lease_type === 'befristet' ? `
            Das Mietverhältnis beginnt am <span class="highlight">${formatDate(formData.start_date)}</span> 
            und endet am <span class="highlight">${formatDate(formData.end_date)}</span>.
          ` : `
            Das Mietverhältnis beginnt am <span class="highlight">${formatDate(formData.start_date)}</span> 
            und wird auf unbestimmte Zeit geschlossen.
          `}
        </div>
        
        <div class="paragraph">
          Die Kündigung bedarf der Schriftform. ${formData.garage_lease_type === 'unbefristet' ? `
            Die Kündigungsfrist beträgt einen Monat zum Monatsende.
          ` : ''}
        </div>
        
        ${formData.garage_lease_type === 'unbefristet' ? `
          <div class="paragraph">
            Setzt der Mieter den Gebrauch der Mietsache nach Ablauf der Mietzeit fort, 
            so verlängert sich das Mietverhältnis nicht auf unbestimmte Zeit. § 545 BGB findet insoweit keine Anwendung.
          </div>
        ` : ''}
      </div>

      <!-- ✅ § 3 MIETZINS UND ZAHLUNGSMODALITÄTEN -->
      <div class="section">
        <div class="section-title">§ 3 Mietzins und Zahlungsmodalitäten${formData.has_deposit ? ', Kaution' : ''}</div>
        
        <div class="paragraph">
          Die Miete beträgt monatlich <span class="highlight">${formatCurrency(formData.rent)} EUR</span>.
        </div>
        
        ${formData.has_utilities ? `
          <div class="paragraph">
            Daneben ist eine Betriebskostenvorauszahlung für die Betriebskosten im Sinne von § 2 BetrkV 
            zu leisten in Höhe von <span class="highlight">${formatCurrency(formData.utilities)} EUR</span>.
          </div>
          
          <div class="paragraph">
            Die Abschlagszahlungen auf Betriebskosten werden nach Ablauf des jährlichen Abrechnungszeitraumes abgerechnet.
          </div>
        ` : ''}
        
        <div class="paragraph">
          Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines Monats an den Vermieter 
          durch Überweisung auf folgendes Konto zu bezahlen:
        </div>
        
        <table style="margin: 15px 0;">
          <tr>
            <th>IBAN</th>
            <td>${formData.iban || '[IBAN EINTRAGEN]'}</td>
          </tr>
          <tr>
            <th>Bank</th>
            <td>${formData.bank || '[BANK EINTRAGEN]'}</td>
          </tr>
          <tr>
            <th>Verwendungszweck</th>
            <td>${garageType} ${formData.garage_number || '[Nr.]'} - Miete [MONAT/JAHR]</td>
          </tr>
        </table>
        
        ${formData.has_deposit ? `
          <div class="paragraph">
            Der Mieter zahlt bei Übergabe der Schlüssel eine Kaution von 
            <span class="highlight">${formatCurrency(formData.deposit)} EUR</span>. 
            Die Kaution wird verzinslich angelegt und nach ordnungsgemäßer Beendigung des Mietverhältnisses 
            abzüglich eventueller Forderungen zurückgezahlt.
          </div>
        ` : ''}
      </div>

      <!-- ✅ § 4 MIETERHÖHUNG -->
      <div class="section">
        <div class="section-title">§ 4 Mieterhöhung</div>
        
        <div class="paragraph">
          Der Vermieter kann die Miete mit einer Frist von drei Monaten zum Monatsende erhöhen, 
          soweit die Erhöhung zur Deckung von Kostensteigerungen erforderlich ist.
        </div>
        
        <div class="paragraph">
          Eine Mieterhöhung ist nur zulässig, wenn seit der letzten Mieterhöhung mindestens ein Jahr vergangen ist.
        </div>
      </div>

      <!-- ✅ § 5 NUTZUNGSZWECK -->
      <div class="section">
        <div class="section-title">§ 5 Nutzungszweck</div>
        
        <div class="paragraph">
          ${formData.garage_type === 'garage' ? `
            Die Garage darf nur zum Abstellen von Kraftfahrzeugen und zur Lagerung von kraftfahrzeugbezogenen 
            Gegenständen (wie Reifen, Werkzeug, Pflegemittel) verwendet werden.
          ` : `
            Der Stellplatz darf ausschließlich zum Abstellen von Kraftfahrzeugen verwendet werden.
          `}
        </div>
        
        <div class="paragraph">
          Die Lagerung von feuergefährlichen, explosiven oder umweltschädlichen Stoffen ist untersagt. 
          Ebenso ist die gewerbliche Nutzung nicht gestattet.
        </div>
      </div>

      <!-- ✅ § 6 ELEKTROFAHRZEUGE UND LADESTATION -->
      <div class="section">
        <div class="section-title">§ 6 Elektrofahrzeuge und Ladestation</div>
        
        <div class="paragraph">
          Das Laden von Elektrofahrzeugen ist grundsätzlich gestattet, sofern eine entsprechende 
          Stromversorgung vorhanden ist und ordnungsgemäß genutzt wird.
        </div>
        
        <div class="paragraph">
          Der Einbau einer Ladestation (Wallbox) bedarf der vorherigen schriftlichen Zustimmung des Vermieters. 
          Die Kosten trägt der Mieter. Bei Beendigung des Mietverhältnisses kann der Vermieter wahlweise 
          den Rückbau oder die Übernahme der Ladestation gegen Entschädigung verlangen.
        </div>
      </div>

      <!-- ✅ § 7 INSTANDHALTUNG UND HAFTUNG -->
      <div class="section">
        <div class="section-title">§ 7 Instandhaltung und Haftung</div>
        
        <div class="paragraph">
          Der Mieter ist verpflichtet, die Mietsache pfleglich zu behandeln und kleinere Instandhaltungsarbeiten 
          auf eigene Kosten durchzuführen (z.B. Reinigung, Schneeräumung vor der ${garageType.toLowerCase()}).
        </div>
        
        <div class="paragraph">
          Schäden an der Mietsache oder an fremdem Eigentum durch den Mieter oder seine Besucher 
          sind unverzüglich dem Vermieter zu melden. Der Mieter haftet für alle von ihm verursachten Schäden.
        </div>
        
        <div class="paragraph">
          Der Vermieter haftet nicht für Schäden an den in der ${garageType.toLowerCase()} abgestellten Fahrzeugen 
          oder gelagerten Gegenständen, es sei denn, er hat diese vorsätzlich oder grob fahrlässig verursacht.
        </div>
      </div>

      <!-- ✅ § 8 UNTERVERMIETUNG -->
      <div class="section">
        <div class="section-title">§ 8 Untervermietung</div>
        
        <div class="paragraph">
          Die Untervermietung oder sonstige Überlassung der ${garageType.toLowerCase()} an Dritte bedarf 
          der vorherigen schriftlichen Zustimmung des Vermieters.
        </div>
      </div>

      <!-- ✅ § 9 BEENDIGUNG DER MIETZEIT -->
      <div class="section">
        <div class="section-title">§ 9 Beendigung der Mietzeit</div>
        
        <div class="paragraph">
          Bei Beendigung des Mietverhältnisses ist die ${garageType.toLowerCase()} besenrein und 
          in dem Zustand zurückzugeben, in dem sie übernommen wurde (normale Abnutzung ausgenommen).
        </div>
        
        <div class="paragraph">
          Alle Schlüssel und Zugangshilfen sind vollständig zurückzugeben. Nicht zurückgegebene Schlüssel 
          berechtigen den Vermieter zur Beauftragung eines Schlüsseldienstes auf Kosten des Mieters.
        </div>
      </div>

      <!-- ✅ § 10 SELBSTÄNDIGKEITSKLAUSEL -->
      <div class="section">
        <div class="section-title">§ 10 Selbständigkeitsklausel</div>
        
        <div class="paragraph">
          Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden, 
          berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. 
          Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, 
          die dem wirtschaftlichen Zweck der unwirksamen am nächsten kommt.
        </div>
      </div>

      <!-- ✅ § 11 PERSONENMEHRHEIT -->
      <div class="section">
        <div class="section-title">§ 11 Personenmehrheit</div>
        
        <div class="paragraph">
          Sind mehrere Personen Vermieter oder Mieter, so haften sie als Gesamtschuldner. 
          Willenserklärungen können gegenüber einem von ihnen abgegeben werden und gelten für alle.
        </div>
      </div>

      <!-- ✅ § 12 VERTRAGSÄNDERUNGEN -->
      <div class="section">
        <div class="section-title">§ 12 Vertragsänderungen</div>
        
        <div class="paragraph">
          Änderungen und Ergänzungen dieses Vertrages bedürfen zu ihrer Wirksamkeit der Schriftform.
        </div>
      </div>

      <!-- ✅ UNTERSCHRIFTEN -->
      <div class="signatures">
        <div class="signature-box">
          <div>Ort, Datum</div>
          <br><br><br>
          <div>Unterschrift Vermieter</div>
          <div style="font-size: 10pt; color: #666; margin-top: 5px;">
            ${formatName(formData, 'landlord')}
          </div>
        </div>
        
        <div class="signature-box">
          <div>Ort, Datum</div>
          <br><br><br>
          <div>Unterschrift Mieter</div>
          <div style="font-size: 10pt; color: #666; margin-top: 5px;">
            ${formatName(formData, 'tenant')}
          </div>
        </div>
      </div>

      <!-- ✅ FOOTER -->
      <div class="footer">
        <div>Erstellt mit PalWorks.de - Professionelle DIY-Verträge</div>
        <div style="margin-top: 5px; font-size: 9pt;">
          Dieser Vertrag wurde nach bestem Wissen erstellt. Für individuelle Rechtsberatung wenden Sie sich an einen Anwalt.
        </div>
      </div>

      <!-- ✅ ADDONS ALS SEPARATE SEITEN -->
      ${hasExplanations ? `
        <div class="page-break">
          <div class="header">
            <div class="title">Rechtliche Erläuterungen</div>
            <div class="subtitle">Zu Ihrem ${contractTitle}</div>
          </div>
          
          <div class="section">
            <div class="section-title">📋 Überblick</div>
            <div class="paragraph">
              Diese Erläuterungen helfen Ihnen, die wichtigsten Punkte Ihres ${contractTitle}s zu verstehen 
              und Ihre Rechte und Pflichten zu kennen.
            </div>
          </div>

          <div class="section">
            <div class="section-title">⚖️ Wichtige Rechte des Vermieters</div>
            <div class="paragraph">
              <strong>Mieterhöhung (§ 4):</strong> Der Vermieter kann die Miete mit 3 Monaten Frist erhöhen, 
              wenn Kostensteigerungen vorliegen. Zwischen Erhöhungen muss mindestens 1 Jahr liegen.
            </div>
            <div class="paragraph">
              <strong>Nutzungskontrolle (§ 5):</strong> Der Vermieter kann die zweckgemäße Nutzung der 
              ${garageType.toLowerCase()} überwachen und bei Verstößen abmahnen oder kündigen.
            </div>
            <div class="paragraph">
              <strong>Kaution (§ 3):</strong> Falls vereinbart, dient die Kaution als Sicherheit für 
              Schäden oder ausstehende Forderungen.
            </div>
          </div>

          <div class="section">
            <div class="section-title">🛡️ Wichtige Rechte des Mieters</div>
            <div class="paragraph">
              <strong>Mietminderung:</strong> Bei erheblichen Mängeln können Sie die Miete angemessen mindern, 
              bis der Mangel behoben ist.
            </div>
            <div class="paragraph">
              <strong>Kündigungsschutz:</strong> Der Vermieter kann nur bei wichtigem Grund (z.B. Eigenbedarf, 
              Vertragsverletzung) außerordentlich kündigen.
            </div>
            <div class="paragraph">
              <strong>Kaution-Rückzahlung:</strong> Die Kaution muss verzinst und nach ordnungsgemäßer 
              Beendigung zurückgezahlt werden.
            </div>
          </div>

          <div class="section">
            <div class="section-title">📝 Praktische Tipps</div>
            <div class="paragraph">
              <strong>Übergabeprotokoll:</strong> Dokumentieren Sie den Zustand der ${garageType.toLowerCase()} 
              bei Übernahme mit Fotos und schriftlichem Protokoll.
            </div>
            <div class="paragraph">
              <strong>Kommunikation:</strong> Wichtige Mitteilungen (Mängel, Kündigungen) sollten 
              immer schriftlich erfolgen.
            </div>
            <div class="paragraph">
              <strong>Versicherung:</strong> Prüfen Sie, ob Ihr Fahrzeug und gelagerte Gegenstände 
              ausreichend versichert sind.
            </div>
          </div>

          <div class="section">
            <div class="section-title">⚠️ Häufige Fallstricke</div>
            <div class="paragraph">
              <strong>Schweigepflicht bei Mängeln:</strong> Melden Sie Schäden sofort - auch kleine! 
              Verschwiegene Mängel können zu Schadensersatzforderungen führen.
            </div>
            <div class="paragraph">
              <strong>Eigenständige Reparaturen:</strong> Führen Sie keine größeren Reparaturen ohne 
              Abstimmung durch - diese könnte der Vermieter ablehnen.
            </div>
            <div class="paragraph">
              <strong>Kündigung:</strong> Beachten Sie die Kündigungsfristen und die Schriftform. 
              Mündliche Kündigungen sind unwirksam.
            </div>
          </div>
        </div>
      ` : ''}

      ${hasProtocol ? `
        <div class="page-break">
          <div class="header">
            <div class="title">Übergabeprotokoll</div>
            <div class="subtitle">Für ${garageType} ${formData.garage_number || '[Nr.]'}</div>
          </div>

          <div class="section">
            <table>
              <tr>
                <th colspan="2">Objektdaten</th>
              </tr>
              <tr>
                <td><strong>Adresse:</strong></td>
                <td>${formatAddress(formData, 'garage')}</td>
              </tr>
              <tr>
                <td><strong>Art:</strong></td>
                <td>${garageType}${formData.garage_number ? ` Nr. ${formData.garage_number}` : ''}</td>
              </tr>
              <tr>
                <td><strong>Übergabedatum:</strong></td>
                <td>_________________</td>
              </tr>
              <tr>
                <td><strong>Übergabezeit:</strong></td>
                <td>_________________</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">🔑 Schlüsselübergabe</div>
            <table>
              <tr>
                <th>Art</th>
                <th>Anzahl übergeben</th>
                <th>Besonderheiten</th>
              </tr>
              <tr>
                <td>Schlüssel</td>
                <td>${formData.garage_keys || '___'}</td>
                <td>_________________</td>
              </tr>
              <tr>
                <td>Fernbedienung</td>
                <td>___</td>
                <td>_________________</td>
              </tr>
              <tr>
                <td>Code/Chip</td>
                <td>___</td>
                <td>_________________</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">🔍 Zustandsprüfung</div>
            <table>
              <tr>
                <th>Bereich</th>
                <th>Zustand</th>
                <th>Mängel/Bemerkungen</th>
              </tr>
              <tr>
                <td>Tor/Eingang</td>
                <td>☐ Gut ☐ Beschädigt</td>
                <td>_________________</td>
              </tr>
              <tr>
                <td>Boden</td>
                <td>☐ Gut ☐ Beschädigt</td>
                <td>_________________</td>
              </tr>
              <tr>
                <td>Wände</td>
                <td>☐ Gut ☐ Beschädigt</td>
                <td>_________________</td>
              </tr>
              ${formData.garage_type === 'garage' ? `
              <tr>
                <td>Decke</td>
                <td>☐ Gut ☐ Beschädigt</td>
                <td>_________________</td>
              </tr>
              ` : ''}
              <tr>
                <td>Beleuchtung</td>
                <td>☐ Funktioniert ☐ Defekt</td>
                <td>_________________</td>
              </tr>
              <tr>
                <td>Stromanschluss</td>
                <td>☐ Vorhanden ☐ Nicht vorhanden</td>
                <td>_________________</td>
              </tr>
              <tr>
                <td>Sonstiges</td>
                <td>☐ Gut ☐ Beschädigt</td>
                <td>_________________</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">📋 Zusätzliche Vereinbarungen</div>
            <div style="min-height: 100px; border: 1px solid #ddd; padding: 10px;">
              _____________________________________________________________________________<br><br>
              _____________________________________________________________________________<br><br>
              _____________________________________________________________________________<br><br>
              _____________________________________________________________________________
            </div>
          </div>

          <div class="signatures" style="margin-top: 40px;">
            <div class="signature-box">
              <div>Unterschrift Vermieter</div>
              <div style="font-size: 10pt; color: #666; margin-top: 5px;">
                ${formatName(formData, 'landlord')}
              </div>
            </div>
            
            <div class="signature-box">
              <div>Unterschrift Mieter</div>
              <div style="font-size: 10pt; color: #666; margin-top: 5px;">
                ${formatName(formData, 'tenant')}
              </div>
            </div>
          </div>
        </div>
      ` : ''}

    </body>
    </html>
  `
}

// ✅ PDF-GENERIERUNG MIT PUPPETEER
export const generateGaragePDF = async (formData, selectedAddons = [], returnType = 'blob') => {
  console.log('🔄 Starte Garagenvertrag-PDF-Generierung...')
  
  let browser = null
  
  try {
    // HTML generieren
    const htmlContent = generateGarageContractHTML(formData, selectedAddons)
    
    // Puppeteer Browser starten
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    })
    
    const page = await browser.newPage()
    
    // HTML-Content setzen
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    // PDF generieren
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      printBackground: true,
      preferCSSPageSize: true
    })
    
    console.log('✅ Garagenvertrag-PDF erfolgreich generiert')
    
    // Return-Type verarbeiten
    switch (returnType) {
      case 'blob':
        return new Blob([pdfBuffer], { type: 'application/pdf' })
      case 'arraybuffer':
        return pdfBuffer
      case 'buffer':
        return Buffer.from(pdfBuffer)
      default:
        return pdfBuffer
    }
    
  } catch (error) {
    console.error('❌ Fehler bei Garagenvertrag-PDF-Generierung:', error)
    throw new Error(`PDF-Generierung fehlgeschlagen: ${error.message}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// ✅ EXPORT-FUNKTION FÜR KOMPATIBILITÄT
export const generateAndReturnGaragePDF = generateGaragePDF

// ✅ DEFAULT EXPORT
export default generateGaragePDF
