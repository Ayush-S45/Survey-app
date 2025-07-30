import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon, UserMinusIcon } from '@heroicons/react/24/outline';

const DeleteUser = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUser();
    } else {
      navigate('/users');
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUser(response.data.user || response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`/api/users/${userId}`);
      toast.success('User deactivated successfully');
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center text-red-600">User not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-red-100 p-2 rounded-lg">
          <UserMinusIcon className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delete User</h1>
          <p className="text-gray-600">Permanently deactivate user account</p>
        </div>
      </div>

      {/* Warning Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Warning</h3>
            <p className="text-red-700 mb-4">
              This action will deactivate the user account. The user will no longer be able to log in,
              but their data and feedback responses will be preserved for audit purposes.
            </p>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• User will be logged out immediately</li>
              <li>• All feedback responses will be retained</li>
              <li>• User data will be marked as inactive</li>
              <li>• This action can be reversed by reactivating the account</li>
            </ul>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">User Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <p className="mt-1 text-gray-900">{user.employeeId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <p className="mt-1 text-gray-900">{user.department?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <p className="mt-1 text-gray-900">{user.position}</p>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-4">
          To confirm deletion, please type <strong>DELETE</strong> in the field below:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="input-field mb-4"
        />
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || confirmText !== 'DELETE'}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUser;
