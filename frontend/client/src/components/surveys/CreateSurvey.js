import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  DocumentPlusIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const defaultQuestion = { 
  text: '', 
  type: 'text', 
  options: [''], 
  required: false,
  description: '',
  placeholder: ''
};

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Basic Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  // Questions
  const [questions, setQuestions] = useState([{ ...defaultQuestion }]);

  // Settings
  const [settings, setSettings] = useState({
    isAnonymous: false,
    isActive: true,
    allowMultipleSubmissions: false,
    showProgressBar: true,
    randomizeQuestions: false,
    estimatedTime: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Target Audience
  const [targetAudience, setTargetAudience] = useState({
    departments: [],
    roles: [],
    specificUsers: []
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(Array.isArray(response.data) ? response.data : response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const questionTypes = [
    { value: 'text', label: 'Text Response', icon: '📝', description: 'Open-ended text input' },
    { value: 'textarea', label: 'Long Text', icon: '📄', description: 'Multi-line text response' },
    { value: 'multiple', label: 'Multiple Choice', icon: '🔘', description: 'Single selection from options' },
    { value: 'checkbox', label: 'Checkboxes', icon: '☑️', description: 'Multiple selections allowed' },
    { value: 'rating', label: 'Rating Scale', icon: '⭐', description: '1-5 star rating' },
    { value: 'scale', label: 'Likert Scale', icon: '📊', description: 'Agreement scale (1-5)' },
    { value: 'number', label: 'Number Input', icon: '🔢', description: 'Numeric input only' },
    { value: 'date', label: 'Date Picker', icon: '📅', description: 'Date selection' },
    { value: 'email', label: 'Email', icon: '📧', description: 'Email address input' },
    { value: 'url', label: 'Website URL', icon: '🔗', description: 'URL input with validation' }
  ];

  const categories = [
    { value: 'project', label: 'Project Feedback', color: 'bg-blue-100 text-blue-800' },
    { value: 'manager', label: 'Manager Evaluation', color: 'bg-purple-100 text-purple-800' },
    { value: 'workplace', label: 'Workplace Environment', color: 'bg-green-100 text-green-800' },
    { value: 'general', label: 'General Feedback', color: 'bg-gray-100 text-gray-800' },
    { value: 'training', label: 'Training & Development', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'custom', label: 'Custom Survey', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      )
    );
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((opt, oi) => (oi === optIdx ? value : opt)) }
          : q
      )
    );
  };

  const addQuestion = () => setQuestions(qs => [...qs, { ...defaultQuestion }]);
  const removeQuestion = idx => setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs);
  const addOption = qIdx => setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ''] } : q));
  const removeOption = (qIdx, optIdx) => setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.length > 1 ? q.options.filter((_, oi) => oi !== optIdx) : q.options } : q));

  const duplicateQuestion = (idx) => {
    const questionToDuplicate = { ...questions[idx] };
    setQuestions(qs => [
      ...qs.slice(0, idx + 1),
      questionToDuplicate,
      ...qs.slice(idx + 1)
    ]);
  };

  const moveQuestion = (idx, direction) => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === questions.length - 1)) return;
    
    const newQuestions = [...questions];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newQuestions[idx], newQuestions[targetIdx]] = [newQuestions[targetIdx], newQuestions[idx]];
    setQuestions(newQuestions);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess('');
    setError('');

    // Validate basic information
    if (!title.trim()) {
      setError('Survey title is required');
      setLoading(false);
      return;
    }

    if (!category) {
      setError('Survey category is required');
      setLoading(false);
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      setError('At least one question is required');
      setLoading(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} must have text`);
        setLoading(false);
        return;
      }
      
      if (['multiple', 'checkbox'].includes(q.type)) {
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          setError(`Question ${i + 1} must have at least 2 options`);
          setLoading(false);
          return;
        }
      }
    }

    // Validate settings
    if (!settings.startDate || !settings.endDate) {
      setError('Start date and end date are required');
      setLoading(false);
      return;
    }

    if (new Date(settings.endDate) <= new Date(settings.startDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    if (settings.estimatedTime < 1) {
      setError('Estimated time must be at least 1 minute');
      setLoading(false);
      return;
    }

    try {
      const surveyData = {
        title,
        description,
        category,
        questions: questions.map((q, index) => ({
          question: q.text,
          type: q.type,
          options: ['multiple', 'checkbox'].includes(q.type) ? q.options.filter(opt => opt.trim()) : [],
          required: q.required,
          description: q.description || '',
          placeholder: q.placeholder || '',
          order: index + 1
        })),
        targetAudience,
        isAnonymous: settings.isAnonymous,
        isActive: settings.isActive,
        startDate: settings.startDate,
        endDate: settings.endDate,
        estimatedTime: settings.estimatedTime,
        tags,
        settings: {
          allowMultipleSubmissions: settings.allowMultipleSubmissions,
          showProgressBar: settings.showProgressBar,
          randomizeQuestions: settings.randomizeQuestions
        }
      };

      await axios.post('/api/surveys', surveyData);
      setSuccess('Survey created successfully!');
      toast.success('Survey created successfully!');
      
      setTimeout(() => {
        navigate('/surveys');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create survey';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Title *
              </label>
              <input
                className="input-field w-full"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your survey"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="input-field w-full min-h-[100px]"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide context and instructions for survey participants"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      category === cat.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${cat.color}`}>
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Survey Questions</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="btn-secondary flex items-center"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900">Survey Preview</h4>
                  <p className="text-blue-700 text-sm">This is how your survey will appear to participants</p>
                </div>
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-white border rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900">
                        {idx + 1}. {q.text || `Question ${idx + 1}`}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {q.description && (
                        <p className="text-sm text-gray-600 mt-1">{q.description}</p>
                      )}
                    </div>
                    {renderQuestionPreview(q)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Question {idx + 1}</h4>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(idx, 'down')}
                          disabled={idx === questions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateQuestion(idx)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          disabled={questions.length === 1}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text *
                        </label>
                        <input
                          className="input-field w-full"
                          placeholder={`Question ${idx + 1}`}
                          value={q.text}
                          onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Type *
                        </label>
                        <select
                          className="input-field w-full"
                          value={q.type}
                          onChange={e => handleQuestionChange(idx, 'type', e.target.value)}
                        >
                          {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        className="input-field w-full"
                        placeholder="Additional context or instructions"
                        value={q.description}
                        onChange={e => handleQuestionChange(idx, 'description', e.target.value)}
                      />
                    </div>

                    {['text', 'textarea', 'email', 'url'].includes(q.type) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placeholder Text
                        </label>
                        <input
                          className="input-field w-full"
                          placeholder="Enter placeholder text"
                          value={q.placeholder}
                          onChange={e => handleQuestionChange(idx, 'placeholder', e.target.value)}
                        />
                      </div>
                    )}

                    {['multiple', 'checkbox'].includes(q.type) && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex gap-2 items-center">
                              <span className="text-sm text-gray-500 w-6">{oi + 1}.</span>
                              <input
                                className="input-field flex-1"
                                placeholder={`Option ${oi + 1}`}
                                value={opt}
                                onChange={e => handleOptionChange(idx, oi, e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(idx, oi)}
                                disabled={q.options.length === 1}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(idx)}
                            className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${idx}`}
                        checked={q.required}
                        onChange={e => handleQuestionChange(idx, 'required', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`required-${idx}`} className="text-sm text-gray-700">
                        Required question
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Survey Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings.estimatedTime}
                    onChange={e => setSettings({...settings, estimatedTime: parseInt(e.target.value)})}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={settings.startDate}
                    onChange={e => setSettings({...settings, startDate: e.target.value})}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={settings.endDate}
                    onChange={e => setSettings({...settings, endDate: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={settings.isAnonymous}
                    onChange={e => setSettings({...settings, isAnonymous: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                    Anonymous responses (participant identity will not be recorded)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMultiple"
                    checked={settings.allowMultipleSubmissions}
                    onChange={e => setSettings({...settings, allowMultipleSubmissions: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="allowMultiple" className="text-sm text-gray-700">
                    Allow multiple submissions from same user
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showProgress"
                    checked={settings.showProgressBar}
                    onChange={e => setSettings({...settings, showProgressBar: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="showProgress" className="text-sm text-gray-700">
                    Show progress bar to participants
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="randomize"
                    checked={settings.randomizeQuestions}
                    onChange={e => setSettings({...settings, randomizeQuestions: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="randomize" className="text-sm text-gray-700">
                    Randomize question order
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={settings.isActive}
                    onChange={e => setSettings({...settings, isActive: e.target.checked})}
                    className="mr-3"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Activate survey immediately
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold mb-4">
                <UserGroupIcon className="h-5 w-5 inline mr-2" />
                Target Audience (Optional)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departments
                  </label>
                  <select
                    multiple
                    value={targetAudience.departments}
                    onChange={e => setTargetAudience({
                      ...targetAudience,
                      departments: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="input-field w-full h-32"
                  >
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roles
                  </label>
                  <div className="space-y-2">
                    {['employee', 'manager', 'hr', 'admin'].map(role => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={targetAudience.roles.includes(role)}
                          onChange={e => {
                            if (e.target.checked) {
                              setTargetAudience({
                                ...targetAudience,
                                roles: [...targetAudience.roles, role]
                              });
                            } else {
                              setTargetAudience({
                                ...targetAudience,
                                roles: targetAudience.roles.filter(r => r !== role)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderQuestionPreview = (question) => {
    switch (question.type) {
      case 'text':
        return <input type="text" placeholder={question.placeholder || "Enter your response"} className="input-field w-full" disabled />;
      case 'textarea':
        return <textarea placeholder={question.placeholder || "Enter your detailed response"} className="input-field w-full min-h-[100px]" disabled />;
      case 'multiple':
        return (
          <div className="space-y-2">
            {question.options.filter(opt => opt.trim()).map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input type="radio" name={`preview-${question.text}`} className="mr-2" disabled />
                {option}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options.filter(opt => opt.trim()).map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                {option}
              </label>
            ))}
          </div>
        );
      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button key={rating} className="w-8 h-8 border border-gray-300 rounded" disabled>
                ⭐
              </button>
            ))}
          </div>
        );
      case 'scale':
        return (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Strongly Disagree</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(scale => (
                <button key={scale} className="w-8 h-8 border border-gray-300 rounded" disabled>
                  {scale}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500">Strongly Agree</span>
          </div>
        );
      default:
        return <input type={question.type} placeholder={question.placeholder} className="input-field w-full" disabled />;
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title, description, and category' },
    { number: 2, title: 'Questions', description: 'Add and configure questions' },
    { number: 3, title: 'Settings & Create', description: 'Configure settings and create survey' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4 py-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="bg-green-100 p-2 rounded-lg">
          <DocumentPlusIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create New Survey</h1>
          <p className="text-sm text-gray-600">Build engaging surveys to collect valuable feedback</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                activeStep >= step.number 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step.number}
              </div>
              <div className="ml-2">
                <p className={`text-sm font-medium ${
                  activeStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-3 ${
                  activeStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-5">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="btn-secondary px-4 py-1.5"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {success && <div className="text-green-600 text-sm font-medium">{success}</div>}
              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
              
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="btn-primary px-4 py-1.5"
                  disabled={
                    (activeStep === 1 && (!title.trim() || !category)) ||
                    (activeStep === 2 && questions.length === 0)
                  }
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  className="btn-primary px-5 py-1.5"
                  disabled={loading}
                >
                  {loading ? 'Creating Survey...' : 'Create Survey'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Survey Summary */}
      {activeStep === 3 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-md font-semibold text-blue-900 mb-3">Survey Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <span className="font-medium text-blue-800 block mb-1">Title:</span>
              <p className="text-blue-700">{title || 'Untitled Survey'}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="font-medium text-blue-800 block mb-1">Questions:</span>
              <p className="text-blue-700">{questions.length} questions</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="font-medium text-blue-800 block mb-1">Estimated Time:</span>
              <p className="text-blue-700">{settings.estimatedTime} minutes</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Ready to create!</strong> Review your settings above and click "Create Survey" to publish your survey.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Survey
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to create this survey? Once created, it will be available to users based on your settings.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  handleSubmit();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Survey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSurvey; 
