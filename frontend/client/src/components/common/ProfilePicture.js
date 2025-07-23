import React from 'react';

const ProfilePicture = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  };

  const getInitials = (user) => {
    if (!user) return '?';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getBgColor = (user) => {
    if (!user) return 'bg-gray-500';
    
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    const name = `${user.firstName || ''}${user.lastName || ''}`;
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`${sizeClasses[size]} ${getBgColor(user)} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {getInitials(user)}
    </div>
  );
};

export default ProfilePicture;

