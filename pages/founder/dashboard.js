// pages/founder/dashboard.js
import Head from 'next/head'
import Header from '../../components/shared/Header'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { USER_ROLES } from '../../lib/supabase'
import { useAuth } from '../../lib/contexts/AuthContext'
import { Crown, FileText, TrendingUp, Clock, DollarSign, Users, Star } from 'lucide-react'

/**
 * Founder Dashboard - Exklusiver Bereich für Founder Tier
 * 
 * Features:
 * - Erweiterte Template Bibliothek
 * - Vergünstigte Preise
 * - Priority Support
 * - Usage Analytics
 * - Quick Actions
 */
export default function FounderDashboard() {
  const { user, profile } = useAuth()

  return (
    <ProtectedRoute requiredRole={USER_ROLES.FOUNDER}>
      <Head>
        <title>Founder Dashboard - PalWorks</title>
        <meta name="description" content="Exklusiver Founder Bereich mit erweiterten Features" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-8 w-8 text-white mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Founder Dashboard
              </h1>
            </div>
            <p className="text-center text-yellow-100 text-lg">
              Willkommen zurück, {user?.user_metadata?.first_name || 'Founder'}! 
              Nutzen Sie Ihre exklusiven Founder-Features.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Verträge erstellt</p>
                  <p className="text-2xl font-semibold text-gray-900">47</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Gespart (vs. Normal)</p>
                  <p className="text-2xl font-semibold text-gray-900">€127,50</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Founder Tier</p>
                  <p className="text-2xl font-semibold text-gray-900">Aktiv</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Standard Contracts mit Founder Preisen */}
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">Untermietvertrag</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Rechtssichere Untervermietung
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="line-through text-gray-400">€19,99</span>
                          <span className="text-yellow-600 font-semibold ml-2">€14,99</span>
                        </div>
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm">
                          Erstellen
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">Garagenvertrag</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Garage/Stellplatz vermieten
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="line-through text-gray-400">€14,99</span>
                          <span className="text-yellow-600 font-semibold ml-2">€9,99</span>
                        </div>
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm">
                          Erstellen
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">WG-Untermietvertrag</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Speziell für WG-Zimmer
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="line-through text-gray-400">€17,99</span>
                          <span className="text-yellow-600 font-semibold ml-2">€12,99</span>
                        </div>
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm">
                          Erstellen
                        </button>
                      </div>
                    </div>

                    {/* Founder Exclusive Template */}
                    <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-2">
                        <Crown className="h-4 w-4 text-yellow-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Gewerbemietvertrag</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Exklusiv für Founder - Gewerberäume
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-yellow-600 font-semibold">€24,99</span>
                        </div>
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm">
                          Erstellen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Untermietvertrag erstellt</p>
                        <p className="text-xs text-gray-500">vor 2 Stunden</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Garagenvertrag erstellt</p>
                        <p className="text-xs text-gray-500">gestern</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Crown className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Founder Tier aktiviert</p>
                        <p className="text-xs text-gray-500">vor 3 Tagen</p>
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
                  <h2 className="text-lg font-semibold text-gray-900">Ihr Abonnement</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Crown className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900">Founder Tier</p>
                      <p className="text-sm text-gray-500">€29,99/Monat</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      25% Rabatt auf alle Verträge
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Exklusive Vorlagen
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Priority Support
                    </div>
                  </div>

                  <button className="w-full mt-4 text-yellow-600 border border-yellow-600 py-2 px-4 rounded hover:bg-yellow-50 text-sm">
                    Abonnement verwalten
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Priority Support</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Als Founder haben Sie Zugang zu unserem Priority Support mit garantierter Antwortzeit von unter 4 Stunden.
                  </p>
                  <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 text-sm">
                    Support kontaktieren
                  </button>
                </div>
              </div>

              {/* Upgrade Hint */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow p-6 text-white">
                <div className="flex items-center mb-3">
                  <Building className="h-6 w-6 mr-2" />
                  <h3 className="font-semibold">Enterprise Features</h3>
                </div>
                <p className="text-sm text-purple-100 mb-4">
                  Benötigen Sie Custom Templates oder Multi-User Accounts? Upgraden Sie zu Enterprise.
                </p>
                <button className="w-full bg-white text-purple-600 py-2 px-4 rounded hover:bg-purple-50 text-sm font-medium">
                  Enterprise ansehen
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}