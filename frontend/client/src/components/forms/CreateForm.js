import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DocumentPlusIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CreateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: [
      {
        id: Date.now(),
        label: '',
        type: 'text',
        required: false,
        options: []
      }
    ]
  });

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' }
  ];

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id: Date.now(),
        label: '',
        type: 'text',
        required: false,
        options: []
      }]
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const addOption = (fieldId) => {
    updateField(fieldId, {
      options: [...(formData.fields.find(f => f.id === fieldId)?.options || []), '']
    });
  };

  const updateOption = (fieldId, optionIndex, value) => {
    const field = formData.fields.find(f => f.id === fieldId);
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };

  const removeOption = (fieldId, optionIndex) => {
    const field = formData.fields.find(f => f.id === fieldId);
    const newOptions = field.options.filter((_, index) => index !== optionIndex);
    updateField(fieldId, { options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Form title is required');
      return;
    }

    if (formData.fields.some(field => !field.label.trim())) {
      toast.error('All fields must have labels');
      return;
    }

    // Here you would typically save to backend
    console.log('Form data:', formData);
    toast.success('Form created successfully!');
    navigate('/forms');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <DocumentPlusIcon className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Custom Form</h1>
          <p className="text-gray-600">Build dynamic forms for data collection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Details */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Form Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter form title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                rows="3"
                placeholder="Describe the purpose of this form"
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Form Fields</h2>
            <button
              type="button"
              onClick={addField}
              className="btn-primary flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Field
            </button>
          </div>

          <div className="space-y-4">
            {formData.fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-900">Field {index + 1}</h3>
                  {formData.fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="input-field"
                      placeholder="Enter field label"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value, options: [] })}
                      className="input-field"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Options for select, radio, checkbox */}
                {['select', 'radio', 'checkbox'].includes(field.type) && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(field.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {field.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                            className="input-field flex-1"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(field.id, optionIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Required field
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            Create Form
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForm; 
