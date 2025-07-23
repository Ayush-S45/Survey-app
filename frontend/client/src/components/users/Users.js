import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to deactivate ${userName}? This action can be reversed later.`)) {
      try {
        await axios.delete(`/api/users/${userId}`);
        toast.success('User deactivated successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deactivating user:', error);
        toast.error(error.response?.data?.message || 'Failed to deactivate user');
      }
    }
  };

  const handleActivateUser = async (userId, userName) => {
    try {
      await axios.put(`/api/users/${userId}`, { isActive: true });
      toast.success(`${userName} activated successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Failed to activate user');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    const confirmMessage = action === 'activate' 
      ? `Activate ${selectedUsers.length} selected users?`
      : `Deactivate ${selectedUsers.length} selected users?`;

    if (window.confirm(confirmMessage)) {
      try {
        const promises = selectedUsers.map(userId => 
          action === 'activate' 
            ? axios.put(`/api/users/${userId}`, { isActive: true })
            : axios.delete(`/api/users/${userId}`)
        );
        
        await Promise.all(promises);
        toast.success(`${selectedUsers.length} users ${action}d successfully`);
        setSelectedUsers([]);
        setShowBulkActions(false);
        fetchUsers();
      } catch (error) {
        toast.error(`Failed to ${action} users`);
      }
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && u.isActive) ||
                         (statusFilter === 'inactive' && !u.isActive);
    const matchesDepartment = departmentFilter === 'all' || u.department?._id === departmentFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageUsers = ['admin', 'hr'].includes(user?.role);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage employee accounts and permissions</p>
        </div>
        {canManageUsers && (
          <div className="flex gap-3">
            {showBulkActions && selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  Activate Selected ({selectedUsers.length})
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  Deactivate Selected ({selectedUsers.length})
                </button>
              </div>
            )}
            <Link to="/users/add" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add User
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {canManageUsers && (
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
            </button>
            <span className="text-sm text-gray-500">
              {filteredUsers.length} users found
            </span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {canManageUsers && showBulkActions && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  {canManageUsers && showBulkActions && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => toggleUserSelection(u._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                      {u.role === 'admin' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.department?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.isActive ? (
                        <>
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link
                        to={`/users/${u._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View User"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {canManageUsers && (
                        <>
                          <Link
                            to={`/users/${u._id}/edit`}
                            className="text-green-600 hover:text-green-900"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          {u.isActive ? (
                            <button
                              onClick={() => handleDelete(u._id, `${u.firstName} ${u.lastName}`)}
                              className="text-red-600 hover:text-red-900"
                              title="Deactivate User"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(u._id, `${u.firstName} ${u.lastName}`)}
                              className="text-green-600 hover:text-green-900"
                              title="Activate User"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users; 
