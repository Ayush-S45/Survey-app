import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await axios.put(`/api/departments/${editingDept._id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await axios.post('/api/departments', formData);
        toast.success('Department created successfully');
      }
      setFormData({ name: '', description: '', manager: '' });
      setShowAddForm(false);
      setEditingDept(null);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Failed to save department');
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      manager: dept.manager?._id || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`/api/departments/${deptId}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', manager: '' });
    setShowAddForm(false);
    setEditingDept(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage organizational departments</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Department
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            {editingDept ? 'Edit Department' : 'Add New Department'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="3"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                {editingDept ? 'Update' : 'Create'} Department
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {dept.description || 'No description'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <UsersIcon className="h-4 w-4 mr-2" />
                <span>{dept.employeeCount || 0} employees</span>
              </div>
              {dept.manager && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Manager:</span> {dept.manager.firstName} {dept.manager.lastName}
                </div>
              )}
            </div>

            {(user?.role === 'admin' || user?.role === 'hr') && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(dept)}
                  className="btn-secondary flex items-center text-sm"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dept._id)}
                  className="btn-danger flex items-center text-sm"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500">Create your first department to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Departments;
