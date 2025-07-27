import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, Download, ExternalLink } from 'lucide-react'

export default function GarageVertragErlaeuterungen() {
  return (
    <>
      <Head>
        <title>Rechtliche Erläuterungen zum Garage/Stellplatz-Mietvertrag - PalWorks</title>
        <meta name="description" content="Ausführliche rechtliche Erläuterungen zum Garage- und Stellplatz-Mietvertrag. Vom Anwalt erstellt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/garage-vertrag" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FileText className="h-8 w-8 mr-3" />
              <span className="text-2xl font-bold text-gray-900">PalWorks</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl font-semibold text-gray-900">Rechtliche Erläuterungen</h1>
              <p className="text-sm text-gray-600">Garage/Stellplatz-Mietvertrag</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Erläuterungen zum Garagen-/Stellplatz-Mietvertrag
              </h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Rechtlicher Hinweis:</strong> Diese Erläuterungen dienen der allgemeinen Information und stellen 
                  Standardhinweise dar. Sie ersetzen keine individuelle rechtliche Beratung. Bei spezifischen Fragen oder 
                  besonderen Umständen sollten Sie einen Rechtsanwalt konsultieren.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 space-y-8">

              {/* 1. Rechtliche Einordnung */}
              <section>
              {/* 1. Rechtliche Einordnung */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Rechtliche Einordnung</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Eigenständiger Garagenmietvertrag</h3>
                  <p className="text-gray-700 mb-4">
                    Bei der Vermietung einer Garage oder eines Stellplatzes handelt es sich grundsätzlich <strong>nicht</strong> um 
                    ein Wohnraummietverhältnis, sondern um ein Mietverhältnis über sonstige Räume nach <strong>§ 578 BGB</strong>. 
                    Dies bedeutet:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Flexiblere Kündigungsregelungen</strong> möglich</li>
                    <li><strong>Vereinfachte Mieterhöhungsverfahren</strong> zulässig</li>
                    <li><strong>Geringerer Mieterschutz</strong> als bei Wohnraum</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Verbindung mit Wohnraummietvertrag</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-800 mb-2">Wichtiger Hinweis:</h4>
                    <p className="text-red-700 text-sm">
                      Wird zusätzlich zu einer Wohnung eine Garage oder ein Stellplatz gemietet, kann sich der Schutz des 
                      Wohnraummietrechts auch auf die Garage erstrecken. Dies gilt insbesondere wenn:
                    </p>
                  </div>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Wohnung und Garage sich auf demselben Grundstück befinden</li>
                    <li>Die Verträge zeitgleich abgeschlossen werden</li>
                    <li>Eine wirtschaftliche Einheit vorliegt</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Selbständigkeitsklausel (§ 10 des Vertrags)</h3>
                  <p className="text-blue-800 mb-3">
                    Die im Vertrag enthaltene <strong>Selbständigkeitsklausel</strong> stellt sicher, dass die Garagenvermietung 
                    rechtlich, wirtschaftlich und tatsächlich unabhängig von einer eventuellen Wohnraumvermietung behandelt wird.
                  </p>
                  <p className="text-blue-800 font-medium">Dadurch:</p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1 ml-4 mt-2">
                    <li>Ist eine <strong>getrennte Kündigung</strong> möglich</li>
                    <li>Gelten <strong>vereinfachte Mieterhöhungsverfahren</strong></li>
                    <li>Entfällt der erweiterte Wohnraummieterschutz</li>
                  </ul>
                </div>
              </section>

              {/* 2. Mieterhöhungen */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Mieterhöhungen (§ 4 des Vertrags)</h2>
                <p className="text-gray-700 mb-4">
                  Bei eigenständigen Garagenmietverträgen muss das aufwendige Verfahren nach §§ 558 ff. BGB 
                  (Zustimmungsverfahren bei Wohnraum) <strong>nicht</strong> eingehalten werden. Der Vermieter kann die Miete:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li>Entsprechend der <strong>ortsüblichen Vergleichsmiete</strong> für Garagen/Stellplätze erhöhen</li>
                  <li>Ohne Einhaltung der strengen Wohnraum-Vorschriften</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Wichtig:</strong> Die Erhöhung muss dennoch angemessen und nachvollziehbar sein
                  </p>
                </div>
              </section>

              {/* 3. E-Autos */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Elektrische Fahrzeuge und Ladeinfrastruktur (§ 6 des Vertrags)</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-3">Anspruch auf Wallbox-Installation</h3>
                  <p className="text-gray-700 mb-4">
                    Mieter haben grundsätzlich einen <strong>Anspruch auf Zustimmung</strong> zur Installation einer Ladestation, wenn:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>Keine <strong>berechtigten Interessen</strong> des Vermieters entgegenstehen</li>
                    <li>Die Installation durch einen <strong>anerkannten Fachbetrieb</strong> erfolgt</li>
                  </ul>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">Rechtsgrundlage § 554 Abs. 1 BGB:</h4>
                    <p className="text-green-700 text-sm">
                      Diese Vorschrift gibt Mietern das Recht, vom Vermieter die Zustimmung zu baulichen Veränderungen zu verlangen, 
                      die dem Gebrauch durch Menschen mit Behinderungen, dem Laden elektrisch betriebener Fahrzeuge oder dem 
                      Einbruchschutz dienen.
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">Was Vermieter nicht verweigern dürfen</h3>
                  <p className="text-gray-700 mb-3">Nach aktueller Rechtsprechung sind folgende Ablehnungsgründe <strong>nicht ausreichend</strong>:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Allgemeine Vorbehalte gegen E-Mobilität</li>
                    <li>Unbegründete Furcht vor erhöhter Brandgefahr</li>
                    <li>Pauschale Bedenken wegen Stromversorgung</li>
                  </ul>
                </div>
              </section>

              {/* 4. Kaution */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Kautionsregelung</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Besonderheit bei Garagenmietverträgen:</h3>
                  <p className="text-blue-800 mb-3">
                    Die Beschränkungen des § 551 BGB (maximale Kaution bei Wohnraum) gelten <strong>nicht</strong> für 
                    eigenständige Garagenmietverträge. Dies bedeutet:
                  </p>
                  <ul className="list-disc list-inside text-blue-700 space-y-2 ml-4">
                    <li><strong>Freie Vereinbarung</strong> der Kautionshöhe möglich</li>
                    <li>Keine Begrenzung auf drei Monatsmieten</li>
                    <li><strong>Üblich:</strong> Ein bis zwei Monatsmieten als angemessen</li>
                  </ul>
                </div>
              </section>

              {/* 5. Umsatzsteuer */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Umsatzsteuerliche Behandlung</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">Grundsätzliche Steuerpflicht</h3>
                  <p className="text-gray-700 mb-4">
                    Die Vermietung von Garagen und Stellplätzen ist nach <strong>§ 4 Nr. 12 S. 2 UStG grundsätzlich umsatzsteuerpflichtig</strong>.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-3">Ausnahme: Nebenleistung zu Wohnraumvermietung</h3>
                  <p className="text-green-800 mb-3">
                    <strong>Umsatzsteuerfrei</strong> kann die Garagenvermietung sein, wenn sie:
                  </p>
                  <ul className="list-disc list-inside text-green-700 space-y-2 ml-4 mb-3">
                    <li><strong>Nebenleistung</strong> zu einer umsatzsteuerfreien Wohnraumvermietung darstellt</li>
                    <li><strong>Räumlicher Zusammenhang</strong> zwischen Wohnung und Garage besteht</li>
                    <li><strong>Dieselben Vertragspartner</strong> beteiligt sind</li>
                  </ul>
                  <p className="text-green-700 text-sm">
                    <strong>Hinweis:</strong> Getrennte Verträge schädigen die Annahme einer Nebenleistung nicht automatisch.
                  </p>
                </div>
              </section>

              {/* 6. Praktische Hinweise */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Praktische Hinweise</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Bei der Vertragsgestaltung beachten</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
                      <li><strong>Klare Bezeichnung</strong> der Garage/des Stellplatzes</li>
                      <li><strong>Eindeutige Abgrenzung</strong> zu eventuellen Wohnraummietverträgen</li>
                      <li><strong>Realistische Kündigungsfristen</strong> vereinbaren</li>
                      <li><strong>Angemessene Nutzungsregelungen</strong> festlegen</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Dokumentation</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
                      <li><strong>Übergabeprotokoll</strong> bei Mietbeginn erstellen</li>
                      <li><strong>Zustand der Garage/des Stellplatzes</strong> dokumentieren</li>
                      <li><strong>Schlüsselübergabe</strong> schriftlich festhalten</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Besondere Situationen</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Bei <strong>mehreren Mietern</strong>: Beachtung der Gesamtschuldnerschaft</li>
                    <li>Bei <strong>Untervermietung</strong>: Zustimmungspflicht beachten</li>
                    <li>Bei <strong>Vertragsende</strong>: Vollständige Rückgabe aller Zugangsmittel</li>
                  </ul>
                </div>
              </section>

              {/* 7. Rechtsgrundlagen */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Wichtige Rechtsgrundlagen</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>§ 578 BGB:</strong> Miete über sonstige Sachen</p>
                      <p><strong>§ 554 BGB:</strong> Bauliche Veränderungen durch den Mieter</p>
                      <p><strong>§ 573 BGB:</strong> Ordentliche Kündigung bei Wohnraum</p>
                    </div>
                    <div>
                      <p><strong>§§ 558 ff. BGB:</strong> Mieterhöhung bei Wohnraum</p>
                      <p><strong>§ 4 Nr. 12 UStG:</strong> Umsatzsteuerliche Behandlung</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Rechtlicher Hinweis */}
              <section className="border-t pt-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Rechtlicher Hinweis</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    Diese Erläuterungen basieren auf der aktuellen Rechtslage und Rechtsprechung (Stand: Juli 2025). 
                    Sie dienen der allgemeinen Information und ersetzen keine individuelle rechtliche Beratung. Bei komplexen 
                    Sachverhalten, besonderen Umständen oder rechtlichen Unsicherheiten empfehlen wir ausdrücklich die 
                    Konsultation eines spezialisierten Rechtsanwalts und/oder Steuerberaters.
                  </p>
                  
                  <div className="bg-yellow-100 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm font-medium mb-2">Wichtiger Hinweis:</p>
                    <p className="text-yellow-700 text-sm">
                      Es besteht keine Verpflichtung seitens PalWorks, über Änderungen der Rechtslage zu informieren oder bereits 
                      erstellte Verträge nachträglich zu aktualisieren. Die Nutzer sind selbst dafür verantwortlich, sich über 
                      eventuelle Gesetzesänderungen oder neue Rechtsprechung zu informieren und gegebenenfalls ihre Verträge 
                      entsprechend anzupassen.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="bg-blue-600 text-white p-6 text-center">
              <p className="text-sm opacity-90 mb-4">
                <em>Erstellt als Beilage zum PalWorks Garagen-/Stellplatz-Mietvertrag</em>
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/garage-vertrag" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Zurück zum Vertrag
                </Link>
                <button 
                  onClick={() => window.print()} 
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Als PDF drucken
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
