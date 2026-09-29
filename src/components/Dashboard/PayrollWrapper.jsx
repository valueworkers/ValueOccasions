import React, { useState, useEffect, useMemo } from 'react';
import Payroll from './Payroll';

const PayrollWrapper = () => {
  const [authUser, setAuthUser] = useState(null);
  const [subTab, setSubTab] = useState('my-staff');
  const [attendanceRecords, setAttendanceRecords] = useState({});

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const raw = localStorage.getItem('authUser');
        if (raw) {
          const parsed = JSON.parse(raw);
          setAuthUser(parsed);
        } else {
          setAuthUser(null);
        }
      } catch (error) {
        setAuthUser(null);
      }
    };

    checkAuthStatus();

    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const isVsreOwner = useMemo(() => {
    return authUser?.user_type === 'VSRE_OWNER';
  }, [authUser]);

  return (
    <Payroll
      isVsreOwner={isVsreOwner}
      subTab={subTab}
      setSubTab={setSubTab}
      attendanceRecords={attendanceRecords}
    />
  );
};

export default PayrollWrapper;

