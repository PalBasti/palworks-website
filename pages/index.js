import Head from 'next/head'
import Link from 'next/link'
import { FileText, Users, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Head>
        <title>PalWorks - smarte Verträge & Pals</title>
        <meta name="description" content="Professionelle Rechtsprodukte in Minuten. Vom Anwalt entwickelt, für dich optimiert." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">PalWorks</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#vertraege" className="text-gray-700 hover:text-blue-600">Verträge</a>
              <a href="#preise" className="text-gray-700 hover:text-blue-600">Preise</a>
              <a href="#ueber-uns" className="text-gray-700 hover:text-blue-600">Über uns</a>
              <a href="#kontakt" className="text-gray-700 hover:text-blue-600">Kontakt</a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                PalWorks
                <span className="block text-blue-600">smarte Verträge & Pals</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Professionelle Rechtsprodukte in Minuten. Vom Anwalt entwickelt, rechtssicher und günstig.
              </p>
              <div className="flex justify-center">
                <a href="#vertraege" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                  Jetzt starten <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Warum PalWorks?</h2>
              <p className="text-lg text-gray-600">Rechtssicherheit trifft auf Benutzerfreundlichkeit</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Rechtssicher</h3>
                <p className="text-gray-600">Alle Verträge wurden von einem Anwalt entwickelt und entsprechen dem aktuellen deutschen Recht.</p>
              </div>
              <div className="text-center p-6">
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Blitzschnell</h3>
                <p className="text-gray-600">In wenigen Minuten zum fertigen Vertrag. Kein stundenlanges Recherchieren oder Anwaltsbesuch nötig.</p>
              </div>
              <div className="text-center p-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-gray-600">Werde Teil unserer Pals-Community und tausche dich mit Gleichgesinnten aus.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Verträge */}
        <section id="vertraege" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Unsere Verträge</h2>
              <p className="text-lg text-gray-600">Professionell, rechtssicher und sofort einsetzbar</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Garage Vertrag */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚗</div>
                  <h3 className="text-xl font-semibold mb-2">Garage/Stellplatz</h3>
                  <p className="text-gray-600 text-sm mb-4">Garage oder Stellplatz rechtssicher vermieten</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 7,90 €</div>
                  <Link href="/garage-vertrag" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block">
                    Erstellen
                  </Link>
                </div>
              </div>

              {/* Untermietvertrag - Ganze Wohnung */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold mb-2">Untermietvertrag</h3>
                  <p className="text-gray-600 text-sm mb-4">Ganze Wohnung rechtssicher untervermieten</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 12,90 €</div>
                  <Link href="/untermietvertrag" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block">
                    Erstellen
                  </Link>
                </div>
              </div>

              {/* WG-Untermietvertrag - NEU */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚪</div>
                  <h3 className="text-xl font-semibold mb-2">WG-Untermietvertrag</h3>
                  <p className="text-gray-600 text-sm mb-4">Einzelnes Zimmer in Wohngemeinschaft</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 9,90 €</div>
                  <Link href="/wg-untermietvertrag" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block">
                    Erstellen
                  </Link>
                </div>
              </div>

              {/* Mietvertrag */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏘️</div>
                  <h3 className="text-xl font-semibold mb-2">Mietvertrag</h3>
                  <p className="text-gray-600 text-sm mb-4">Wohnungsmietvertrag nach deutschem Recht</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 9,90 €</div>
                  <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                    Bald verfügbar
                  </button>
                </div>
              </div>

              {/* Arbeitsvertrag */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold mb-2">Arbeitsvertrag</h3>
                  <p className="text-gray-600 text-sm mb-4">Vollzeit, Teilzeit oder Minijob</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 19,90 €</div>
                  <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                    Bald verfügbar
                  </button>
                </div>
              </div>
            </div>

            {/* Zusätzliche Verträge Reihe */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {/* GbR Vertrag */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold mb-2">GbR-Vertrag</h3>
                  <p className="text-gray-600 text-sm mb-4">Gesellschaft bürgerlichen Rechts</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 49,90 €</div>
                  <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                    Bald verfügbar
                  </button>
                </div>
              </div>

              {/* Kaufvertrag */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Kaufvertrag</h3>
                  <p className="text-gray-600 text-sm mb-4">Für bewegliche Sachen</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 14,90 €</div>
                  <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                    Bald verfügbar
                  </button>
                </div>
              </div>

              {/* Leihvertrag */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="text-xl font-semibold mb-2">Leihvertrag</h3>
                  <p className="text-gray-600 text-sm mb-4">Unentgeltliche Gebrauchsüberlassung</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">ab 11,90 €</div>
                  <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                    Bald verfügbar
                  </button>
                </div>
              </div>

              {/* Placeholder für weiteren Vertrag */}
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-lg font-medium mb-2">Weitere Verträge</h3>
                  <p className="text-sm">In Planung...</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Über uns */}
        <section id="ueber-uns" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Über PalWorks</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    PW
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Rechtssicherheit vom Anwalt</h3>
                  <p className="text-gray-700 mb-4">
                    PalWorks wurde von einem erfahrenen Anwalt entwickelt, um dir professionelle Rechtsprodukte 
                    zugänglich zu machen. Alle Verträge entsprechen dem aktuellen deutschen Recht und werden 
                    regelmäßig aktualisiert.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">✓ Anwaltlich geprüft</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">✓ Rechtssicher</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">✓ Regelmäßig aktualisiert</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preise */}
        <section id="preise" className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Transparente Preise</h2>
              <p className="text-lg text-gray-600">Keine versteckten Kosten, keine Abos</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">DIY-Verträge</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">ab 7,90 €</div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Sofortiger PDF-Download</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Rechtssicher & aktuell</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Ausfüllhilfe inklusive</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Premium-Service</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">auf Anfrage</div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Individuelle Anpassungen</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Telefonische Beratung</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Rechtliche Prüfung</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Maßgeschneidert</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">Stundensatz</div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Komplette Neuerstellung</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Persönliche Beratung</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Langfristige Betreuung</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kontakt */}
        <section id="kontakt" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Kontakt</h2>
              <p className="text-lg text-gray-600">Fragen? Wir helfen gerne weiter!</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-lg mb-4">
                E-Mail: <a href="mailto:info@palworks.de" className="text-blue-600 hover:underline">info@palworks.de</a>
              </p>
              <p className="text-gray-600">
                Für individuelle Beratung und maßgeschneiderte Lösungen stehen wir gerne zur Verfügung.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">PalWorks</span>
              </div>
              <p className="text-gray-400 text-sm">
                Smarte Verträge & Pals - Rechtssicherheit für alle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Verträge</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/garage-vertrag" className="hover:text-white">Garage/Stellplatz</Link></li>
                <li><Link href="/untermietvertrag" className="hover:text-white">Untermietvertrag</Link></li>
                <li><Link href="/wg-untermietvertrag" className="hover:text-white">WG-Untermietvertrag</Link></li>
                <li><span className="text-gray-500">Mietvertrag (bald)</span></li>
                <li><span className="text-gray-500">Arbeitsvertrag (bald)</span></li>
                <li><span className="text-gray-500">GbR-Vertrag (bald)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Impressum</a></li>
                <li><a href="#" className="hover:text-white">Datenschutz</a></li>
                <li><a href="#" className="hover:text-white">AGB</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>info@palworks.de</li>
                <li>Rechtssichere Verträge</li>
                <li>Made in Germany</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 PalWorks. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
