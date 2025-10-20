"use client";

import { useState } from "react";
import { 
  ArrowRight, 
  Clock, 
  Users, 
  TrendingUp,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { IntegrationTemplate, integrationTemplates, getAllCategories } from "@/lib/integrations/templates";

interface TemplateGalleryProps {
  onSelectTemplate: (template: IntegrationTemplate) => void;
  onClose: () => void;
}

export default function TemplateGallery({ onSelectTemplate, onClose }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", ...getAllCategories()];

  const filteredTemplates = integrationTemplates.filter(template => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Accounting":
        return <TrendingUp className="w-4 h-4" />;
      case "CRM":
        return <Users className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTemplateIcon = (template: IntegrationTemplate) => {
    switch (template.targetType) {
      case "quickbooks":
        return "/quickbooks.png";
      case "hubspot":
        return "/hubspot.png";
      case "salesforce":
        return "/salesforce.png";
      default:
        return template.icon;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 overflow-y-auto scrollbar-hide max-h-[85vh]">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Integration Templates</h2>
            <p className="text-gray-600 mt-1">Choose from pre-built integrations to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Close template gallery"
          >
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => onSelectTemplate(template)}
            tabIndex={0}
            role="button"
            aria-label={`Select ${template.name} template`}
          >
            {/* Template Header */}
            <div className="flex items-start gap-4 mb-4">
              <img
                src={getTemplateIcon(template)}
                alt={template.name}
                className="w-12 h-12 rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                  {template.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {getCategoryIcon(template.category)}
                    {template.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {template.syncFrequency} syncs
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {template.description}
            </p>

            {/* Field Mappings Preview */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Field Mappings:</p>
              <div className="flex flex-wrap gap-1">
                {template.fieldMappings.slice(0, 4).map((mapping, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {mapping.sheetColumn}
                  </span>
                ))}
                {template.fieldMappings.length > 4 && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{template.fieldMappings.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Sample Data Preview */}
            {template.sampleData.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Sample Data:</p>
                <div className="bg-gray-50 rounded-lg p-3 text-xs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          {template.fieldMappings.slice(0, 3).map((mapping, index) => (
                            <th key={index} className="text-left font-medium text-gray-600 pb-1">
                              {mapping.sheetColumn}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {template.sampleData.slice(0, 2).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.slice(0, 3).map((cell, cellIndex) => (
                              <td key={cellIndex} className="text-gray-600 py-1">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Setup Instructions Preview */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Setup Steps:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {template.setupInstructions.slice(0, 2).map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{instruction}</span>
                  </li>
                ))}
                {template.setupInstructions.length > 2 && (
                  <li className="text-gray-500">
                    +{template.setupInstructions.length - 2} more steps
                  </li>
                )}
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Quick setup</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Use Template</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg mb-2">No templates found</p>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
