"use client";

import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Check, 
  X, 
  Plus, 
  ExternalLink,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import TemplateGallery from "./TemplateGallery";
import { IntegrationTemplate } from "@/lib/integrations/templates";

interface Spreadsheet {
  id: string;
  name: string;
  url: string;
  lastModified: string;
  owner: string;
  size: number;
}

interface GoogleAccount {
  id: string;
  email: string;
  avatar?: string;
  isActive: boolean;
}

interface FieldMapping {
  sheetColumn: string;
  targetField: string;
  required: boolean;
  dataType?: string;
}

interface IntegrationMapperProps {
  onSave?: (mapping: any) => void;
  onCancel?: () => void;
  existingMapping?: any;
  saving?: boolean;
}

export default function IntegrationMapper({ 
  onSave, 
  onCancel, 
  existingMapping,
  saving = false
}: IntegrationMapperProps) {
  // State management
  const [step, setStep] = useState(0); // Start with template selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  
  // Step 1: Source Selection
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<Spreadsheet | null>(null);
  const [selectedRange, setSelectedRange] = useState("Sheet1!A:Z");
  
  // Step 2: Target Selection  
  const [selectedTarget, setSelectedTarget] = useState<{
    type: string;
    entity: string;
  } | null>(null);
  
  // Step 3: Field Mapping
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // Step 4: Configuration
  const [config, setConfig] = useState({
    name: "",
    syncFrequency: "hourly",
    triggerType: "schedule",
    direction: "one-way"
  });

  // Available target systems
  const targetSystems = [
    {
      type: "quickbooks",
      name: "QuickBooks Online",
      icon: "/quickbooks.png",
      entities: [
        { value: "Invoice", label: "Invoices", requiredFields: ["Customer", "Amount", "Date"] },
        { value: "Customer", label: "Customers", requiredFields: ["Name", "Email"] },
        { value: "Item", label: "Items", requiredFields: ["Name", "Price"] }
      ]
    },
    {
      type: "hubspot",
      name: "HubSpot",
      icon: "/hubspot.png",
      entities: [
        { value: "Contact", label: "Contacts", requiredFields: ["Email", "First Name"] },
        { value: "Deal", label: "Deals", requiredFields: ["Deal Name", "Amount"] },
        { value: "Company", label: "Companies", requiredFields: ["Company Name"] }
      ]
    },
    {
      type: "salesforce",
      name: "Salesforce",
      icon: "/salesforce.png",
      entities: [
        { value: "Lead", label: "Leads", requiredFields: ["Email", "FirstName", "LastName"] },
        { value: "Contact", label: "Contacts", requiredFields: ["Email", "FirstName", "LastName"] },
        { value: "Opportunity", label: "Opportunities", requiredFields: ["Name", "Amount"] }
      ]
    }
  ];

  // Load spreadsheets on component mount
  useEffect(() => {
    fetchSpreadsheets();
  }, []);

  // Load sheet headers when spreadsheet is selected
  useEffect(() => {
    if (selectedSpreadsheet) {
      fetchSheetHeaders();
    }
  }, [selectedSpreadsheet, selectedRange]);

  // Initialize field mappings when headers are loaded
  useEffect(() => {
    if (sheetHeaders.length > 0 && selectedTarget) {
      initializeFieldMappings();
    }
  }, [sheetHeaders, selectedTarget]);

  const fetchSpreadsheets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/googlesheets/spreadsheets');
      const data = await response.json();
      
      if (data.success) {
        setSpreadsheets(data.data);
      } else {
        setError(data.error || 'Failed to load spreadsheets');
      }
    } catch (err) {
      setError('Failed to load spreadsheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchSheetHeaders = async () => {
    if (!selectedSpreadsheet || !selectedRange) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/googlesheets/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: selectedSpreadsheet.id,
          range: selectedRange
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        // Use first row as headers
        const headers = data.data[0];
        setSheetHeaders(headers);
        
        // Store preview data (first 3 rows)
        setPreviewData(data.data.slice(0, 3));
      } else {
        setError('No data found in selected range');
      }
    } catch (err) {
      setError('Failed to read sheet data');
    } finally {
      setLoading(false);
    }
  };

  const initializeFieldMappings = () => {
    if (!selectedTarget) return;
    
    const selectedSystem = targetSystems.find(s => s.type === selectedTarget.type);
    const selectedEntity = selectedSystem?.entities.find(e => e.value === selectedTarget.entity);
    
    if (!selectedEntity) return;
    
    // Initialize mappings with auto-suggestions
    const mappings: FieldMapping[] = sheetHeaders.map(header => {
      const suggestedField = autoSuggestField(header, selectedEntity.requiredFields);
      return {
        sheetColumn: header,
        targetField: suggestedField || "",
        required: selectedEntity.requiredFields.includes(suggestedField || ""),
        dataType: "string"
      };
    }).filter(mapping => mapping.sheetColumn); // Only include mappings with valid sheet columns
    
    setFieldMappings(mappings);
  };

  const autoSuggestField = (columnName: string, requiredFields: string[]): string | null => {
    const column = columnName.toLowerCase();
    
    // Direct matches
    if (column.includes('email')) return requiredFields.find(f => f.toLowerCase().includes('email')) || null;
    if (column.includes('name')) return requiredFields.find(f => f.toLowerCase().includes('name')) || null;
    if (column.includes('amount')) return requiredFields.find(f => f.toLowerCase().includes('amount')) || null;
    if (column.includes('date')) return requiredFields.find(f => f.toLowerCase().includes('date')) || null;
    if (column.includes('phone')) return requiredFields.find(f => f.toLowerCase().includes('phone')) || null;
    
    return null;
  };

  const handleSave = async () => {
    if (!selectedSpreadsheet || !selectedTarget || !config.name) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const mappingData = {
        name: config.name,
        sourceSpreadsheetId: selectedSpreadsheet.id,
        sourceRange: selectedRange,
        targetType: selectedTarget.type,
        targetEntity: selectedTarget.entity,
        fieldMappings: fieldMappings.filter(m => m.targetField),
        syncFrequency: config.syncFrequency,
        triggerType: config.triggerType
      };
      
      const response = await fetch('/api/integrations/googlesheets/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onSave?.(data.data);
      } else {
        setError(data.error || 'Failed to create integration');
      }
    } catch (err) {
      setError('Failed to create integration');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 0:
        return selectedTemplate || step > 0; // Can proceed if template selected or moving forward
      case 1:
        return selectedSpreadsheet && selectedRange.trim() !== "";
      case 2:
        return selectedTarget;
      case 3:
        return fieldMappings.some(m => m.targetField && m.sheetColumn);
      case 4:
        return config.name.trim() !== "" && validateRequiredFields();
      default:
        return false;
    }
  };

  const validateRequiredFields = () => {
    if (!selectedTarget) return false;
    
    const selectedSystem = targetSystems.find(s => s.type === selectedTarget.type);
    const selectedEntity = selectedSystem?.entities.find(e => e.value === selectedTarget.entity);
    
    if (!selectedEntity) return false;
    
    // Check if all required fields are mapped
    const mappedFields = fieldMappings
      .filter(m => m.targetField && m.sheetColumn)
      .map(m => m.targetField);
    
    return selectedEntity.requiredFields.every(requiredField => 
      mappedFields.includes(requiredField)
    );
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (step === 1) {
      if (!selectedSpreadsheet) errors.push("Please select a spreadsheet");
      if (!selectedRange.trim()) errors.push("Please specify a range");
    }
    
    if (step === 2) {
      if (!selectedTarget) errors.push("Please select a target system and entity");
    }
    
    if (step === 3) {
      if (!fieldMappings.some(m => m.targetField && m.sheetColumn)) {
        errors.push("Please map at least one field");
      }
      
      if (selectedTarget) {
        const selectedSystem = targetSystems.find(s => s.type === selectedTarget.type);
        const selectedEntity = selectedSystem?.entities.find(e => e.value === selectedTarget.entity);
        
        if (selectedEntity) {
          const mappedFields = fieldMappings
            .filter(m => m.targetField && m.sheetColumn)
            .map(m => m.targetField);
          
          const missingRequired = selectedEntity.requiredFields.filter(
            requiredField => !mappedFields.includes(requiredField)
          );
          
          if (missingRequired.length > 0) {
            errors.push(`Missing required fields: ${missingRequired.join(", ")}`);
          }
        }
      }
    }
    
    if (step === 4) {
      if (!config.name.trim()) errors.push("Please enter an integration name");
      if (!validateRequiredFields()) errors.push("Not all required fields are mapped");
    }
    
    return errors;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {[0, 1, 2, 3, 4].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= stepNum 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step > stepNum ? <Check className="w-5 h-5" /> : stepNum + 1}
          </div>
          {stepNum < 4 && (
            <div className={`w-20 h-1 mx-3 ${
              step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep0 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Integration Type</h3>
        <p className="text-sm text-gray-600 mb-4">Start with a template or create a custom integration from scratch</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setShowTemplateGallery(true)}
          className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Use Template
              </h4>
              <p className="text-sm text-gray-600">Quick setup with pre-built integrations</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Choose from pre-configured templates for common integrations like QuickBooks, HubSpot, and Salesforce. 
            Templates include field mappings, sample data, and setup instructions.
          </p>
        </button>
        
        <button
          onClick={() => setStep(1)}
          className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Plus className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                Custom Integration
              </h4>
              <p className="text-sm text-gray-600">Build from scratch with full control</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Create a completely custom integration by selecting your own source, target, and field mappings. 
            Perfect for unique business requirements.
          </p>
        </button>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Source Spreadsheet</h3>
        <p className="text-sm text-gray-600 mb-4">Choose the Google Sheet you want to sync data from</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spreadsheet
          </label>
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
            {spreadsheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setSelectedSpreadsheet(sheet)}
                className={`p-4 border rounded-lg text-left hover:border-blue-300 transition-colors ${
                  selectedSpreadsheet?.id === sheet.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sheet.name}</p>
                    <p className="text-sm text-gray-600">
                      Modified {new Date(sheet.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Range to Sync
          </label>
          <input
            type="text"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            placeholder="e.g., Sheet1!A:Z"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Specify which range of cells to sync (e.g., Sheet1!A:Z, Sheet1!A1:D100)
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Target System</h3>
        <p className="text-sm text-gray-600 mb-4">Choose where you want to sync the data to</p>
      </div>
      
      <div className="space-y-4">
        {targetSystems.map((system) => (
          <div key={system.type} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src={system.icon} alt={system.name} className="w-8 h-8" />
              <h4 className="font-medium text-gray-900">{system.name}</h4>
            </div>
            
            <div className="space-y-2">
              {system.entities.map((entity) => (
                <button
                  key={entity.value}
                  onClick={() => setSelectedTarget({ type: system.type, entity: entity.value })}
                  className={`w-full p-3 text-left border rounded-lg hover:border-blue-300 transition-colors ${
                    selectedTarget?.type === system.type && selectedTarget?.entity === entity.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{entity.label}</p>
                      <p className="text-sm text-gray-600">
                        Required: {entity.requiredFields.join(", ")}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Fields</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your spreadsheet columns to the target system fields
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Preview Data</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {sheetHeaders.map((header, index) => (
                    <th key={index} className="px-3 py-2 text-left font-medium text-gray-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-3 py-2 text-gray-600">
                        {cell || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Field Mappings</h4>
            <button
              onClick={() => {
                const newMappings = [...fieldMappings, {
                  sheetColumn: "",
                  targetField: "",
                  required: false,
                  dataType: "string"
                }];
                setFieldMappings(newMappings);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Mapping
            </button>
          </div>
          
          <div className="space-y-3">
            {fieldMappings.map((mapping, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex-1">
                  <select
                    value={mapping.sheetColumn}
                    onChange={(e) => {
                      const newMappings = [...fieldMappings];
                      newMappings[index].sheetColumn = e.target.value;
                      setFieldMappings(newMappings);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select spreadsheet column</option>
                    {sheetHeaders.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-1">Source column</p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400" />
                
                <div className="flex-1">
                  <select
                    value={mapping.targetField}
                    onChange={(e) => {
                      const newMappings = [...fieldMappings];
                      newMappings[index].targetField = e.target.value;
                      newMappings[index].required = selectedTarget ? 
                        targetSystems.find(s => s.type === selectedTarget.type)
                          ?.entities.find(e => e.value === selectedTarget.entity)
                          ?.requiredFields.includes(e.target.value) || false : false;
                      setFieldMappings(newMappings);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select target field</option>
                    {selectedTarget && targetSystems
                      .find(s => s.type === selectedTarget.type)
                      ?.entities.find(e => e.value === selectedTarget.entity)
                      ?.requiredFields.map((field) => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                  </select>
                  {mapping.required && (
                    <p className="text-xs text-red-600 mt-1">Required field</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">Target field</p>
                </div>
                
                <button
                  onClick={() => {
                    const newMappings = fieldMappings.filter((_, i) => i !== index);
                    setFieldMappings(newMappings);
                  }}
                  className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {fieldMappings.filter(m => m.targetField).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No field mappings configured yet</p>
              <p className="text-sm">Add mappings to connect your spreadsheet columns to target fields</p>
            </div>
          )}
          
          {selectedTarget && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Required Fields</h5>
              <div className="text-sm text-blue-800">
                {targetSystems
                  .find(s => s.type === selectedTarget.type)
                  ?.entities.find(e => e.value === selectedTarget.entity)
                  ?.requiredFields.map((field, index) => {
                    const isMapped = fieldMappings.some(m => m.targetField === field);
                    return (
                      <span
                        key={field}
                        className={`inline-block px-2 py-1 rounded-full text-xs mr-2 mb-1 ${
                          isMapped 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isMapped ? '✓' : '✗'} {field}
                      </span>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Integration</h3>
        <p className="text-sm text-gray-600 mb-4">Set up how and when the sync should run</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Integration Name *
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="e.g., Export Invoices to QuickBooks"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sync Frequency
            </label>
            <select
              value={config.syncFrequency}
              onChange={(e) => setConfig({ ...config, syncFrequency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Type
            </label>
            <select
              value={config.triggerType}
              onChange={(e) => setConfig({ ...config, triggerType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="schedule">Scheduled</option>
              <option value="new_row">New Row Added</option>
              <option value="cell_update">Cell Updated</option>
            </select>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Integration Summary</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Source:</strong> {selectedSpreadsheet?.name} ({selectedRange})</p>
            <p><strong>Target:</strong> {selectedTarget && targetSystems.find(s => s.type === selectedTarget.type)?.name} - {selectedTarget?.entity}</p>
            <p><strong>Mappings:</strong> {fieldMappings.filter(m => m.targetField).length} fields mapped</p>
            <p><strong>Schedule:</strong> {config.syncFrequency} syncs</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {renderStepIndicator()}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
      
      {getValidationErrors().length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2 text-yellow-800">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Please fix the following issues:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {getValidationErrors().map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-8">
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
      
      <div className="flex justify-between items-center mt-12 pb-8">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : onCancel?.()}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          {step > 0 ? 'Back' : 'Cancel'}
        </button>
        
        <button
          onClick={() => step < 4 ? setStep(step + 1) : handleSave()}
          disabled={!canProceedToNextStep() || loading || saving}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {(loading || saving) && <Loader2 className="w-4 h-4 animate-spin" />}
          {step < 4 ? 'Next' : (saving ? 'Creating...' : 'Create Integration')}
        </button>
      </div>
      
      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <TemplateGallery
              onSelectTemplate={(template) => {
                setSelectedTemplate(template);
                setShowTemplateGallery(false);
                setStep(1);
                // Pre-populate form with template data
                setConfig({
                  name: template.name,
                  syncFrequency: template.syncFrequency,
                  triggerType: template.triggerType,
                  direction: "one-way"
                });
                setSelectedTarget({
                  type: template.targetType,
                  entity: template.targetEntity
                });
                setFieldMappings(template.fieldMappings);
              }}
              onClose={() => setShowTemplateGallery(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
