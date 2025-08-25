// pages/enterprise/templates.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../../components/shared/Header'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import CustomTemplateBuilder from '../../components/enterprise/CustomTemplateBuilder'
import { USER_ROLES } from '../../lib/supabase'
import { useAuth } from '../../lib/contexts/AuthContext'
import { Plus, FileText, Edit, Trash2, Copy, Eye, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Enterprise Templates Page - Custom Template Management
 * 
 * Features:
 * - Template Library
 * - Template Builder
 * - Template Editor
 * - Template Preview
 * - Template Sharing (Multi-User)
 * - Template Analytics
 */
export default function EnterpriseDashboard() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('library') // library, builder, editor
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      // TODO: Implement API call to fetch custom templates
      const mockTemplates = [
        {
          id: '1',
          name: 'Software-Lizenzvertrag',
          description: 'Für SaaS-Produkte und Software-Lizenzen',
          category: 'software',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          is_active: true,
          usage_count: 12,
          fields: [
            { id: '1', type: 'text', label: 'Software Name', required: true },
            { id: '2', type: 'text', label: 'Lizenztyp', required: true },
            { id: '3', type: 'currency', label: 'Lizenzgebühr', required: true }
          ]
        },
        {
          id: '2',
          name: 'Consulting-Vertrag',
          description: 'Für Beratungsdienstleistungen',
          category: 'consulting',
          created_at: '2024-01-12T14:30:00Z',
          updated_at: '2024-01-12T14:30:00Z',
          is_active: true,
          usage_count: 8,
          fields: [
            { id: '1', type: 'text', label: 'Projektname', required: true },
            { id: '2', type: 'textarea', label: 'Leistungsbeschreibung', required: true },
            { id: '3', type: 'currency', label: 'Stundensatz', required: true }
          ]
        },
        {
          id: '3',
          name: 'NDA Template',
          description: 'Geheimhaltungsvereinbarung',
          category: 'nda',
          created_at: '2024-01-08T09:15:00Z',
          updated_at: '2024-01-08T09:15:00Z',
          is_active: true,
          usage_count: 21,
          fields: [
            { id: '1', type: 'text', label: 'Projektbezeichnung', required: true },
            { id: '2', type: 'date', label: 'Gültigkeitsdauer bis', required: true }
          ]
        }
      ]
      setTemplates(mockTemplates)
    } catch (error) {
      toast.error('Fehler beim Laden der Templates')
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (templateData) => {
    try {
      // TODO: Implement API call to save template
      console.log('Saving template:', templateData)
      
      if (selectedTemplate) {
        // Update existing template
        setTemplates(prev => prev.map(t => 
          t.id === selectedTemplate.id 
            ? { ...t, ...templateData, updated_at: new Date().toISOString() }
            : t
        ))
        toast.success('Template erfolgreich aktualisiert!')
      } else {
        // Create new template
        const newTemplate = {
          ...templateData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          usage_count: 0
        }
        setTemplates(prev => [newTemplate, ...prev])
        toast.success('Template erfolgreich erstellt!')
      }
      
      setActiveView('library')
      setSelectedTemplate(null)
    } catch (error) {
      toast.error('Fehler beim Speichern des Templates')
      console.error('Error saving template:', error)
    }
  }

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setActiveView('builder')
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Template löschen möchten?')) {
      return
    }

    try {
      // TODO: Implement API call to delete template
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      toast.success('Template gelöscht!')
    } catch (error) {
      toast.error('Fehler beim Löschen des Templates')
    }
  }

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicatedTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Kopie)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      }
      setTemplates(prev => [duplicatedTemplate, ...prev])
      toast.success('Template dupliziert!')
    } catch (error) {
      toast.error('Fehler beim Duplizieren des Templates')
    }
  }

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'software', label: 'Software' },
    { value: 'consulting', label: 'Beratung' },
    { value: 'licensing', label: 'Lizenzierung' },
    { value: 'nda', label: 'Geheimhaltung' },
    { value: 'custom', label: 'Custom' }
  ]

  return (
    <ProtectedRoute requiredRole={USER_ROLES.ENTERPRISE}>
      <Head>
        <title>Custom Templates - PalWorks Enterprise</title>
        <meta name="description" content="Verwalten Sie Ihre Custom Templates" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {activeView === 'library' && (
          <>
            {/* Header */}
            <div className="bg-white shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Custom Templates</h1>
                    <p className="text-gray-600 mt-2">
                      Verwalten Sie Ihre benutzerdefinierten Vertragsvorlagen
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null)
                      setActiveView('builder')
                    }}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Neues Template
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Templates durchsuchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="md:w-64">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Templates Grid */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterCategory !== 'all' ? 'Keine Templates gefunden' : 'Noch keine Templates erstellt'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterCategory !== 'all' 
                      ? 'Versuchen Sie andere Suchbegriffe oder Filter'
                      : 'Erstellen Sie Ihr erstes Custom Template'
                    }
                  </p>
                  {(!searchTerm && filterCategory === 'all') && (
                    <button
                      onClick={() => setActiveView('builder')}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                    >
                      Erstes Template erstellen
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleEditTemplate(template)}
                      onDelete={() => handleDeleteTemplate(template.id)}
                      onDuplicate={() => handleDuplicateTemplate(template)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeView === 'builder' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <button
                onClick={() => {
                  setActiveView('library')
                  setSelectedTemplate(null)
                }}
                className="text-purple-600 hover:text-purple-700 flex items-center"
              >
                ← Zurück zur Template-Übersicht
              </button>
            </div>
            
            <CustomTemplateBuilder
              onSave={handleSaveTemplate}
              initialTemplate={selectedTemplate}
            />
          </div>
        )}
      </main>
    </ProtectedRoute>
  )
}

// ===== TEMPLATE CARD COMPONENT =====

function TemplateCard({ template, onEdit, onDelete, onDuplicate }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      software: 'bg-blue-100 text-blue-800',
      consulting: 'bg-green-100 text-green-800',
      licensing: 'bg-purple-100 text-purple-800',
      nda: 'bg-orange-100 text-orange-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.custom
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {template.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {template.description}
            </p>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                {template.category}
              </span>
              <span className="text-xs text-gray-500">
                {template.fields.length} Felder
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>Erstellt: {formatDate(template.created_at)}</span>
          <span>{template.usage_count} mal verwendet</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 flex items-center justify-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Bearbeiten
          </button>
          
          <button
            onClick={onDuplicate}
            className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
            title="Duplizieren"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200 flex items-center justify-center"
            title="Löschen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}