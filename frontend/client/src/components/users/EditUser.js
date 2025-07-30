import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    position: '',
    role: 'employee',
    department: '',
    manager: '',
    isActive: true
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        const user = response.data;
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          employeeId: user.employeeId || '',
          position: user.position || '',
          role: user.role || 'employee',
          department: user.department?._id || '',
          manager: user.manager?._id || '',
          isActive: user.isActive !== undefined ? user.isActive : true
        });
      } catch (error) {
        toast.error('Failed to load user');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(Array.isArray(response.data) ? response.data : response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/users?role=manager');
      setManagers(Array.isArray(response.data) ? response.data : response.data.managers || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setManagers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`/api/users/${id}`, formData);
      toast.success('User updated successfully');
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const canEditRole = ['admin', 'hr'].includes(currentUser?.role);
  const canEditDepartment = ['admin', 'hr'].includes(currentUser?.role);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <PencilIcon className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600">Update user information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Work Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            {canEditRole && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Department and Manager */}
        {canEditDepartment && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Department & Reporting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager
                </label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Manager</option>
                  {managers.map(manager => (
                    <option key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        {canEditRole && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Active User</span>
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
