// components/enterprise/CustomTemplateBuilder.js
import React, { useState } from 'react'
import { Plus, Minus, Save, Eye, FileText, Type, Calendar, User, Building, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Custom Template Builder - Enterprise Feature
 * 
 * Features:
 * - Drag & Drop Interface
 * - Form Field Types
 * - PDF Layout Preview
 * - Template Validation
 * - Save & Share Templates
 */

const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email', 
  NUMBER: 'number',
  DATE: 'date',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  SIGNATURE: 'signature',
  CURRENCY: 'currency',
  ADDRESS: 'address'
}

const FIELD_ICONS = {
  [FIELD_TYPES.TEXT]: Type,
  [FIELD_TYPES.EMAIL]: User,
  [FIELD_TYPES.NUMBER]: FileText,
  [FIELD_TYPES.DATE]: Calendar,
  [FIELD_TYPES.TEXTAREA]: FileText,
  [FIELD_TYPES.SELECT]: FileText,
  [FIELD_TYPES.CHECKBOX]: FileText,
  [FIELD_TYPES.SIGNATURE]: User,
  [FIELD_TYPES.CURRENCY]: DollarSign,
  [FIELD_TYPES.ADDRESS]: Building
}

export default function CustomTemplateBuilder({ onSave, initialTemplate = null }) {
  const [template, setTemplate] = useState(initialTemplate || {
    name: '',
    description: '',
    category: 'custom',
    fields: [],
    pdfLayout: {
      header: '',
      footer: '',
      styling: {
        fontSize: 12,
        fontFamily: 'Arial',
        lineHeight: 1.5
      }
    }
  })

  const [activeTab, setActiveTab] = useState('fields')
  const [previewMode, setPreviewMode] = useState(false)

  // ===== FIELD MANAGEMENT =====

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `Neues ${getFieldTypeName(type)} Feld`,
      name: `field_${Date.now()}`,
      required: false,
      placeholder: '',
      validation: {},
      options: type === FIELD_TYPES.SELECT ? ['Option 1', 'Option 2'] : undefined
    }

    setTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId, updates) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const moveField = (fieldId, direction) => {
    setTemplate(prev => {
      const fields = [...prev.fields]
      const index = fields.findIndex(f => f.id === fieldId)
      
      if (direction === 'up' && index > 0) {
        [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]]
      } else if (direction === 'down' && index < fields.length - 1) {
        [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]]
      }
      
      return { ...prev, fields }
    })
  }

  // ===== TEMPLATE MANAGEMENT =====

  const handleSave = async () => {
    if (!template.name.trim()) {
      toast.error('Bitte geben Sie einen Template-Namen ein')
      return
    }

    if (template.fields.length === 0) {
      toast.error('Template muss mindestens ein Feld enthalten')
      return
    }

    try {
      await onSave(template)
      toast.success('Template erfolgreich gespeichert!')
    } catch (error) {
      toast.error('Fehler beim Speichern des Templates')
      console.error('Save error:', error)
    }
  }

  // ===== UTILITY FUNCTIONS =====

  const getFieldTypeName = (type) => {
    const names = {
      [FIELD_TYPES.TEXT]: 'Text',
      [FIELD_TYPES.EMAIL]: 'E-Mail',
      [FIELD_TYPES.NUMBER]: 'Zahl',
      [FIELD_TYPES.DATE]: 'Datum',
      [FIELD_TYPES.TEXTAREA]: 'Textbereich',
      [FIELD_TYPES.SELECT]: 'Auswahl',
      [FIELD_TYPES.CHECKBOX]: 'Checkbox',
      [FIELD_TYPES.SIGNATURE]: 'Unterschrift',
      [FIELD_TYPES.CURRENCY]: 'Währung',
      [FIELD_TYPES.ADDRESS]: 'Adresse'
    }
    return names[type] || type
  }

  if (previewMode) {
    return <TemplatePreview template={template} onClose={() => setPreviewMode(false)} />
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Custom Template Builder</h2>
        <p className="text-purple-100">Erstellen Sie Ihre eigene Vertragsvorlage</p>
      </div>

      {/* Template Info */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="z.B. Software-Lizenzvertrag"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie
            </label>
            <select
              value={template.category}
              onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="custom">Custom</option>
              <option value="software">Software</option>
              <option value="consulting">Beratung</option>
              <option value="licensing">Lizenzierung</option>
              <option value="nda">Geheimhaltung</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beschreibung
          </label>
          <textarea
            value={template.description}
            onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Beschreiben Sie wofür dieses Template verwendet wird..."
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('fields')}
            className={`py-4 font-medium text-sm border-b-2 ${
              activeTab === 'fields'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Felder
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`py-4 font-medium text-sm border-b-2 ${
              activeTab === 'layout'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            PDF Layout
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'fields' && (
          <FieldBuilder
            fields={template.fields}
            onAddField={addField}
            onUpdateField={updateField}
            onRemoveField={removeField}
            onMoveField={moveField}
          />
        )}

        {activeTab === 'layout' && (
          <LayoutBuilder
            layout={template.pdfLayout}
            onUpdateLayout={(updates) => setTemplate(prev => ({
              ...prev,
              pdfLayout: { ...prev.pdfLayout, ...updates }
            }))}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {template.fields.length} Felder definiert
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== FIELD BUILDER COMPONENT =====

function FieldBuilder({ fields, onAddField, onUpdateField, onRemoveField, onMoveField }) {
  return (
    <div className="space-y-6">
      {/* Field Type Selector */}
      <div>
        <h3 className="text-lg font-medium mb-4">Neues Feld hinzufügen</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(FIELD_TYPES).map(type => {
            const Icon = FIELD_ICONS[type]
            return (
              <button
                key={type}
                onClick={() => onAddField(type)}
                className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Icon className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium">{getFieldTypeName(type)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Field List */}
      <div>
        <h3 className="text-lg font-medium mb-4">Template Felder ({fields.length})</h3>
        
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Noch keine Felder hinzugefügt. Wählen Sie einen Feldtyp oben aus.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <FieldEditor
                key={field.id}
                field={field}
                index={index}
                totalFields={fields.length}
                onUpdate={(updates) => onUpdateField(field.id, updates)}
                onRemove={() => onRemoveField(field.id)}
                onMove={(direction) => onMoveField(field.id, direction)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ===== FIELD EDITOR COMPONENT =====

function FieldEditor({ field, index, totalFields, onUpdate, onRemove, onMove }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = FIELD_ICONS[field.type]

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Field Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-gray-600" />
          <div>
            <h4 className="font-medium">{field.label}</h4>
            <p className="text-sm text-gray-500">{getFieldTypeName(field.type)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Move buttons */}
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ↑
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === totalFields - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ↓
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
          >
            {isExpanded ? 'Zuklappen' : 'Bearbeiten'}
          </button>
          
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
          >
            Löschen
          </button>
        </div>
      </div>

      {/* Field Configuration */}
      {isExpanded && (
        <div className="p-4 border-t space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label *
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feld Name
              </label>
              <input
                type="text"
                value={field.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platzhalter Text
            </label>
            <input
              type="text"
              value={field.placeholder}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Platzhalter für das Eingabefeld..."
            />
          </div>

          {field.type === FIELD_TYPES.SELECT && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auswahloptionen (eine pro Zeile)
              </label>
              <textarea
                value={field.options?.join('\n') || ''}
                onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(o => o.trim()) })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Pflichtfeld
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== LAYOUT BUILDER COMPONENT =====

function LayoutBuilder({ layout, onUpdateLayout }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">PDF Layout Konfiguration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header Text
            </label>
            <textarea
              value={layout.header}
              onChange={(e) => onUpdateLayout({ header: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Text für den Kopfbereich des PDFs..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Text
            </label>
            <textarea
              value={layout.footer}
              onChange={(e) => onUpdateLayout({ footer: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Text für den Fußbereich des PDFs..."
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schriftgröße
            </label>
            <input
              type="number"
              value={layout.styling.fontSize}
              onChange={(e) => onUpdateLayout({
                styling: { ...layout.styling, fontSize: parseInt(e.target.value) }
              })}
              min="8"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schriftart
            </label>
            <select
              value={layout.styling.fontFamily}
              onChange={(e) => onUpdateLayout({
                styling: { ...layout.styling, fontFamily: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zeilenhöhe
            </label>
            <input
              type="number"
              value={layout.styling.lineHeight}
              onChange={(e) => onUpdateLayout({
                styling: { ...layout.styling, lineHeight: parseFloat(e.target.value) }
              })}
              min="1"
              max="3"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== TEMPLATE PREVIEW COMPONENT =====

function TemplatePreview({ template, onClose }) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-bold">Vorschau: {template.name}</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Schließen
        </button>
      </div>
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {template.fields.map(field => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {/* Render field based on type */}
              {field.type === FIELD_TYPES.TEXTAREA ? (
                <textarea
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              ) : field.type === FIELD_TYPES.SELECT ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                >
                  <option>{field.placeholder || 'Wählen Sie eine Option'}</option>
                  {field.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === FIELD_TYPES.CHECKBOX ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    disabled
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">{field.placeholder}</span>
                </div>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getFieldTypeName(type) {
  const names = {
    text: 'Text',
    email: 'E-Mail',
    number: 'Zahl',
    date: 'Datum',
    textarea: 'Textbereich',
    select: 'Auswahl',
    checkbox: 'Checkbox',
    signature: 'Unterschrift',
    currency: 'Währung',
    address: 'Adresse'
  }
  return names[type] || type
}