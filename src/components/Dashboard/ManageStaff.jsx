import React, { useState } from 'react';
import ManagerDashboard from './ManagerDashboard';
import StaffDashboard from './StaffDashboard';

const ManageStaff = () => {
  const [activeTab, setActiveTab] = useState('managers'); // 'managers' or 'staff'
  const [subTab, setSubTab] = useState('my'); // 'my' | 'add' | 'terminate'

  return (
    <div className="w-full">
      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between gap-1.5 mb-3">
        <button
          onClick={() => setActiveTab('managers')}
          className={`flex-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all text-xs ${
            activeTab === 'managers'
              ? 'border-indigo-500 bg-indigo-50'
              : 'hover:border-gray-300'
          }`}
        >
          <span className="font-semibold italic text-gray-900">Managers</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all text-xs ${
            activeTab === 'staff'
              ? 'border-indigo-500 bg-indigo-50'
              : 'hover:border-gray-300'
          }`}
        >
          <span className="font-semibold italic text-gray-900">Staff</span>
        </button>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center justify-between gap-1.5 mb-3">
        <button
          onClick={() => setSubTab('my')}
          className={`flex-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all text-xs ${
            subTab === 'my'
              ? 'border-indigo-500 bg-indigo-50'
              : 'hover:border-gray-300'
          }`}
        >
          <span className="font-semibold italic text-gray-900">
            {activeTab === 'managers' ? 'My Managers' : 'My Staff'}
          </span>
        </button>
        <button
          onClick={() => setSubTab('add')}
          className={`flex-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all text-xs ${
            subTab === 'add'
              ? 'border-indigo-500 bg-indigo-50'
              : 'hover:border-gray-300'
          }`}
        >
          <span className="font-semibold italic text-gray-900">
            {activeTab === 'managers' ? 'Add Managers' : 'Add Staff'}
          </span>
        </button>
        <button
          onClick={() => setSubTab('terminate')}
          className={`flex-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all text-xs ${
            subTab === 'terminate'
              ? 'border-indigo-500 bg-indigo-50'
              : 'hover:border-gray-300'
          }`}
        >
          <span className="font-semibold italic text-gray-900">
            {activeTab === 'managers' ? 'Terminate Managers' : 'Terminate Staff'}
          </span>
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'managers' ? (
          <ManagerDashboard subTab={subTab} setSubTab={setSubTab} />
        ) : (
          <StaffDashboard subTab={subTab} setSubTab={setSubTab} />
        )}
      </div>
    </div>
  );
};

export default ManageStaff;
