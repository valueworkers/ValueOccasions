import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const DEFAULT_STAFF_PHOTO = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D';

const GENDER_LABEL_TO_CODE = {
  Male: 'M',
  Female: 'F',
  Other: 'O',
  'Prefer not to say': 'N',
};

const GENDER_CODE_TO_LABEL = {
  M: 'Male',
  F: 'Female',
  O: 'Other',
  N: 'Prefer not to say',
};

const PRIORITY_LABEL_TO_NUMBER = {
  High: 1,
  Medium: 2,
  Low: 3,
};

const priorityNumberToLabel = (value) => {
  if (value === 1) return 'High';
  if (value === 2) return 'Medium';
  if (value === 3) return 'Low';
  return '';
};

const mapGenderCodeToLabel = (value) => {
  if (!value) return '';
  const upperValue = String(value).toUpperCase();
  return GENDER_CODE_TO_LABEL[upperValue] || value;
};

const mapGenderLabelToCode = (label) => {
  if (!label) return 'N';
  const normalized = label.trim();
  if (GENDER_LABEL_TO_CODE[normalized]) {
    return GENDER_LABEL_TO_CODE[normalized];
  }

  const upper = normalized.toUpperCase();
  if (upper === 'MALE' || upper === 'M') return 'M';
  if (upper === 'FEMALE' || upper === 'F') return 'F';
  if (upper === 'OTHER' || upper === 'OTHERS' || upper === 'O') return 'O';
  if (upper === 'NOT TO PREFER' || upper === 'PREFER NOT TO SAY' || upper === 'NOT TO SAY' || upper === 'N') return 'N';
  return 'N';
};

const priorityLabelToNumber = (label, fallback) => {
  if (!label) return fallback;
  const normalized = PRIORITY_LABEL_TO_NUMBER[label];
  if (normalized) return normalized;
  const numericValue = parseInt(label, 10);
  return Number.isNaN(numericValue) ? fallback : numericValue;
};

const extractApiArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.results)) return payload.data.results;
  return [];
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAddStaffForm = (formState) => {
  const firstName = formState.firstName?.trim();
  if (!firstName) return 'First Name is required.';

  const lastName = formState.lastName?.trim();
  if (!lastName) return 'Last Name is required.';

  const email = formState.email?.trim();
  if (!email) return 'Email is required.';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';

  const mobile = formState.mobile?.trim();
  if (!mobile) return 'Mobile number is required.';
  const mobileDigits = mobile.replace(/\D/g, '');
  if (mobileDigits.length < 10) return 'Please enter a valid mobile number with at least 10 digits.';

  const password = formState.password || '';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters long.';

  const confirmPassword = formState.confirmPassword || '';
  if (!confirmPassword) return 'Confirm Password is required.';
  if (password !== confirmPassword) return 'Password and Confirm Password must match.';

  const baseCity = formState.empBaseLocation?.trim();
  if (!baseCity) return 'Base Location is required.';

  const address = formState.address?.trim();
  if (!address) return 'Address is required.';

  const gender = formState.empGender?.trim();
  if (!gender) return 'Gender is required.';

  return null;
};

const extractApiErrorMessage = (payload, fallbackMessage) => {
  if (!payload) return fallbackMessage;
  if (typeof payload === 'string') return payload;
  if (typeof payload.detail === 'string') return payload.detail;
  if (typeof payload.message === 'string') return payload.message;
  if (typeof payload.error === 'string') return payload.error;

  if (typeof payload === 'object') {
    for (const [key, value] of Object.entries(payload)) {
      if (Array.isArray(value) && value.length > 0) {
        return `${key}: ${value[0]}`;
      }
      if (typeof value === 'string') {
        return `${key}: ${value}`;
      }
      if (value && typeof value === 'object') {
        const nested = extractApiErrorMessage(value, null);
        if (nested) return nested;
      }
    }
  }

  return fallbackMessage;
};

const ITEMS_PER_PAGE = 10;
const STAFF_ASSIGNMENTS_KEY = 'staffAssignments';

const ASSIGNMENT_OPTIONS = [
  { key: 'venues', label: 'Venues', description: 'Allocate venues to staff' },
  { key: 'services', label: 'Services', description: 'Assign service resources' },
  { key: 'resources', label: 'Resources', description: 'Map resource ownership' },
];

const getStoredStaffAssignments = () => {
  try {
    const raw = localStorage.getItem(STAFF_ASSIGNMENTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Error parsing staff assignments from localStorage:', error);
    return {};
  }
};

const setStoredStaffAssignments = (assignments) => {
  try {
    localStorage.setItem(STAFF_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error('Error saving staff assignments to localStorage:', error);
  }
};

const StaffDashboard = ({ subTab: propSubTab, setSubTab: propSetSubTab }) => {
  const [authUser, setAuthUser] = useState(null);
  const [internalSubTab, setInternalSubTab] = useState('my'); // my | add | terminate
  const activeTab = propSubTab !== undefined ? propSubTab : internalSubTab;
  const setActiveTab = propSetSubTab || setInternalSubTab;
  const [staff, setStaff] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [form, setForm] = useState({ 
    firstName: '', 
    middleName: '', 
    lastName: '', 
    address: '', 
    mobile: '', 
    email: '', 
    emergencyContactNumber: '', 
    reportingManagerId: '',
    joiningDate: '',
    empLevel: '',
    empBaseLocation: '',
    empCategory: '',
    workDepartment: '',
    empGender: '',
    empActive: true,
    lastWorkingDay: '',
    skill1: '',
    skill1Priority: '',
    skill1Experience: '',
    skill2: '',
    skill2Priority: '',
    skill2Experience: '',
    skill3: '',
    skill3Priority: '',
    skill3Experience: '',
    photo: '',
    password: '',
    confirmPassword: '',
  });
  const [showAssignVenueModal, setShowAssignVenueModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignReportingManagerModal, setShowAssignReportingManagerModal] = useState(false);
  const [showVenuesListModal, setShowVenuesListModal] = useState(false);
  const [selectedStaffForVenue, setSelectedStaffForVenue] = useState(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState(null);
  const [selectedStaffForVenuesList, setSelectedStaffForVenuesList] = useState(null);
  const [newlyCreatedStaff, setNewlyCreatedStaff] = useState(null);
  const [selectedReportingManagerId, setSelectedReportingManagerId] = useState('');
  const [selectedVenueIds, setSelectedVenueIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ type: null, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignableParents, setAssignableParents] = useState([]);
  const [isLoadingAssignableParents, setIsLoadingAssignableParents] = useState(false);
  const [isAssigningReportingManager, setIsAssigningReportingManager] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [assignActionModalStaff, setAssignActionModalStaff] = useState(null);
  const [assignStaffIds, setAssignStaffIds] = useState([]);
  const [assignModalStep, setAssignModalStep] = useState('options');
  const [selectedAssignCategory, setSelectedAssignCategory] = useState(null);
  const [assignableEntities, setAssignableEntities] = useState([]);
  const [assignableEntitiesError, setAssignableEntitiesError] = useState('');
  const [selectedAssignableEntityId, setSelectedAssignableEntityId] = useState('');
  const [isLoadingAssignableEntities, setIsLoadingAssignableEntities] = useState(false);
  const [isAssigningEntity, setIsAssigningEntity] = useState(false);
  
  // Get venues from Redux store
  const venues = useSelector(state => state.venues.venues || []);
  const effectiveVenues = venues;

  const buildSkillsPayloadFromForm = (formState) => {
    const skillEntries = [
      {
        skill: formState.skill1?.trim(),
        priorityLabel: formState.skill1Priority,
        experience: formState.skill1Experience?.trim(),
      },
      {
        skill: formState.skill2?.trim(),
        priorityLabel: formState.skill2Priority,
        experience: formState.skill2Experience?.trim(),
      },
      {
        skill: formState.skill3?.trim(),
        priorityLabel: formState.skill3Priority,
        experience: formState.skill3Experience?.trim(),
      },
    ];

    return skillEntries
      .map((entry, index) => ({
        skill: entry.skill,
        priority: priorityLabelToNumber(entry.priorityLabel, index + 1),
        experience: entry.experience || '',
      }))
      .filter(entry => entry.skill);
  };

  const normalizeSkillsFromApi = (skills) => {
    if (!Array.isArray(skills)) return [];
    return skills
      .map((item, index) => ({
        skill: item?.skill?.trim() || '',
        priority: priorityLabelToNumber(item?.priority, index + 1),
        experience: item?.experience?.trim() || '',
      }))
      .filter(item => item.skill);
  };

  const createStaffFromFormState = (formState, overrides = {}) => {
    const skillsArray = buildSkillsPayloadFromForm(formState);
    const fullName = [formState.firstName, formState.middleName, formState.lastName]
      .filter(Boolean)
      .join(' ');

    return {
      id: overrides.id ?? Date.now(),
      name: fullName,
      firstName: formState.firstName,
      middleName: formState.middleName,
      lastName: formState.lastName,
      address: formState.address,
      mobile: formState.mobile,
      phone: formState.mobile,
      email: formState.email,
      emergencyContactNumber: formState.emergencyContactNumber,
      userPersona: 'STAFF',
      reportingManagerId: formState.reportingManagerId || null,
      joiningDate: formState.joiningDate,
      empLevel: formState.empLevel,
      empBaseLocation: formState.empBaseLocation,
      empCategory: formState.empCategory,
      workDepartment: formState.workDepartment,
      empGender: formState.empGender,
      empActive: formState.empActive,
      lastWorkingDay: formState.lastWorkingDay,
      skill1: formState.skill1,
      skill1Priority: formState.skill1Priority,
      skill1Experience: formState.skill1Experience,
      skill2: formState.skill2,
      skill2Priority: formState.skill2Priority,
      skill2Experience: formState.skill2Experience,
      skill3: formState.skill3,
      skill3Priority: formState.skill3Priority,
      skill3Experience: formState.skill3Experience,
      skills: skillsArray,
      photo: formState.photo || DEFAULT_STAFF_PHOTO,
      assignedVenues: overrides.assignedVenues || [],
    };
  };

  const normalizeStaffFromApi = (data) => {
    if (!data) return null;

    const normalizedSkills = normalizeSkillsFromApi(data.skills);
    const parentInfo = data.reports_to;
    const [skill1Data, skill2Data, skill3Data] = [...normalizedSkills, {}, {}, {}];
    const fullName = [data.first_name, data.middle_name, data.last_name]
      .filter(Boolean)
      .join(' ');

    return {
      id: data.id ?? Date.now(),
      name: fullName || data.name || 'New Staff',
      firstName: data.first_name || '',
      middleName: data.middle_name || '',
      lastName: data.last_name || '',
      address: data.address || '',
      mobile: data.mobile_number || data.phone || '',
      phone: data.mobile_number || data.phone || '',
      email: data.email || '',
      emergencyContactNumber: data.emergency_contact || '',
      userPersona: 'STAFF',
      reportingManagerId: parentInfo?.id ?? data.reporting_manager ?? null,
      assignedManager: parentInfo?.name || data.assigned_manager || null,
      joiningDate: data.date_joined || '',
      empLevel: data.emp_level || '',
      empBaseLocation: data.city || '',
      empCategory: data.category || '',
      workDepartment: data.department || '',
      empGender: mapGenderCodeToLabel(data.gender) || '',
      empActive: data.is_active !== undefined ? data.is_active : true,
      lastWorkingDay: data.last_working_day || '',
      skill1: skill1Data.skill || '',
      skill1Priority: priorityNumberToLabel(skill1Data.priority) || '',
      skill1Experience: skill1Data.experience || '',
      skill2: skill2Data.skill || '',
      skill2Priority: priorityNumberToLabel(skill2Data.priority) || '',
      skill2Experience: skill2Data.experience || '',
      skill3: skill3Data.skill || '',
      skill3Priority: priorityNumberToLabel(skill3Data.priority) || '',
      skill3Experience: skill3Data.experience || '',
      skills: normalizedSkills,
      photo: data.photo || DEFAULT_STAFF_PHOTO,
      assignedVenues: (() => {
        const assignedVenuesArray = Array.isArray(data.assigned_venues) ? data.assigned_venues : [];
        if (assignedVenuesArray.length > 0 && typeof assignedVenuesArray[0] === 'object') {
          return assignedVenuesArray.map(venue => {
            if (venue && typeof venue === 'object') {
              return venue.id ?? venue.object_id ?? Date.now();
            }
            return venue ?? Date.now();
          });
        }
        return assignedVenuesArray.length > 0 ? assignedVenuesArray : (data.assignedVenues || []);
      })(),
      assignedVenuesDetailed: (() => {
        const assignedVenuesArray = Array.isArray(data.assigned_venues) ? data.assigned_venues : [];
        return assignedVenuesArray.length > 0 ? assignedVenuesArray : undefined;
      })(),
    };
  };

  const fetchStaff = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      setStaff([]);
      setStaffError('Authorization token missing. Please log in again.');
      return;
    }

    setIsLoadingStaff(true);
    setStaffError('');

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/accounts/vsre-staff/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const staffPayload = extractApiArray(response.data);
      const normalizedStaff = staffPayload
        .map(normalizeStaffFromApi)
        .filter(Boolean);

      const storedAssignments = getStoredStaffAssignments();
      const mergedStaff = normalizedStaff.map((member) => {
        const stored = storedAssignments[String(member.id)];
        if (!stored) return member;
        return {
          ...member,
          assignedVenues: member.assignedVenues ?? stored.assignedVenues ?? [],
          reportingManagerId: member.reportingManagerId ?? stored.reportingManagerId,
          assignedManager: member.assignedManager ?? stored.assignedManager
        };
      });

      setStaff(mergedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      const responseData = error.response?.data;
      let message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        error.message ||
        'Failed to fetch staff.';

      if (!message && responseData && typeof responseData === 'object') {
        const firstValue = Object.values(responseData).find(Boolean);
        if (Array.isArray(firstValue)) {
          message = firstValue[0];
        } else if (typeof firstValue === 'string') {
          message = firstValue;
        }
      }

      setStaffError(message || 'Failed to fetch staff.');
      setStaff([]);
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  const fetchAssignableParents = useCallback(async (staffId) => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      console.error('Authorization token missing. Please log in again.');
      return;
    }

    if (!staffId) {
      console.error('Staff ID is required to fetch assignable parents.');
      return;
    }

    setIsLoadingAssignableParents(true);
    setAssignableParents([]);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/accounts/assign/${staffId}/parent/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const parentsData = response.data?.assignable_parents || [];
      setAssignableParents(Array.isArray(parentsData) ? parentsData : []);
    } catch (error) {
      console.error('Error fetching assignable parents for staff:', error);
      const responseData = error.response?.data;
      console.error('Assignable parents error payload:', responseData);
      setAssignableParents([]);
    } finally {
      setIsLoadingAssignableParents(false);
    }
  }, []);

  const buildStaffApiPayload = (formState, options = {}) => {
    const payload = {
      email: formState.email.trim(),
      mobile_number: formState.mobile.trim(),
      emergency_contact: formState.emergencyContactNumber.trim(),
      first_name: formState.firstName.trim(),
      middle_name: formState.middleName.trim(),
      last_name: formState.lastName.trim(),
      gender: mapGenderLabelToCode(formState.empGender),
      category: formState.empCategory?.trim() || '',
      address: formState.address.trim(),
      city: (formState.empBaseLocation || '').trim(),
      date_joined: formState.joiningDate || null,
      last_working_day: formState.lastWorkingDay || null,
      emp_level: formState.empLevel?.trim() || '',
      department: formState.workDepartment?.trim() || '',
      skills: buildSkillsPayloadFromForm(formState),
      is_active: formState.empActive,
      photo: formState.photo?.trim() || undefined,
    };

    if (formState.reportingManagerId) {
      const reportingIdNumber = Number(formState.reportingManagerId);
      payload.reporting_manager = Number.isNaN(reportingIdNumber)
        ? formState.reportingManagerId
        : reportingIdNumber;
    } else {
      payload.reporting_manager = null;
    }

    if (options.includeCredentials) {
      payload.password = formState.password;
      payload.confirm_password = formState.confirmPassword;
    }

    return payload;
  };

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
        console.error('Error parsing authUser from localStorage:', error);
        setAuthUser(null);
      }
    };

    checkAuthStatus();

    // Listen for auth changes
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Venues are now loaded from Redux store, no need to fetch separately

  useEffect(() => {
    if (activeTab !== 'add' && formFeedback.type) {
      setFormFeedback({ type: null, message: '' });
    }
  }, [activeTab, formFeedback.type]);

  const canManageStaff = useMemo(() => {
    const check = authUser?.user_type === 'VSRE_OWNER' || authUser?.user_type === 'VSRE_MANAGER';
    return check;
  }, [authUser]);

  useEffect(() => {
    if (canManageStaff) {
      fetchStaff();
    } else {
      setStaff([]);
      setStaffError('');
    }
  }, [canManageStaff, fetchStaff]);

  const addStaff = async () => {
    setFormFeedback({ type: null, message: '' });

    const validationError = validateAddStaffForm(form);
    if (validationError) {
      setFormFeedback({ type: 'error', message: validationError });
      return;
    }

    if (!form.empCategory) {
      setFormFeedback({ type: 'error', message: 'Please select an employee category.' });
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setFormFeedback({ type: 'error', message: 'Authorization token missing. Please log in again.' });
      return;
    }

    const payload = buildStaffApiPayload(form, { includeCredentials: true });

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/accounts/vsre-staff/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const responseData = response.data?.data || response.data;
      const normalizedStaff = normalizeStaffFromApi(responseData);
      const staffForModal = normalizedStaff || createStaffFromFormState(form, { id: responseData?.id });
      const successMessage = response.data?.message || 'Staff created successfully.';

      setForm({ 
        firstName: '', 
        middleName: '', 
        lastName: '', 
        address: '', 
        mobile: '', 
        email: '', 
        emergencyContactNumber: '', 
        reportingManagerId: '',
        joiningDate: '',
        empLevel: '',
        empBaseLocation: '',
        empCategory: '',
        workDepartment: '',
        empGender: '',
        empActive: true,
        lastWorkingDay: '',
        skill1: '',
        skill1Priority: '',
        skill1Experience: '',
        skill2: '',
        skill2Priority: '',
        skill2Experience: '',
        skill3: '',
        skill3Priority: '',
        skill3Experience: '',
        photo: '',
        password: '',
        confirmPassword: '',
      });

      setFormFeedback({ type: 'success', message: successMessage });
      setActiveTab('my');

      await fetchStaff();

      if (!form.reportingManagerId) {
        setNewlyCreatedStaff(staffForModal);
        setSelectedReportingManagerId('');
        setShowAssignReportingManagerModal(true);
        if (staffForModal?.id) {
          fetchAssignableParents(staffForModal.id);
        }
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      const responseData = error.response?.data;
      const message = extractApiErrorMessage(responseData, error.message || 'Failed to add staff.');

      setFormFeedback({ type: 'error', message });
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const terminateStaff = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this staff member? This action cannot be undone.')) {
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASEURL}/accounts/vsre-staff/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Remove staff from local state
      setStaff(prev => prev.filter(s => s.id !== id));
      alert('Staff terminated successfully!');
    } catch (error) {
      console.error('Error terminating staff:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to terminate staff. Please try again.';
      alert(errorMessage);
    }
  };

  const handleEditStaff = (staffMember) => {
    setSelectedStaffForEdit(staffMember);
    const skillsArray = Array.isArray(staffMember.skills) ? staffMember.skills : [];
    const [skill1Data, skill2Data, skill3Data] = [...skillsArray, {}, {}, {}];

    setForm({
      firstName: staffMember.firstName || '',
      middleName: staffMember.middleName || '',
      lastName: staffMember.lastName || '',
      address: staffMember.address || '',
      mobile: staffMember.mobile || staffMember.phone || '',
      email: staffMember.email || '',
      emergencyContactNumber: staffMember.emergencyContactNumber || '',
      reportingManagerId: staffMember.reportingManagerId || '',
      joiningDate: staffMember.joiningDate || '',
      empLevel: staffMember.empLevel || '',
      empBaseLocation: staffMember.empBaseLocation || '',
      empCategory: staffMember.empCategory || '',
      workDepartment: staffMember.workDepartment || '',
      empGender: mapGenderCodeToLabel(staffMember.empGender) || staffMember.empGender || '',
      empActive: staffMember.empActive !== undefined ? staffMember.empActive : true,
      lastWorkingDay: staffMember.lastWorkingDay || '',
      skill1: staffMember.skill1 || skill1Data.skill || '',
      skill1Priority: staffMember.skill1Priority || priorityNumberToLabel(skill1Data.priority) || '',
      skill1Experience: staffMember.skill1Experience || skill1Data.experience || '',
      skill2: staffMember.skill2 || skill2Data.skill || '',
      skill2Priority: staffMember.skill2Priority || priorityNumberToLabel(skill2Data.priority) || '',
      skill2Experience: staffMember.skill2Experience || skill2Data.experience || '',
      skill3: staffMember.skill3 || skill3Data.skill || '',
      skill3Priority: staffMember.skill3Priority || priorityNumberToLabel(skill3Data.priority) || '',
      skill3Experience: staffMember.skill3Experience || skill3Data.experience || '',
      photo: staffMember.photo || '',
      password: '',
      confirmPassword: '',
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaffForEdit) return;
    
    if (!form.firstName || !form.lastName || !form.email || !form.mobile) {
      alert('Please fill in all required fields: First Name, Last Name, Email, and Mobile');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    const payload = buildStaffApiPayload(form);
    setIsUpdatingStaff(true);

    try {
      await axios.patch(
        `${import.meta.env.VITE_BASEURL}/accounts/vsre-staff/${selectedStaffForEdit.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchStaff();

      setForm({ 
        firstName: '', 
        middleName: '', 
        lastName: '', 
        address: '', 
        mobile: '', 
        email: '', 
        emergencyContactNumber: '', 
        reportingManagerId: '',
        joiningDate: '',
        empLevel: '',
        empBaseLocation: '',
        empCategory: '',
        workDepartment: '',
        empGender: '',
        empActive: true,
        lastWorkingDay: '',
        skill1: '',
        skill1Priority: '',
        skill1Experience: '',
        skill2: '',
        skill2Priority: '',
        skill2Experience: '',
        skill3: '',
        skill3Priority: '',
        skill3Experience: '',
        photo: '',
        password: '',
        confirmPassword: '',
      });
      setShowEditModal(false);
      setSelectedStaffForEdit(null);
    } catch (error) {
      console.error('Error updating staff:', error);
      const responseData = error.response?.data;
      let message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        error.message ||
        'Failed to update staff.';

      if (!message && responseData && typeof responseData === 'object') {
        const firstValue = Object.values(responseData).find(Boolean);
        if (Array.isArray(firstValue)) {
          message = firstValue[0];
        } else if (typeof firstValue === 'string') {
          message = firstValue;
        }
      }

      alert(message);
    } finally {
      setIsUpdatingStaff(false);
    }
  };

  const openAssignVenueModal = (staffMember) => {
    setSelectedStaffForVenue(staffMember);
    setSelectedVenueIds(staffMember.assignedVenues || []);
    setShowAssignVenueModal(true);
  };

  const toggleStaffSelection = (staffId) => {
    setSelectedStaffIds(prev => {
      const idStr = String(staffId);
      const exists = prev.some(id => String(id) === idStr);
      if (exists) {
        return prev.filter(id => String(id) !== idStr);
      }
      return [...prev, staffId];
    });
  };

  const areAllVisibleStaffSelected = (visibleStaff) => {
    if (!visibleStaff || visibleStaff.length === 0) return false;
    return visibleStaff.every(staff =>
      selectedStaffIds.some(id => String(id) === String(staff.id))
    );
  };

  const toggleSelectAllVisibleStaff = (visibleStaff) => {
    if (!visibleStaff || visibleStaff.length === 0) return;
    const allSelected = areAllVisibleStaffSelected(visibleStaff);
    if (allSelected) {
      setSelectedStaffIds(prev =>
        prev.filter(
          id => !visibleStaff.some(staff => String(staff.id) === String(id))
        )
      );
    } else {
      const visibleIds = visibleStaff.map(staff => staff.id);
      setSelectedStaffIds(prev => {
        const map = new Map(prev.map(id => [String(id), id]));
        visibleIds.forEach(id => {
          const key = String(id);
          if (!map.has(key)) {
            map.set(key, id);
          }
        });
        return Array.from(map.values());
      });
    }
  };

  const ENTITY_TYPE_MAP = {
    venues: 'venue',
    services: 'service',
    resources: 'resource',
  };
  const ASSIGN_CATEGORY_LABELS = {
    venues: 'Venues',
    services: 'Services',
    resources: 'Resources',
  };

  const handleAssignOptionSelect = (optionKey) => {
    if (!optionKey) return;
    fetchAssignableEntities(optionKey);
  };

  const fetchAssignableEntities = async (optionKey) => {
    const entityType = ENTITY_TYPE_MAP[optionKey] || optionKey;
    const accessToken = localStorage.getItem('access_token');
    const baseUrl = `${import.meta.env.VITE_BASEURL}`.replace(/\/$/, '');
    const staffIdForFetch = assignStaffIds[0];

    if (!staffIdForFetch) {
      setAssignModalStep('options');
      setAssignableEntitiesError('Select at least one staff before assigning.');
      return;
    }

    setAssignModalStep('entities');
    setSelectedAssignCategory(optionKey);
    setAssignableEntities([]);
    setAssignableEntitiesError('');
    setSelectedAssignableEntityId('');
    setIsLoadingAssignableEntities(true);
    setIsAssigningEntity(false);

    if (!accessToken) {
      setAssignableEntitiesError('Authorization token missing. Please log in again.');
      setIsLoadingAssignableEntities(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/management/assign-users/${entityType}/`,
        {
          params: { user_id: staffIdForFetch },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const entitiesPayload =
        response.data?.assignable_entities ||
        response.data?.data?.assignable_entities ||
        [];

      setAssignableEntities(Array.isArray(entitiesPayload) ? entitiesPayload : []);
      setAssignableEntitiesError('');
    } catch (error) {
      console.error('Failed to fetch assignable entities:', error);
      const responseData = error.response?.data;
      const message =
        extractApiErrorMessage(responseData, 'Failed to load assignable items.');
      setAssignableEntitiesError(message);
      setAssignableEntities([]);
    } finally {
      setIsLoadingAssignableEntities(false);
    }
  };

  const handleConfirmEntityAssignment = async () => {
    if (
      !assignActionModalStaff ||
      !selectedAssignCategory ||
      !selectedAssignableEntityId
    ) {
      return;
    }

    const entityType = ENTITY_TYPE_MAP[selectedAssignCategory] || selectedAssignCategory;
    const accessToken = localStorage.getItem('access_token');
    const baseUrl = `${import.meta.env.VITE_BASEURL}`.replace(/\/$/, '');

    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    setIsAssigningEntity(true);

    try {
      await axios.post(
        `${baseUrl}/management/assign-users/${entityType}/`,
        {
          entity_id: Number(selectedAssignableEntityId),
          staff_ids: assignStaffIds.map(id => Number(id) || id),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchStaff();
      setSelectedStaffIds(prev =>
        prev.filter(
          id => !assignStaffIds.some(assignId => String(assignId) === String(id))
        )
      );
      alert('Assignment saved successfully.');
      closeAssignActionModal();
    } catch (error) {
      console.error('Failed to assign entity:', error);
      const responseData = error.response?.data;
      const message = extractApiErrorMessage(responseData, 'Failed to assign. Please try again.');
      alert(message);
    } finally {
      setIsAssigningEntity(false);
    }
  };

  const openAssignActionModal = (staffMember, overrideStaffIds = null) => {
    const fallbackIds =
      overrideStaffIds && overrideStaffIds.length > 0
        ? overrideStaffIds
        : selectedStaffIds.length > 0
          ? selectedStaffIds
          : staffMember
            ? [staffMember.id]
            : [];

    if (!fallbackIds || fallbackIds.length === 0) {
      alert('Select at least one staff to assign.');
      return;
    }

    const normalizedIds = fallbackIds.map(id => Number(id) || id);
    const primaryStaff =
      staffMember ||
      staff.find(s => normalizedIds.some(id => String(id) === String(s.id))) ||
      null;

    setAssignStaffIds(normalizedIds);
    setAssignActionModalStaff(primaryStaff);
    setAssignModalStep('options');
    setSelectedAssignCategory(null);
    setAssignableEntities([]);
    setAssignableEntitiesError('');
    setSelectedAssignableEntityId('');
    setIsLoadingAssignableEntities(false);
    setIsAssigningEntity(false);
  };

  const closeAssignActionModal = () => {
    setAssignActionModalStaff(null);
    setAssignModalStep('options');
    setSelectedAssignCategory(null);
    setAssignableEntities([]);
    setAssignableEntitiesError('');
    setSelectedAssignableEntityId('');
    setIsLoadingAssignableEntities(false);
    setIsAssigningEntity(false);
    setAssignStaffIds([]);
  };

  const assignVenues = () => {
    if (!selectedStaffForVenue) return;

    const normalizedSelectedIds = selectedVenueIds.map(id => Number(id) || id);

    const resolvedVenuesDetails = normalizedSelectedIds.map(id => {
      const venue = effectiveVenues.find(v => v.id === id || String(v.id) === String(id));
      if (venue) {
        return {
          id: venue.id,
          name: venue.name,
          city: venue.city || venue.location?.city || venue.locality || '',
          is_active: venue.enabled !== false,
        };
      }
      return {
        id,
        name: `Venue #${id}`,
        city: '',
        is_active: true,
      };
    });

    setStaff(prev => prev.map(s =>
      s.id === selectedStaffForVenue.id
        ? { 
            ...s, 
            assignedVenues: normalizedSelectedIds,
            assignedVenuesDetailed: resolvedVenuesDetails,
          }
        : s
    ));

    const assignments = getStoredStaffAssignments();
    const key = String(selectedStaffForVenue.id);
    assignments[key] = {
      ...(assignments[key] || {}),
      assignedVenues: normalizedSelectedIds
    };
    setStoredStaffAssignments(assignments);

    setShowAssignVenueModal(false);
    setSelectedStaffForVenue(null);
    setSelectedVenueIds([]);
  };

  const toggleVenueSelection = (venueId) => {
    setSelectedVenueIds(prev => {
      const venueIdStr = String(venueId);
      const hasId = prev.some(id => String(id) === venueIdStr);
      return hasId
        ? prev.filter(id => String(id) !== venueIdStr)
        : [...prev, venueId];
    });
  };

  const openReportingManagerAssignment = (staffMember) => {
    if (!staffMember) return;
    setNewlyCreatedStaff(staffMember);
    setSelectedReportingManagerId(
      staffMember.reportingManagerId ? String(staffMember.reportingManagerId) : ''
    );
    setShowAssignReportingManagerModal(true);
    if (staffMember.id) {
      fetchAssignableParents(staffMember.id);
    }
  };

  const handleAssignReportingManager = async () => {
    if (!newlyCreatedStaff) return;

    const rawValue = selectedReportingManagerId?.trim();
    if (!rawValue) {
      alert('Please select a reporting manager from the list.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    const staffId = newlyCreatedStaff.id;
    if (!staffId) {
      alert('Staff ID is missing.');
      return;
    }

    const parsedId = Number(rawValue);
    const parentManagerId = Number.isNaN(parsedId) ? rawValue : parsedId;

    const parentManager = assignableParents.find(
      (parent) => String(parent.id) === String(parentManagerId)
    );

    const parentManagerName =
      parentManager?.name ||
      `${parentManager?.first_name || ''} ${parentManager?.last_name || ''}`.trim() ||
      `Manager #${parentManagerId}`;

    setIsAssigningReportingManager(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_BASEURL}/accounts/assign/${staffId}/parent/`,
        {
          parent_id: parentManagerId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setStaff((prev) =>
        prev.map((staffMember) =>
          staffMember.id === newlyCreatedStaff.id
            ? {
                ...staffMember,
                reportingManagerId: parentManagerId,
                assignedManager: parentManagerName,
              }
            : staffMember
        )
      );

      const assignments = getStoredStaffAssignments();
      const key = String(newlyCreatedStaff.id);
      assignments[key] = {
        ...(assignments[key] || {}),
        reportingManagerId: parentManagerId,
        assignedManager: parentManagerName,
      };
      setStoredStaffAssignments(assignments);

      handleCloseAssignReportingManagerModal();
    } catch (error) {
      console.error('Error assigning reporting manager to staff:', error);
      const responseData = error.response?.data;
      const message = extractApiErrorMessage(
        responseData,
        error.message || 'Failed to assign reporting manager.'
      );
      alert(message);
    } finally {
      setIsAssigningReportingManager(false);
    }
  };

  const handleCloseAssignReportingManagerModal = () => {
    setShowAssignReportingManagerModal(false);
    setNewlyCreatedStaff(null);
    setSelectedReportingManagerId('');
    setAssignableParents([]);
  };

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staff;

    return staff.filter((member) => {
      const fields = [
        member.name,
        member.email,
        member.mobile,
        member.phone,
        member.empBaseLocation,
        member.workDepartment,
      ];

      return fields.some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(term)
      );
    });
  }, [staff, searchTerm]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredStaff.length / ITEMS_PER_PAGE)), [filteredStaff.length]);
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStaff.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStaff, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStaff.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="w-full">
      {/* Top actions - only show if not controlled by parent */}
      {propSubTab === undefined && (
        <div className="flex items-center justify-between gap-4 mb-6">
          <button onClick={() => setActiveTab('my')} className={`flex-1 px-6 py-3 rounded-xl bg-white border-2 shadow-md transition-all ${activeTab==='my' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="font-semibold italic text-gray-900">My Staff</span>
          </button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 px-6 py-3 rounded-xl bg-white border-2 shadow-md transition-all ${activeTab==='add' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="font-semibold italic text-gray-900">Add Staff</span>
          </button>
          <button onClick={() => setActiveTab('terminate')} className={`flex-1 px-6 py-3 rounded-xl bg-white border-2 shadow-md transition-all ${activeTab==='terminate' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="font-semibold italic text-gray-900">Terminate Staff</span>
          </button>
        </div>
      )}

      {/* Panels */}
      {!canManageStaff && (
        <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center">
          <p className="text-gray-700 text-lg font-medium mb-2">Only VSRE_OWNERs and VSRE_MANAGERs can manage staff.</p>
          {authUser ? (
            <p className="text-sm text-gray-500">Current user type: <span className="font-semibold">{authUser.user_type || 'Not found'}</span></p>
          ) : (
            <p className="text-sm text-gray-500">No user logged in. Please log in as VSRE_OWNER or VSRE_MANAGER.</p>
          )}
        </div>
      )}

      {canManageStaff && activeTab === 'my' && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff by name, city, or contact"
              className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => openAssignActionModal(null, selectedStaffIds)}
            disabled={selectedStaffIds.length === 0}
            className={`px-4 py-3 rounded-lg text-sm font-semibold ${
              selectedStaffIds.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            title="Assign selected staff"
          >
            Assign Selected {selectedStaffIds.length > 0 ? `(${selectedStaffIds.length})` : ''}
          </button>
        </div>
      )}

      {canManageStaff && activeTab === 'my' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          {isLoadingStaff ? (
            <div className="text-center text-gray-600 py-12 text-lg">Loading staff...</div>
          ) : staffError ? (
            <div className="text-center text-red-600 py-12 text-lg">{staffError}</div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center text-gray-600 py-12 text-lg">
              {searchTerm.trim()
                ? (
                  <span>
                    No staff match "<span className="font-semibold text-gray-800">{searchTerm.trim()}</span>".
                  </span>
                )
                : 'No staff found.'}
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      <input
                        type="checkbox"
                        checked={areAllVisibleStaffSelected(paginatedStaff)}
                        onChange={() => toggleSelectAllVisibleStaff(paginatedStaff)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wide">Profile</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wide">Assigned Entities</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wide">Reporting Manager</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wide">Skills</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.map(s => {
                    const isInactive = s.empActive === false;
                    // Handle both new skills array format and legacy format
                    let skillsArray = [];
                    if (Array.isArray(s.skills) && s.skills.length > 0) {
                      skillsArray = s.skills;
                    } else {
                      // Fallback to legacy format
                      if (s.skill1) {
                        skillsArray.push({
                          skill: s.skill1,
                          priority: priorityLabelToNumber(s.skill1Priority, 1),
                          experience: s.skill1Experience || ''
                        });
                      }
                      if (s.skill2) {
                        skillsArray.push({
                          skill: s.skill2,
                          priority: priorityLabelToNumber(s.skill2Priority, 2),
                          experience: s.skill2Experience || ''
                        });
                      }
                      if (s.skill3) {
                        skillsArray.push({
                          skill: s.skill3,
                          priority: priorityLabelToNumber(s.skill3Priority, 3),
                          experience: s.skill3Experience || ''
                        });
                      }
                    }
                    const [skill1Data, skill2Data, skill3Data] = [...skillsArray, {}, {}, {}];
                    const displayReportingManagerName = s.assignedManager || null;

                    return (
                      <tr 
                        key={s.id} 
                        className={`border-b border-gray-200 transition-colors ${
                          isInactive 
                            ? 'bg-gray-50 opacity-75' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedStaffIds.some(id => String(id) === String(s.id))}
                            onChange={() => toggleStaffSelection(s.id)}
                            disabled={isInactive}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </td>
                        {/* Profile Pic, Name, Mobile */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img 
                              src={s.photo} 
                              alt={s.name} 
                              className={`w-12 h-12 rounded-full object-cover border-2 ${
                                isInactive 
                                  ? 'border-gray-300 opacity-60' 
                                  : 'border-indigo-300'
                              }`} 
                            />
                            <div>
                              <div className={`font-bold text-base ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                                {s.name}
                                {isInactive && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Inactive</span>
                                )}
                              </div>
                              <div className={`text-sm font-bold ${isInactive ? 'text-gray-400' : 'text-gray-600'}`}>
                                {s.mobile || s.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Venues */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            {s.assignedVenues && s.assignedVenues.length > 0 ? (
                              <>
                                {s.assignedVenues.slice(0, 2).map(venueId => {
                                  const venue =
                                    effectiveVenues.find(v => v.id === venueId || String(v.id) === String(venueId)) ||
                                    s.assignedVenuesDetailed?.find(v => v.id === venueId || String(v.id) === String(venueId));
                                  return venue ? (
                                    <div key={venueId} className="text-sm font-bold text-gray-700">
                                      {venue.name}
                                    </div>
                                  ) : (
                                    <div key={venueId} className="text-sm font-bold text-gray-500">
                                      Venue #{venueId}
                                    </div>
                                  );
                                })}
                                {s.assignedVenues.length > 2 && (
                                  <button
                                    onClick={() => {
                                      setSelectedStaffForVenuesList(s);
                                      setShowVenuesListModal(true);
                                    }}
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                                  >
                                    +{s.assignedVenues.length - 2} more
                                  </button>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-gray-400 italic">No venues assigned</div>
                            )}
                          </div>
                        </td>

                        {/* Reporting Manager */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            <div className="text-sm text-gray-700">
                              {displayReportingManagerName ? (
                                <span className="font-bold">{displayReportingManagerName}</span>
                              ) : (
                                <span className="text-gray-400 italic">No reporting manager</span>
                              )}
                            </div>
                            <button
                              onClick={() => openReportingManagerAssignment(s)}
                              className="px-2.5 py-0.5 rounded-md border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors w-fit"
                            >
                              {displayReportingManagerName ? 'Change' : 'Assign'}
                            </button>
                          </div>
                        </td>

                        {/* Skills */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            {skill1Data.skill && (
                              <div className="text-sm font-bold text-gray-700">
                                {skill1Data.skill}
                              </div>
                            )}
                            {skill2Data.skill && (
                              <div className="text-sm font-bold text-gray-700">
                                {skill2Data.skill}
                              </div>
                            )}
                            {skill3Data.skill && (
                              <div className="text-sm font-bold text-gray-700">
                                {skill3Data.skill}
                              </div>
                            )}
                            {!skill1Data.skill && !skill2Data.skill && !skill3Data.skill && (
                              <div className="text-sm text-gray-400 italic">No skills assigned</div>
                            )}
                          </div>
                        </td>

                        {/* Actions - Assign and Edit Profile */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => !isInactive && openAssignActionModal(s, [s.id])}
                              disabled={isInactive}
                              className={`px-3.5 py-1.5 w-30 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                                isInactive 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                              title={isInactive ? 'Cannot assign actions to inactive staff' : ''}
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => handleEditStaff(s)}
                              className="px-3.5 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              Edit Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredStaff.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="text-sm text-gray-600">
                  Showing{' '}
                  <span className="font-semibold">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredStaff.length)}
                  </span>{' '}
                  of <span className="font-semibold">{filteredStaff.length}</span> staff members
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* Assign Venue Modal */}
      {showAssignVenueModal && selectedStaffForVenue && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-black ">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Assign Venues to {selectedStaffForVenue.name}
            </h3>
            <div className="space-y-2 mb-4">
              {effectiveVenues.length === 0 ? (
                <p className="text-gray-500">No venues available.</p>
              ) : (
                effectiveVenues.map(venue => (
                  <label key={venue.id} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedVenueIds.some(id => String(id) === String(venue.id))}
                      onChange={() => toggleVenueSelection(venue.id)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{venue.name}</div>
                      <div className="text-sm text-gray-600">{venue.locality || venue.location?.city || venue.location || venue.city || 'Location not specified'}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignVenueModal(false);
                  setSelectedStaffForVenue(null);
                  setSelectedVenueIds([]);
                }}
                className="px-5 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={assignVenues}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Assign Venues
              </button>
            </div>
          </div>
        </div>
      )}

      {canManageStaff && activeTab === 'add' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Staff</h3>
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                <input 
                  value={form.firstName} 
                  onChange={(e)=>setForm(prev=>({...prev,firstName:e.target.value}))} 
                  placeholder="First Name" 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
                <input 
                  value={form.middleName} 
                  onChange={(e)=>setForm(prev=>({...prev,middleName:e.target.value}))} 
                  placeholder="Middle Name (optional)" 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                <input 
                  value={form.lastName} 
                  onChange={(e)=>setForm(prev=>({...prev,lastName:e.target.value}))} 
                  placeholder="Last Name" 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <input 
                  value={form.email} 
                  onChange={(e)=>setForm(prev=>({...prev,email:e.target.value}))} 
                  placeholder="Email Address" 
                  type="email" 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile <span className="text-red-500">*</span></label>
                <input 
                  value={form.mobile} 
                  onChange={(e)=>setForm(prev=>({...prev,mobile:e.target.value}))} 
                  placeholder="Mobile Number" 
                  type="tel"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={form.address} 
                onChange={(e)=>setForm(prev=>({...prev,address:e.target.value}))} 
                placeholder="Full Address" 
                rows="3"
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500 resize-none" 
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact Number</label>
              <input 
                value={form.emergencyContactNumber} 
                onChange={(e)=>setForm(prev=>({...prev,emergencyContactNumber:e.target.value}))} 
                placeholder="Emergency Contact" 
                type="tel"
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                <input
                  value={form.password}
                  onChange={(e)=>setForm(prev=>({...prev,password:e.target.value}))}
                  placeholder="Password"
                  type="password"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                <input
                  value={form.confirmPassword}
                  onChange={(e)=>setForm(prev=>({...prev,confirmPassword:e.target.value}))}
                  placeholder="Confirm Password"
                  type="password"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>


            {/* Employee Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Joining Date</label>
                <input 
                  value={form.joiningDate} 
                  onChange={(e)=>setForm(prev=>({...prev,joiningDate:e.target.value}))} 
                  type="date"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Level</label>
                <input 
                  value={form.empLevel} 
                  onChange={(e)=>setForm(prev=>({...prev,empLevel:e.target.value}))} 
                  placeholder="e.g. Level 1, Level 2"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Location <span className="text-red-500">*</span>
                </label>
                <input 
                  value={form.empBaseLocation} 
                  onChange={(e)=>setForm(prev=>({...prev,empBaseLocation:e.target.value}))} 
                  placeholder="Base Location"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Category</label>
                <select 
                  value={form.empCategory} 
                  onChange={(e)=>setForm(prev=>({...prev,empCategory:e.target.value}))} 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                >
                  <option value="">Select Employee Category</option>
                  <option value="Fulltime">Fulltime</option>
                  <option value="Parttime">Parttime</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Regular">Regular</option>
                  <option value="PPO">PPO</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Department</label>
                <input 
                  value={form.workDepartment} 
                  onChange={(e)=>setForm(prev=>({...prev,workDepartment:e.target.value}))} 
                  placeholder="Work Department"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select 
                  value={form.empGender} 
                  onChange={(e)=>setForm(prev=>({...prev,empGender:e.target.value}))} 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Active</label>
                <select 
                  value={form.empActive ? 'true' : 'false'} 
                  onChange={(e)=>setForm(prev=>({...prev,empActive:e.target.value === 'true'}))} 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Working Day</label>
                <input 
                  value={form.lastWorkingDay} 
                  onChange={(e)=>setForm(prev=>({...prev,lastWorkingDay:e.target.value}))} 
                  type="date"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skill 1</label>
                  <input 
                    value={form.skill1} 
                    onChange={(e)=>setForm(prev=>({...prev,skill1:e.target.value}))} 
                    placeholder="Skill 1"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                  <label className="block text-xs font-medium text-gray-600 mt-2 mb-1">Experience (optional)</label>
                  <input
                    value={form.skill1Experience}
                    onChange={(e)=>setForm(prev=>({...prev,skill1Experience:e.target.value}))}
                    placeholder="e.g., 2 years"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select 
                    value={form.skill1Priority} 
                    onChange={(e)=>setForm(prev=>({...prev,skill1Priority:e.target.value}))} 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  >
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skill 2</label>
                  <input 
                    value={form.skill2} 
                    onChange={(e)=>setForm(prev=>({...prev,skill2:e.target.value}))} 
                    placeholder="Skill 2"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                  <label className="block text-xs font-medium text-gray-600 mt-2 mb-1">Experience (optional)</label>
                  <input
                    value={form.skill2Experience}
                    onChange={(e)=>setForm(prev=>({...prev,skill2Experience:e.target.value}))}
                    placeholder="e.g., 3 years"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select 
                    value={form.skill2Priority} 
                    onChange={(e)=>setForm(prev=>({...prev,skill2Priority:e.target.value}))} 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  >
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skill 3</label>
                  <input 
                    value={form.skill3} 
                    onChange={(e)=>setForm(prev=>({...prev,skill3:e.target.value}))} 
                    placeholder="Skill 3"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                  <label className="block text-xs font-medium text-gray-600 mt-2 mb-1">Experience (optional)</label>
                  <input
                    value={form.skill3Experience}
                    onChange={(e)=>setForm(prev=>({...prev,skill3Experience:e.target.value}))}
                    placeholder="e.g., 1 year"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select 
                    value={form.skill3Priority} 
                    onChange={(e)=>setForm(prev=>({...prev,skill3Priority:e.target.value}))} 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  >
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo URL (optional)</label>
              <input 
                value={form.photo} 
                onChange={(e)=>setForm(prev=>({...prev,photo:e.target.value}))} 
                placeholder="Photo URL" 
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={addStaff} 
              disabled={isSubmitting}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Adding...' : 'Add Staff'}
            </button>
          </div>
          {formFeedback.message && (
            <div className={`mt-4 text-sm ${formFeedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {formFeedback.message}
            </div>
          )}
        </div>
      )}

      {canManageStaff && activeTab === 'terminate' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          {staff.length === 0 ? (
            <div className="text-center text-gray-600 py-12 text-lg">No staff to terminate.</div>
          ) : (
            <div className="divide-y-2 divide-gray-200">
              {staff.map(s => (
                <div key={s.id} className="flex items-center gap-4 py-4 hover:bg-white rounded-lg px-2 transition-colors">
                  <img src={s.photo} alt={s.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-300" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-lg truncate">{s.name}</div>
                    <div className="text-sm text-gray-700 truncate">{s.email} • {s.phone}</div>
                  </div>
                  <button onClick={()=>terminateStaff(s.id)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition-colors whitespace-nowrap">Terminate</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaffForEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Staff Profile</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaffForEdit(null);
                  setForm({ 
                    firstName: '', 
                    middleName: '', 
                    lastName: '', 
                    address: '', 
                    mobile: '', 
                    email: '', 
                    emergencyContactNumber: '', 
                    reportingManagerId: '',
                    joiningDate: '',
                    empLevel: '',
                    empBaseLocation: '',
                    empCategory: '',
                    workDepartment: '',
                    empGender: '',
                    empActive: true,
                    lastWorkingDay: '',
                    skill1: '',
                    skill1Priority: '',
                    skill1Experience: '',
                    skill2: '',
                    skill2Priority: '',
                    skill2Experience: '',
                    skill3: '',
                    skill3Priority: '',
                    skill3Experience: '',
                    photo: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                  <input 
                    value={form.firstName} 
                    onChange={(e)=>setForm(prev=>({...prev,firstName:e.target.value}))} 
                    placeholder="First Name" 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
                  <input 
                    value={form.middleName} 
                    onChange={(e)=>setForm(prev=>({...prev,middleName:e.target.value}))} 
                    placeholder="Middle Name (optional)" 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    value={form.lastName} 
                    onChange={(e)=>setForm(prev=>({...prev,lastName:e.target.value}))} 
                    placeholder="Last Name" 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input 
                    value={form.email} 
                    onChange={(e)=>setForm(prev=>({...prev,email:e.target.value}))} 
                    placeholder="Email Address" 
                    type="email" 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile <span className="text-red-500">*</span></label>
                  <input 
                    value={form.mobile} 
                    onChange={(e)=>setForm(prev=>({...prev,mobile:e.target.value}))} 
                    placeholder="Mobile Number" 
                    type="tel"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea 
                  value={form.address} 
                  onChange={(e)=>setForm(prev=>({...prev,address:e.target.value}))} 
                  placeholder="Full Address" 
                  rows="3"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500 resize-none" 
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact Number</label>
                <input 
                  value={form.emergencyContactNumber} 
                  onChange={(e)=>setForm(prev=>({...prev,emergencyContactNumber:e.target.value}))} 
                  placeholder="Emergency Contact" 
                  type="tel"
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>


              {/* Employee Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Joining Date</label>
                  <input 
                    value={form.joiningDate} 
                    onChange={(e)=>setForm(prev=>({...prev,joiningDate:e.target.value}))} 
                    type="date"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Level</label>
                  <input 
                    value={form.empLevel} 
                    onChange={(e)=>setForm(prev=>({...prev,empLevel:e.target.value}))} 
                    placeholder="e.g. Level 1, Level 2"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Location</label>
                  <input 
                    value={form.empBaseLocation} 
                    onChange={(e)=>setForm(prev=>({...prev,empBaseLocation:e.target.value}))} 
                    placeholder="Base Location"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Category</label>
                  <select 
                    value={form.empCategory} 
                    onChange={(e)=>setForm(prev=>({...prev,empCategory:e.target.value}))} 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  >
                    <option value="">Select Employee Category</option>
                    <option value="Fulltime">Fulltime</option>
                    <option value="Parttime">Parttime</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Regular">Regular</option>
                    <option value="PPO">PPO</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Work Department</label>
                  <input 
                    value={form.workDepartment} 
                    onChange={(e)=>setForm(prev=>({...prev,workDepartment:e.target.value}))} 
                    placeholder="Work Department"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select 
                    value={form.empGender} 
                    onChange={(e)=>setForm(prev=>({...prev,empGender:e.target.value}))} 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Active</label>
                  <select 
                    value={form.empActive ? 'true' : 'false'} 
                    onChange={(e)=>setForm(prev=>({...prev,empActive:e.target.value === 'true'}))} 
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Working Day</label>
                  <input 
                    value={form.lastWorkingDay} 
                    onChange={(e)=>setForm(prev=>({...prev,lastWorkingDay:e.target.value}))} 
                    type="date"
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skill 1</label>
                    <input 
                      value={form.skill1} 
                      onChange={(e)=>setForm(prev=>({...prev,skill1:e.target.value}))} 
                      placeholder="Skill 1"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    />
                    <label className="block text-xs font-medium text-gray-600 mt-2 mb-1">Experience (optional)</label>
                    <input
                      value={form.skill1Experience}
                      onChange={(e)=>setForm(prev=>({...prev,skill1Experience:e.target.value}))}
                      placeholder="e.g., 2 years"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select 
                      value={form.skill1Priority} 
                      onChange={(e)=>setForm(prev=>({...prev,skill1Priority:e.target.value}))} 
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    >
                      <option value="">Select Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skill 2</label>
                    <input 
                      value={form.skill2} 
                      onChange={(e)=>setForm(prev=>({...prev,skill2:e.target.value}))} 
                      placeholder="Skill 2"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    />
                    <label className="block text-xs font-medium text-gray-600 mt-2 mb-1">Experience (optional)</label>
                    <input
                      value={form.skill2Experience}
                      onChange={(e)=>setForm(prev=>({...prev,skill2Experience:e.target.value}))}
                      placeholder="e.g., 3 years"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select 
                      value={form.skill2Priority} 
                      onChange={(e)=>setForm(prev=>({...prev,skill2Priority:e.target.value}))} 
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    >
                      <option value="">Select Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skill 3</label>
                    <input 
                      value={form.skill3} 
                      onChange={(e)=>setForm(prev=>({...prev,skill3:e.target.value}))} 
                      placeholder="Skill 3"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    />
                    <label className="block text-xs font-medium text-gray-600 mt-2 mb-1">Experience (optional)</label>
                    <input
                      value={form.skill3Experience}
                      onChange={(e)=>setForm(prev=>({...prev,skill3Experience:e.target.value}))}
                      placeholder="e.g., 1 year"
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select 
                      value={form.skill3Priority} 
                      onChange={(e)=>setForm(prev=>({...prev,skill3Priority:e.target.value}))} 
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                    >
                      <option value="">Select Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo URL (optional)</label>
                <input 
                  value={form.photo} 
                  onChange={(e)=>setForm(prev=>({...prev,photo:e.target.value}))} 
                  placeholder="Photo URL" 
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaffForEdit(null);
                  setForm({ 
                    firstName: '', 
                    middleName: '', 
                    lastName: '', 
                    address: '', 
                    mobile: '', 
                    email: '', 
                    emergencyContactNumber: '', 
                    reportingManagerId: '',
                    joiningDate: '',
                    empLevel: '',
                    empBaseLocation: '',
                    empCategory: '',
                    workDepartment: '',
                    empGender: '',
                    empActive: true,
                    lastWorkingDay: '',
                    skill1: '',
                    skill1Priority: '',
                    skill1Experience: '',
                    skill2: '',
                    skill2Priority: '',
                    skill2Experience: '',
                    skill3: '',
                    skill3Priority: '',
                    skill3Experience: '',
                    photo: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
                className="px-5 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStaff}
                disabled={isUpdatingStaff}
                className={`px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold ${isUpdatingStaff ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUpdatingStaff ? 'Updating...' : 'Update Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Reporting Manager Modal */}
      {showAssignReportingManagerModal && newlyCreatedStaff && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-black">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Reporting Manager</h3>
            <p className="text-gray-700 mb-6">
              Assign or update who <span className="font-semibold">{newlyCreatedStaff.name}</span> reports to.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Reporting Manager
              </label>
              {isLoadingAssignableParents ? (
                <div className="py-3 text-sm text-gray-500">Loading managers...</div>
              ) : assignableParents.length === 0 ? (
                <div className="py-3 text-sm text-gray-500">
                  No assignable managers returned for this staff member.
                </div>
              ) : (
                <>
                  <select
                    value={selectedReportingManagerId}
                    onChange={(e) => setSelectedReportingManagerId(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">No Reporting Manager</option>
                    {assignableParents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                        {typeof parent.level === 'number' ? ` (Level ${parent.level})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Choose "No Reporting Manager" to keep this staff unassigned.
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseAssignReportingManagerModal}
                className="px-5 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignReportingManager}
                disabled={isAssigningReportingManager || isLoadingAssignableParents || assignableParents.length === 0}
                className={`px-5 py-2 rounded-lg font-semibold text-white ${
                  isAssigningReportingManager || isLoadingAssignableParents || assignableParents.length === 0
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isAssigningReportingManager ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venues List Modal */}
      {showVenuesListModal && selectedStaffForVenuesList && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto border border-black">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              All Assigned Venues - {selectedStaffForVenuesList.name}
            </h3>
            <div className="space-y-2 mb-4">
              {selectedStaffForVenuesList.assignedVenues && selectedStaffForVenuesList.assignedVenues.length > 0 ? (
                selectedStaffForVenuesList.assignedVenues.map(venueId => {
                  const venue =
                    effectiveVenues.find(v => v.id === venueId || String(v.id) === String(venueId)) ||
                    selectedStaffForVenuesList.assignedVenuesDetailed?.find(v => v.id === venueId || String(v.id) === String(venueId));
                  if (!venue) {
                    return (
                      <div key={venueId} className="p-3 border-2 border-gray-200 rounded-lg">
                        <div className="font-semibold text-gray-900">Venue #{venueId}</div>
                        <div className="text-sm text-gray-600">Location not specified</div>
                      </div>
                    );
                  }
                  return (
                    <div key={venueId} className="p-3 border-2 border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{venue.name}</div>
                      <div className="text-sm text-gray-600">{venue.city || venue.locality || venue.location?.city || venue.location || 'Location not specified'}</div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No venues assigned.</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowVenuesListModal(false);
                  setSelectedStaffForVenuesList(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign action popup */}
      {assignActionModalStaff && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Assign</p>
                <p className="text-lg font-bold text-gray-900">
                  {assignStaffIds.length > 1
                    ? `${assignStaffIds.length} staff selected`
                    : assignActionModalStaff?.name || 'Staff'}
                </p>
              </div>
              <button
                onClick={closeAssignActionModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {assignModalStep === 'options' && (
                <>
                  {ASSIGNMENT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleAssignOptionSelect(option.key)}
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition"
                    >
                      <div className="text-base font-semibold text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </button>
                  ))}
                </>
              )}

              {assignModalStep === 'entities' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Assign</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {ASSIGN_CATEGORY_LABELS[selectedAssignCategory] || 'Entities'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAssignModalStep('options');
                        setSelectedAssignCategory(null);
                        setAssignableEntities([]);
                        setAssignableEntitiesError('');
                        setSelectedAssignableEntityId('');
                        setIsAssigningEntity(false);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      ← Back
                    </button>
                  </div>

                  {assignableEntitiesError && (
                    <div className="p-3 border border-red-200 rounded-lg text-sm text-red-700 bg-red-50">
                      {assignableEntitiesError}
                    </div>
                  )}

                  {isLoadingAssignableEntities ? (
                    <div className="text-center py-6 text-sm text-gray-600">Loading options...</div>
                  ) : assignableEntities.length > 0 ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700">
                        Select {ASSIGN_CATEGORY_LABELS[selectedAssignCategory] || 'item'}
                      </label>
                      <select
                        value={selectedAssignableEntityId}
                        onChange={(e) => setSelectedAssignableEntityId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Choose an option</option>
                        {assignableEntities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                            {entity.city ? ` — ${entity.city}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No assignable {ASSIGN_CATEGORY_LABELS[selectedAssignCategory]?.toLowerCase() || 'items'} found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeAssignActionModal}
                disabled={isAssigningEntity || isLoadingAssignableEntities}
                className={`px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 ${
                  isAssigningEntity || isLoadingAssignableEntities ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                Cancel
              </button>
              {assignModalStep === 'entities' && (
                <button
                  onClick={handleConfirmEntityAssignment}
                  disabled={
                    isAssigningEntity ||
                    isLoadingAssignableEntities ||
                    !selectedAssignableEntityId
                  }
                  className={`px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 ${
                    isAssigningEntity ||
                    isLoadingAssignableEntities ||
                    !selectedAssignableEntityId
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isAssigningEntity ? 'Assigning...' : 'Assign'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
