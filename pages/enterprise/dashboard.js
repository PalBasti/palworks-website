// pages/enterprise/dashboard.js
import Head from 'next/head'
import Header from '../../components/shared/Header'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { USER_ROLES } from '../../lib/supabase'
import { useAuth } from '../../lib/contexts/AuthContext'
import { 
  Building, 
  FileText, 
  Users, 
  BarChart3, 
  Calendar, 
  Settings, 
  Plus,
  TrendingUp,
  Clock,
  Shield,
  Palette
} from 'lucide-react'

/**
 * Enterprise Dashboard - Exklusiver Bereich für Enterprise Tier
 * 
 * Features:
 * - Custom Template Management
 * - Multi-User Company Accounts
 * - Usage Analytics
 * - Legal Consultation Booking
 * - White-Label Settings
 * - Team Management
 */
export default function EnterpriseDashboard() {
  const { user, profile } = useAuth()

  return (
    <ProtectedRoute requiredRole={USER_ROLES.ENTERPRISE}>
      <Head>
        <title>Enterprise Dashboard - PalWorks</title>
        <meta name="description" content="Exklusiver Enterprise Bereich mit allen Features" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center mb-6">
              <Building className="h-8 w-8 text-white mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Enterprise Dashboard
              </h1>
            </div>
            <p className="text-center text-purple-100 text-lg">
              Willkommen zurück, {user?.user_metadata?.first_name || 'Enterprise User'}! 
              Nutzen Sie alle Enterprise-Features für Ihr Unternehmen.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Verträge (30 Tage)</p>
                  <p className="text-2xl font-semibold text-gray-900">142</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Team Mitglieder</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Custom Templates</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Beratungen</p>
                  <p className="text-2xl font-semibold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="border-2 border-dashed border-purple-300 rounded-lg p-6 hover:border-purple-400 hover:bg-purple-50 transition-colors text-center">
                      <Plus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">Custom Template erstellen</p>
                      <p className="text-sm text-gray-500">Eigene Vertragsvorlage designen</p>
                    </button>

                    <button className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
                      <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">Rechtsberatung buchen</p>
                      <p className="text-sm text-gray-500">Termin mit Anwalt vereinbaren</p>
                    </button>

                    <button className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">Team verwalten</p>
                      <p className="text-sm text-gray-500">Mitarbeiter hinzufügen/entfernen</p>
                    </button>

                    <button className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-center">
                      <Palette className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">White-Label Setup</p>
                      <p className="text-sm text-gray-500">Branding anpassen</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Templates */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Ihre Custom Templates</h2>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Vorlage
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">Software-Lizenzvertrag</h3>
                          <p className="text-sm text-gray-600">Speziell für SaaS-Produkte</p>
                          <p className="text-xs text-gray-400 mt-1">Erstellt am 15. Jan 2024</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                            Verwenden
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">Consulting-Vertrag</h3>
                          <p className="text-sm text-gray-600">Für Beratungsdienstleistungen</p>
                          <p className="text-xs text-gray-400 mt-1">Erstellt am 12. Jan 2024</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                            Verwenden
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">NDA Template</h3>
                          <p className="text-sm text-gray-600">Geheimhaltungsvereinbarung</p>
                          <p className="text-xs text-gray-400 mt-1">Erstellt am 08. Jan 2024</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                            Verwenden
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Analytics */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Usage Analytics</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Verträge pro Monat</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Januar 2024</span>
                          <span className="font-semibold">142</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Dezember 2023</span>
                          <span className="font-semibold">98</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>November 2023</span>
                          <span className="font-semibold">76</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Beliebte Templates</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Software-Lizenz</span>
                          <span className="font-semibold">45</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Consulting</span>
                          <span className="font-semibold">32</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>NDA</span>
                          <span className="font-semibold">21</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Subscription Info */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Enterprise Plan</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Building className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Enterprise Tier</p>
                      <p className="text-sm text-gray-500">€99,99/Monat</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Unlimited Custom Templates
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Multi-User Accounts
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Legal Consultation
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      White-Label Branding
                    </div>
                  </div>

                  <button className="w-full mt-4 text-purple-600 border border-purple-600 py-2 px-4 rounded hover:bg-purple-50 text-sm">
                    Plan verwalten
                  </button>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Team</h2>
                  <button className="text-purple-600 hover:text-purple-700">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        JD
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">John Doe</p>
                        <p className="text-xs text-gray-500">Admin</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        SM
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Sarah Miller</p>
                        <p className="text-xs text-gray-500">Manager</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        MB
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Mike Brown</p>
                        <p className="text-xs text-gray-500">Member</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 text-purple-600 border border-purple-600 py-2 px-4 rounded hover:bg-purple-50 text-sm">
                    Team verwalten
                  </button>
                </div>
              </div>

              {/* Legal Consultation */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Rechtsberatung</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-6 w-6 text-orange-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Nächster Termin</p>
                      <p className="text-sm text-gray-500">25. Jan, 14:00 Uhr</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Als Enterprise Kunde haben Sie Zugang zu persönlicher Rechtsberatung.
                  </p>

                  <button className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 text-sm">
                    Termin buchen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}