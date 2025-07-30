import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CreateEmployeeFeedback = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: '',
    questions: []
  });

  useEffect(() => {
    fetchEmployees();
    fetchRecipients();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/users');
      setEmployees(response.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/surveys', {
        ...surveyData,
        feedbackType: 'employee-specific',
        targetEmployee: selectedEmployee,
        targetRecipients: sendToAll ? [] : selectedRecipients,
        sendToAll
      });
      toast.success('Employee feedback form created successfully!');
    } catch (error) {
      toast.error('Failed to create feedback form');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Employee Feedback Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Employee to Get Feedback About
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Choose an employee...</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} - {emp.role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={(e) => setSendToAll(e.target.checked)}
              className="mr-2"
            />
            Send to all employees
          </label>
        </div>

        {/* Rest of form fields */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Feedback Form
        </button>
      </form>
    </div>
  );
};

export default CreateEmployeeFeedback;