import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const defaultQuestion = { text: '', type: 'text', options: [''] };

const EditSurvey = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ ...defaultQuestion }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/surveys/${id}`);
        const survey = res.data.survey || res.data;
        setTitle(survey.title || '');
        setDescription(survey.description || '');
        setQuestions(
          survey.questions && survey.questions.length > 0
            ? survey.questions.map(q => ({
                text: q.text,
                type: q.type,
                options: q.type === 'multiple' ? q.options : ['']
              }))
            : [{ ...defaultQuestion }]
        );
      } catch (err) {
        setError('Failed to fetch survey');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

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

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await axios.put(`/api/surveys/${id}`, {
        title,
        description,
        questions: questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.type === 'multiple' ? q.options : undefined
        }))
      });
      setSuccess('Survey updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update survey');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">Loading survey...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Survey Title *</label>
          <input className="input-field w-full" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea className="input-field w-full" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-2">Questions</label>
          {questions.map((q, idx) => (
            <div key={idx} className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex gap-2 mb-2">
                <input
                  className="input-field flex-1"
                  placeholder={`Question ${idx + 1}`}
                  value={q.text}
                  onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
                  required
                />
                <select
                  className="input-field"
                  value={q.type}
                  onChange={e => handleQuestionChange(idx, 'type', e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="rating">Rating</option>
                </select>
                <button type="button" className="ml-2 text-red-500" onClick={() => removeQuestion(idx)} disabled={questions.length === 1}>✕</button>
              </div>
              {q.type === 'multiple' && (
                <div className="space-y-2 ml-4">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex gap-2 items-center">
                      <input
                        className="input-field flex-1"
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, oi, e.target.value)}
                        required
                      />
                      <button type="button" className="text-red-500" onClick={() => removeOption(idx, oi)} disabled={q.options.length === 1}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="text-blue-600 text-sm mt-1" onClick={() => addOption(idx)}>+ Add Option</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className="text-blue-600 text-sm" onClick={addQuestion}>+ Add Question</button>
        </div>
        {success && <div className="text-green-600 text-sm">{success}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default EditSurvey; 