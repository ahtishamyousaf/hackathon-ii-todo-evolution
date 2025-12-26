"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Button from "./ui/Button";
import { FileText, Plus, X } from "lucide-react";

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: number) => void;
  onClose: () => void;
}

export default function TemplateSelector({
  onSelectTemplate,
  onClose,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await api.listTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId: number) => {
    try {
      await api.createTaskFromTemplate(templateId);
      onSelectTemplate(templateId);
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to create task from template");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create from Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No templates yet. Save a task as a template to get started.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => handleCreateFromTemplate(template.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {template.template_data.priority && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Priority: {template.template_data.priority}
                        </span>
                      )}
                      {template.template_data.category_id && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Has category
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="primary" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Use
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
