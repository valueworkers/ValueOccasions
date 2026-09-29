import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const DEFAULT_MANAGER_PHOTO = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D';

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

const resolveNextPageUrl = (payload) => {
  if (!payload) return null;
  return (
    payload.next ||
    payload.links?.next ||
    payload.data?.next ||
    payload.data?.links?.next ||
    null
  );
};

const ITEMS_PER_PAGE = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ASSIGNMENT_OPTIONS = [
  {
    key: 'venues',
    label: 'Venues',
    description: 'Allocate venues to this manager',
  },
  {
    key: 'services',
    label: 'Services',
    description: 'Assign service responsibilities',
  },
  {
    key: 'resources',
    label: 'Resources',
    description: 'Map resource ownership',
  },
];

const validateAddManagerForm = (formState) => {
  const trimmedFirstName = formState.firstName?.trim();
  if (!trimmedFirstName) return 'First Name is required.';

  const trimmedLastName = formState.lastName?.trim();
  if (!trimmedLastName) return 'Last Name is required.';

  const email = formState.email?.trim();
  if (!email) return 'Email is required.';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';

  const mobile = formState.mobile?.trim();
  if (!mobile) return 'Mobile number is required.';
  const mobileDigits = mobile.replace(/\D/g, '');
  if (mobileDigits.length < 10) {
    return 'Please enter a valid mobile number with at least 10 digits.';
  }

  const password = formState.password || '';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters long.';

  const confirmPassword = formState.confirmPassword || '';
  if (!confirmPassword) return 'Confirm Password is required.';
  if (password !== confirmPassword) return 'Password and Confirm Password must match.';

  const baseCity = formState.empBaseLocation?.trim();
  if (!baseCity) return 'Base City is required.';

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
        if (nested) {
          return nested;
        }
      }
    }
  }

  return fallbackMessage;
};

const ManagerDashboard = ({ subTab: propSubTab, setSubTab: propSetSubTab }) => {
  const [authUser, setAuthUser] = useState(null);
  const [internalSubTab, setInternalSubTab] = useState('my'); // my | add | terminate
  const activeTab = propSubTab !== undefined ? propSubTab : internalSubTab;
  const setActiveTab = propSetSubTab || setInternalSubTab;
  const [managers, setManagers] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [managersError, setManagersError] = useState('');
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
  const [selectedManagerForVenue, setSelectedManagerForVenue] = useState(null);
  const [selectedManagerForEdit, setSelectedManagerForEdit] = useState(null);
  const [selectedManagerForVenuesList, setSelectedManagerForVenuesList] = useState(null);
  const [newlyCreatedManager, setNewlyCreatedManager] = useState(null);
  const [selectedReportingManagerId, setSelectedReportingManagerId] = useState('');
  const [selectedVenueIds, setSelectedVenueIds] = useState([]);
  const [assignActionModalManager, setAssignActionModalManager] = useState(null);
  const [assignModalStep, setAssignModalStep] = useState('options'); // options | entities
  const [selectedAssignCategory, setSelectedAssignCategory] = useState(null);
  const [assignableEntities, setAssignableEntities] = useState([]);
  const [isLoadingAssignableEntities, setIsLoadingAssignableEntities] = useState(false);
  const [assignableEntitiesError, setAssignableEntitiesError] = useState('');
  const [selectedAssignableEntityId, setSelectedAssignableEntityId] = useState('');
  const [isAssigningEntity, setIsAssigningEntity] = useState(false);
  const [selectedManagerIds, setSelectedManagerIds] = useState([]);
  const [assignManagerIds, setAssignManagerIds] = useState([]);

  const normalizeManagerIdList = (ids) => {
    if (!ids || ids.length === 0) return [];
    const normalizedList = [];
    const seen = new Set();
    ids.forEach((id) => {
      if (id === null || id === undefined) return;
      const numeric = Number(id);
      const normalized = Number.isNaN(numeric) ? String(id) : numeric;
      const key = String(normalized);
      if (!seen.has(key)) {
        seen.add(key);
        normalizedList.push(normalized);
      }
    });
    return normalizedList;
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingManager, setIsUpdatingManager] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ type: null, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [assignableParents, setAssignableParents] = useState([]);
  const [isLoadingAssignableParents, setIsLoadingAssignableParents] = useState(false);
  const [isAssigningReportingManager, setIsAssigningReportingManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get venues from Redux store
  const venues = useSelector(state => state.venues.venues || []);

  const fetchManagers = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      setManagers([]);
      setManagersError('Authorization token missing. Please log in again.');
      return;
    }

    setIsLoadingManagers(true);
    setManagersError('');

    const extractManagersArray = (payload) => {
      if (!payload) return [];
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload.results)) return payload.results;
      if (Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload.data?.results)) return payload.data.results;
      return [];
    };

    try {
      const aggregatedManagers = [];
      const visitedUrls = new Set();
      const baseUrl = `${import.meta.env.VITE_BASEURL}`.replace(/\/$/, '');
      const initialUrl = `${baseUrl}/accounts/vsre-manager/`;
      let nextUrl = initialUrl;

      const normalizeNextUrl = (url) => {
        if (!url) return null;
        if (/^https?:\/\//i.test(url)) {
          return url;
        }
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        return `${baseUrl}/${url}`;
      };

      while (nextUrl && !visitedUrls.has(nextUrl)) {
        visitedUrls.add(nextUrl);
        const response = await axios.get(nextUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const managersPayload = extractManagersArray(response.data);
        aggregatedManagers.push(...managersPayload);

        const potentialNext = normalizeNextUrl(resolveNextPageUrl(response.data));
        if (!potentialNext || visitedUrls.has(potentialNext)) {
          break;
        }
        nextUrl = potentialNext;
      }

      const normalizedManagers = aggregatedManagers
        .map(normalizeManagerFromApi)
        .filter(Boolean);

      setManagers(normalizedManagers);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching managers:', error);
      const responseData = error.response?.data;
      let message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        error.message ||
        'Failed to fetch managers.';

      if (!message && responseData && typeof responseData === 'object') {
        const firstValue = Object.values(responseData).find(Boolean);
        if (Array.isArray(firstValue)) {
          message = firstValue[0];
        } else if (typeof firstValue === 'string') {
          message = firstValue;
        }
      }

      setManagersError(message || 'Failed to fetch managers.');
      setManagers([]);
    } finally {
      setIsLoadingManagers(false);
    }
  }, []);

  useEffect(() => {
    if (selectedManagerIds.length === 0) return;
    setSelectedManagerIds(prev =>
      prev.filter(selectedId =>
        managers.some(manager => String(manager.id) === String(selectedId))
      )
    );
  }, [managers]);

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

  const buildManagerApiPayload = (formState, options = {}) => {
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

  const createManagerFromFormState = (formState, overrides = {}) => {
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
      userPersona: 'MANAGER',
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
      photo: formState.photo || DEFAULT_MANAGER_PHOTO,
      assignedVenues: overrides.assignedVenues || [],
    };
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

  const normalizeManagerFromApi = (data) => {
    if (!data) return null;

    const normalizedSkills = normalizeSkillsFromApi(data.skills);
    const parentInfo = data.reports_to;
    const [skill1Data, skill2Data, skill3Data] = [...normalizedSkills, {}, {}, {}];

    const fullName = [data.first_name, data.middle_name, data.last_name]
      .filter(Boolean)
      .join(' ');

    const managedVenues = Array.isArray(data.managed_venues) ? data.managed_venues : [];
    const managedVenueIds = managedVenues.map(venue => {
      if (venue && typeof venue === 'object') {
        return venue.id ?? venue.object_id ?? Date.now();
      }
      return venue ?? Date.now();
    });

    return {
      id: data.id ?? Date.now(),
      name: fullName || data.name || 'New Manager',
      firstName: data.first_name || '',
      middleName: data.middle_name || '',
      lastName: data.last_name || '',
      address: data.address || '',
      mobile: data.mobile_number || data.phone || '',
      phone: data.mobile_number || data.phone || '',
      email: data.email || '',
      emergencyContactNumber: data.emergency_contact || '',
      userPersona: 'MANAGER',
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
      photo: data.photo || DEFAULT_MANAGER_PHOTO,
      assignedVenues: managedVenueIds.length > 0
        ? managedVenueIds
        : data.assigned_venues || data.assignedVenues || [],
      managedVenuesDetailed: managedVenues.length > 0 ? managedVenues : undefined,
    };
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

  useEffect(() => {
    if (activeTab !== 'add' && formFeedback.type) {
      setFormFeedback({ type: null, message: '' });
    }
  }, [activeTab, formFeedback.type]);

  // Venues are now loaded from Redux store, no need to fetch separately

  const isVsreOwner = useMemo(() => {
    const check = authUser?.user_type === 'VSRE_OWNER';
    return check;
  }, [authUser]);

  useEffect(() => {
    if (isVsreOwner) {
      fetchManagers();
    } else {
      setManagers([]);
      setManagersError('');
    }
  }, [isVsreOwner, fetchManagers]);

  const filteredManagers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return managers;

    return managers.filter((manager) => {
      const fields = [
        manager.name,
        manager.email,
        manager.mobile,
        manager.phone,
        manager.empBaseLocation,
        manager.address,
      ];

      return fields.some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(term)
      );
    });
  }, [managers, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredManagers.length]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredManagers.length / ITEMS_PER_PAGE));
  }, [filteredManagers.length]);

  const hasMultiplePages = totalPages > 1;
  const shouldShowPagination = filteredManagers.length > 0;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedManagers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredManagers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredManagers, currentPage]);

  const addManager = async () => {
    if (!isVsreOwner) {
      setFormFeedback({ type: 'error', message: 'Only owners can add managers.' });
      return;
    }

    setFormFeedback({ type: null, message: '' });

    const validationError = validateAddManagerForm(form);
    if (validationError) {
      setFormFeedback({ type: 'error', message: validationError });
      return;
    }

    if (!form.empCategory) {
      setFormFeedback({ type: 'error', message: 'Please select an employee category.' });
      return;
    }

    const payload = buildManagerApiPayload(form, { includeCredentials: true });

    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      setFormFeedback({ type: 'error', message: 'Authorization token missing. Please log in again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/accounts/vsre-manager/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const responseData = response.data?.data || response.data;
      const normalizedManager = normalizeManagerFromApi(responseData);
      const managerForModal = normalizedManager || createManagerFromFormState(form, { id: responseData?.id });
      const successMessage = response.data?.message || 'Manager created successfully.';

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

      await fetchManagers();
    } catch (error) {
      console.error('Error creating manager:', error);
      const responseData = error.response?.data;
      const message = extractApiErrorMessage(responseData, error.message || 'Failed to add manager.');

      setFormFeedback({ type: 'error', message });
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const terminateManager = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this manager? This action cannot be undone.')) {
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASEURL}/accounts/vsre-manager/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Remove manager from local state
      setManagers(prev => prev.filter(m => m.id !== id));
      alert('Manager terminated successfully!');
    } catch (error) {
      console.error('Error terminating manager:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to terminate manager. Please try again.';
      alert(errorMessage);
    }
  };

  const handleEditManager = (manager) => {
    setSelectedManagerForEdit(manager);
    const skillsArray = Array.isArray(manager.skills) ? manager.skills : [];
    const [skill1Data, skill2Data, skill3Data] = [...skillsArray, {}, {}, {}];

    setForm({
      firstName: manager.firstName || '',
      middleName: manager.middleName || '',
      lastName: manager.lastName || '',
      address: manager.address || '',
      mobile: manager.mobile || manager.phone || '',
      email: manager.email || '',
      emergencyContactNumber: manager.emergencyContactNumber || '',
      reportingManagerId: manager.reportingManagerId || '',
      joiningDate: manager.joiningDate || '',
      empLevel: manager.empLevel || '',
      empBaseLocation: manager.empBaseLocation || manager.city || '',
      empCategory: manager.empCategory || manager.category || '',
      workDepartment: manager.workDepartment || '',
      empGender: mapGenderCodeToLabel(manager.empGender) || manager.empGender || '',
      empActive: manager.empActive !== undefined ? manager.empActive : true,
      lastWorkingDay: manager.lastWorkingDay || '',
      skill1: manager.skill1 || skill1Data.skill || '',
      skill1Priority: manager.skill1Priority || priorityNumberToLabel(skill1Data.priority) || '',
      skill1Experience: manager.skill1Experience || skill1Data.experience || '',
      skill2: manager.skill2 || skill2Data.skill || '',
      skill2Priority: manager.skill2Priority || priorityNumberToLabel(skill2Data.priority) || '',
      skill2Experience: manager.skill2Experience || skill2Data.experience || '',
      skill3: manager.skill3 || skill3Data.skill || '',
      skill3Priority: manager.skill3Priority || priorityNumberToLabel(skill3Data.priority) || '',
      skill3Experience: manager.skill3Experience || skill3Data.experience || '',
      photo: manager.photo || '',
      password: '',
      confirmPassword: '',
    });
    setShowEditModal(true);
  };

  const handleUpdateManager = async () => {
    if (!selectedManagerForEdit) return;
    
    if (!form.firstName || !form.lastName || !form.email || !form.mobile) {
      alert('Please fill in all required fields: First Name, Last Name, Email, and Mobile');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    const payload = buildManagerApiPayload(form);

    setIsUpdatingManager(true);

    try {
      await axios.patch(
        `${import.meta.env.VITE_BASEURL}/accounts/vsre-manager/${selectedManagerForEdit.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchManagers();

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
      setSelectedManagerForEdit(null);
    } catch (error) {
      console.error('Error updating manager:', error);
      const responseData = error.response?.data;
      const message = extractApiErrorMessage(responseData, error.message || 'Failed to update manager.');

      alert(message);
    } finally {
      setIsUpdatingManager(false);
    }
  };

  const openAssignVenueModal = (manager) => {
    setSelectedManagerForVenue(manager);
    setSelectedVenueIds(manager.assignedVenues || []);
    setShowAssignVenueModal(true);
  };

  const toggleManagerSelection = (managerId) => {
    setSelectedManagerIds(prev => {
      const idStr = String(managerId);
      const exists = prev.some(id => String(id) === idStr);
      if (exists) {
        return prev.filter(id => String(id) !== idStr);
      }
      return [...prev, managerId];
    });
  };

  const areAllVisibleManagersSelected = (visibleManagers) => {
    if (!visibleManagers || visibleManagers.length === 0) return false;
    return visibleManagers.every(manager =>
      selectedManagerIds.some(id => String(id) === String(manager.id))
    );
  };

  const toggleSelectAllVisibleManagers = (visibleManagers) => {
    if (!visibleManagers || visibleManagers.length === 0) return;
    const allSelected = areAllVisibleManagersSelected(visibleManagers);
    if (allSelected) {
      setSelectedManagerIds(prev =>
        prev.filter(
          id => !visibleManagers.some(manager => String(manager.id) === String(id))
        )
      );
    } else {
      const visibleIds = visibleManagers.map(manager => manager.id);
      setSelectedManagerIds(prev => {
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
    const managerIdForFetch = assignManagerIds[0];

    if (!managerIdForFetch) {
      setAssignModalStep('options');
      setAssignableEntitiesError('Select at least one manager before assigning.');
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
          params: { user_id: managerIdForFetch },
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
      !assignActionModalManager ||
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
          manager_ids: assignManagerIds.map(id => Number(id) || id),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchManagers();
      setSelectedManagerIds(prev =>
        prev.filter(
          id => !assignManagerIds.some(assignId => String(assignId) === String(id))
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

  const openAssignActionModal = (manager, overrideManagerIds = null) => {
    const fallbackIds =
      overrideManagerIds && overrideManagerIds.length > 0
        ? overrideManagerIds
        : selectedManagerIds.length > 0
          ? selectedManagerIds
          : manager
            ? [manager.id]
            : [];

    const normalizedIds = normalizeManagerIdList(fallbackIds);

    if (normalizedIds.length === 0) {
      alert('Select at least one manager to assign.');
      return;
    }

    const primaryManager =
      manager ||
      managers.find(m => normalizedIds.some(id => String(id) === String(m.id))) ||
      null;

    setAssignManagerIds(normalizedIds);
    setAssignActionModalManager(primaryManager);
    setAssignModalStep('options');
    setSelectedAssignCategory(null);
    setAssignableEntities([]);
    setAssignableEntitiesError('');
    setSelectedAssignableEntityId('');
    setIsLoadingAssignableEntities(false);
    setIsAssigningEntity(false);
  };

  const closeAssignActionModal = () => {
    setAssignActionModalManager(null);
    setAssignModalStep('options');
    setSelectedAssignCategory(null);
    setAssignableEntities([]);
    setAssignableEntitiesError('');
    setSelectedAssignableEntityId('');
    setIsLoadingAssignableEntities(false);
    setIsAssigningEntity(false);
    setAssignManagerIds([]);
  };

  const assignVenues = () => {
    if (!selectedManagerForVenue) return;
    
    const normalizedSelectedIds = selectedVenueIds.map(id => Number(id) || id);

    const resolvedVenuesDetails = normalizedSelectedIds
      .map(id => {
        const venue = venues.find(v => v.id === id || String(v.id) === String(id));
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

    setManagers(prev => prev.map(m => 
      m.id === selectedManagerForVenue.id 
        ? { 
            ...m, 
            assignedVenues: normalizedSelectedIds,
            managedVenuesDetailed: resolvedVenuesDetails,
          }
        : m
    ));
    
    setShowAssignVenueModal(false);
    setSelectedManagerForVenue(null);
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

  const fetchAssignableParents = useCallback(async (managerId) => {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      console.error('Authorization token missing. Please log in again.');
      return;
    }

    if (!managerId) {
      console.error('Manager ID is required to fetch assignable parents.');
      return;
    }

    setIsLoadingAssignableParents(true);
    setAssignableParents([]);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/accounts/assign/${managerId}/parent/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const parentsData = response.data?.assignable_parents || [];
      setAssignableParents(Array.isArray(parentsData) ? parentsData : []);
    } catch (error) {
      console.error('Error fetching assignable parents:', error);
      const responseData = error.response?.data;
      console.error('Error response data:', responseData);
      setAssignableParents([]);
    } finally {
      setIsLoadingAssignableParents(false);
    }
  }, []);

  const openReportingManagerAssignment = (manager) => {
    if (!manager) return;
    setNewlyCreatedManager(manager);
    // Reset to empty string so "Select from list" is the default
    setSelectedReportingManagerId('');
    setShowAssignReportingManagerModal(true);
    // Fetch assignable parents when modal opens
    if (manager.id) {
      fetchAssignableParents(manager.id);
    }
  };

  const handleAssignReportingManager = async () => {
    if (!newlyCreatedManager) return;

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    const rawValue = selectedReportingManagerId?.trim();
    
    // If no manager is selected, show message (or handle unassign if needed)
    if (!rawValue) {
      alert('Please select a reporting manager from the list.');
      return;
    }

    const parentManagerId = Number(rawValue);
    if (Number.isNaN(parentManagerId)) {
      alert('Invalid reporting manager selected.');
      return;
    }

    const managerId = newlyCreatedManager.id;
    if (!managerId) {
      alert('Manager ID is missing.');
      return;
    }

    setIsAssigningReportingManager(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/accounts/assign/${managerId}/parent/`,
        {
          parent_id: parentManagerId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local state
      setManagers(prev =>
        prev.map(m =>
          m.id === managerId ? { ...m, reportingManagerId: parentManagerId } : m
        )
      );

      // Refresh managers list to get updated data
      await fetchManagers();

      // Close modal and reset
      setShowAssignReportingManagerModal(false);
      setNewlyCreatedManager(null);
      setSelectedReportingManagerId('');
      setAssignableParents([]);
    } catch (error) {
      console.error('Error assigning reporting manager:', error);
      const responseData = error.response?.data;
      let message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        responseData?.error ||
        error.message ||
        'Failed to assign reporting manager.';

      if (!message && responseData && typeof responseData === 'object') {
        const firstValue = Object.values(responseData).find(Boolean);
        if (Array.isArray(firstValue)) {
          message = firstValue[0];
        } else if (typeof firstValue === 'string') {
          message = firstValue;
        }
      }

      alert(message || 'Failed to assign reporting manager.');
    } finally {
      setIsAssigningReportingManager(false);
    }
  };

  const handleCloseAssignReportingManagerModal = () => {
    setShowAssignReportingManagerModal(false);
    setNewlyCreatedManager(null);
    setSelectedReportingManagerId('');
    setAssignableParents([]);
  };

  return (
    <div className="w-full">
      {/* Top actions - only show if not controlled by parent */}
      {propSubTab === undefined && (
        <div className="flex items-center justify-between gap-4 mb-6">
          <button onClick={() => setActiveTab('my')} className={`flex-1 px-6 py-3 rounded-xl bg-white border-2 shadow-md transition-all ${activeTab==='my' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="font-semibold italic text-gray-900">My Managers</span>
          </button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 px-6 py-3 rounded-xl bg-white border-2 shadow-md transition-all ${activeTab==='add' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="font-semibold italic text-gray-900">Add Managers</span>
          </button>
          <button onClick={() => setActiveTab('terminate')} className={`flex-1 px-6 py-3 rounded-xl bg-white border-2 shadow-md transition-all ${activeTab==='terminate' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <span className="font-semibold italic text-gray-900">Terminate Managers</span>
          </button>
        </div>
      )}

      {/* Panels */}
      {!isVsreOwner && (
        <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center">
          <p className="text-gray-700 text-lg font-medium mb-2">Only VSRE_OWNERs can manage managers.</p>
          {authUser ? (
            <p className="text-sm text-gray-500">Current user type: <span className="font-semibold">{authUser.user_type || 'Not found'}</span></p>
          ) : (
            <p className="text-sm text-gray-500">No user logged in. Please log in as VSRE_OWNER.</p>
          )}
        </div>
      )}

      {isVsreOwner && activeTab === 'my' && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search managers by name, city, or contact"
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
            onClick={() => openAssignActionModal(null, selectedManagerIds)}
            disabled={selectedManagerIds.length === 0}
            className={`px-4 py-3 rounded-lg text-sm font-semibold ${
              selectedManagerIds.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            title="Assign selected managers"
          >
            Assign Selected {selectedManagerIds.length > 0 ? `(${selectedManagerIds.length})` : ''}
          </button>
        </div>
      )}

      {isVsreOwner && activeTab === 'my' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          {isLoadingManagers ? (
            <div className="text-center text-gray-600 py-12 text-lg">Loading managers...</div>
          ) : managersError ? (
            <div className="text-center text-red-600 py-12 text-lg">{managersError}</div>
          ) : filteredManagers.length === 0 ? (
            <div className="text-center text-gray-600 py-12 text-lg">
              {searchTerm.trim()
                ? (
                  <span>
                    No managers match "<span className="font-semibold text-gray-800">{searchTerm.trim()}</span>".
                  </span>
                )
                : 'No managers found.'}
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="py-3 px-3 text-left">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={areAllVisibleManagersSelected(paginatedManagers)}
                        onChange={() => toggleSelectAllVisibleManagers(paginatedManagers)}
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
                  {paginatedManagers.map(m => {
                    const isInactive = m.empActive === false;
                    // Handle both new skills array format and legacy format
                    let skillsArray = [];
                    if (Array.isArray(m.skills) && m.skills.length > 0) {
                      skillsArray = m.skills;
                    } else {
                      // Fallback to legacy format
                      if (m.skill1) {
                        skillsArray.push({
                          skill: m.skill1,
                          priority: priorityLabelToNumber(m.skill1Priority, 1),
                          experience: m.skill1Experience || ''
                        });
                      }
                      if (m.skill2) {
                        skillsArray.push({
                          skill: m.skill2,
                          priority: priorityLabelToNumber(m.skill2Priority, 2),
                          experience: m.skill2Experience || ''
                        });
                      }
                      if (m.skill3) {
                        skillsArray.push({
                          skill: m.skill3,
                          priority: priorityLabelToNumber(m.skill3Priority, 3),
                          experience: m.skill3Experience || ''
                        });
                      }
                    }
                    const [skill1Data, skill2Data, skill3Data] = [...skillsArray, {}, {}, {}];
                    const reportingManager = m.reportingManagerId 
                      ? managers.find(rm => rm.id === m.reportingManagerId || String(rm.id) === String(m.reportingManagerId))
                      : null;
                    // Use assigned_manager from API response if available, otherwise use reportingManager name
                    const displayReportingManager = m.assignedManager || (reportingManager ? reportingManager.name : null);

                    return (
                      <tr 
                        key={m.id} 
                        className={`border-b border-gray-200 transition-colors ${
                          isInactive 
                            ? 'bg-gray-50 opacity-75' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedManagerIds.some(id => String(id) === String(m.id))}
                            onChange={() => toggleManagerSelection(m.id)}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                        </td>
                        {/* Profile Pic, Name, Mobile */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img 
                              src={m.photo} 
                              alt={m.name} 
                              className={`w-12 h-12 rounded-full object-cover border-2 ${
                                isInactive 
                                  ? 'border-gray-300 opacity-60' 
                                  : 'border-indigo-300'
                              }`} 
                            />
                            <div>
                              <div className={`font-bold text-base ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                                {m.name}
                                {isInactive && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Inactive</span>
                                )}
                              </div>
                              <div className={`text-sm font-bold ${isInactive ? 'text-gray-400' : 'text-gray-600'}`}>
                                {m.mobile || m.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Venues */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            {m.assignedVenues && m.assignedVenues.length > 0 ? (
                              <>
                                {m.assignedVenues.slice(0, 2).map(venueId => {
                                  const venue =
                                    venues.find(v => v.id === venueId || String(v.id) === String(venueId)) ||
                                    m.managedVenuesDetailed?.find(v => v.id === venueId || String(v.id) === String(venueId));
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
                                {m.assignedVenues.length > 2 && (
                                  <button
                                    onClick={() => {
                                      setSelectedManagerForVenuesList(m);
                                      setShowVenuesListModal(true);
                                    }}
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                                  >
                                    +{m.assignedVenues.length - 2} more
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
                              {displayReportingManager ? (
                                <span className="font-bold">{displayReportingManager}</span>
                              ) : (
                                <span className="text-gray-400 italic">No reporting manager</span>
                              )}
                            </div>
                            <button
                              onClick={() => openReportingManagerAssignment(m)}
                              className="px-2.5 py-0.5 rounded-md border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors w-fit"
                            >
                              {displayReportingManager ? 'Change' : 'Assign'}
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

                        {/* Actions - Assign Venue and Edit Profile */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => !isInactive && openAssignActionModal(m, [m.id])}
                                disabled={isInactive}
                                className={`px-3.5 py-1.5 w-30 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                                  isInactive 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                                title={isInactive ? 'Cannot assign actions to inactive managers' : ''}
                              >
                                Assign
                              </button>
                            </div>
                            <button
                              onClick={() => handleEditManager(m)}
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

            {shouldShowPagination && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="text-sm text-gray-600">
                  Showing{' '}
                  <span className="font-semibold">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    -
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredManagers.length)}
                  </span>{' '}
                  of <span className="font-semibold">{filteredManagers.length}</span> managers
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() =>
                      setCurrentPage(prev => Math.min(totalPages, prev + 1))
                    }
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
      {showAssignVenueModal && selectedManagerForVenue && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-black">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Assign Venues to {selectedManagerForVenue.name}
            </h3>
            <div className="space-y-2 mb-4">
              {venues.length === 0 ? (
                <p className="text-gray-500">No venues available.</p>
              ) : (
                venues.map(venue => (
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
                  setSelectedManagerForVenue(null);
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

      {isVsreOwner && activeTab === 'add' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Manager</h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    value={form.password}
                    onChange={(e)=>setForm(prev=>({...prev,password:e.target.value}))}
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-16 text-gray-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    value={form.confirmPassword}
                    onChange={(e)=>setForm(prev=>({...prev,confirmPassword:e.target.value}))}
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-16 text-gray-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute inset-y-0 right-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
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
              onClick={addManager} 
              disabled={isSubmitting}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Adding...' : 'Add Manager'}
            </button>
          </div>
          {formFeedback.message && (
            <div className={`mt-4 text-sm ${formFeedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {formFeedback.message}
            </div>
          )}
        </div>
      )}

      {isVsreOwner && activeTab === 'terminate' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          {managers.length === 0 ? (
            <div className="text-center text-gray-600 py-12 text-lg">No managers to terminate.</div>
          ) : (
            <div className="divide-y-2 divide-gray-200">
              {managers.map(m => (
                <div key={m.id} className="flex items-center gap-4 py-4 hover:bg-white rounded-lg px-2 transition-colors">
                  <img src={m.photo} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-300" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-lg truncate">{m.name}</div>
                    <div className="text-sm text-gray-700 truncate">{m.email} • {m.phone}</div>
                  </div>
                  <button onClick={()=>terminateManager(m.id)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition-colors whitespace-nowrap">Terminate</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Manager Modal */}
      {showEditModal && selectedManagerForEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Manager Profile</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedManagerForEdit(null);
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
                  setSelectedManagerForEdit(null);
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
                onClick={handleUpdateManager}
                disabled={isUpdatingManager}
                className={`px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold ${isUpdatingManager ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUpdatingManager ? 'Updating...' : 'Update Manager'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Reporting Manager Modal */}
      {showAssignReportingManagerModal && newlyCreatedManager && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-black">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Reporting Manager</h3>
            <p className="text-gray-700 mb-6">
              Assign or update who <span className="font-semibold">{newlyCreatedManager.name}</span> reports to.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Reporting Manager
              </label>
              {isLoadingAssignableParents ? (
                <div className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-600 text-center">
                  Loading assignable managers...
                </div>
              ) : (
                <select
                  value={selectedReportingManagerId}
                  onChange={(e) => setSelectedReportingManagerId(e.target.value)}
                  disabled={isAssigningReportingManager}
                  className={`w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:border-indigo-500 ${
                    isAssigningReportingManager ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select from list</option>
                  {assignableParents.length > 0 ? (
                    assignableParents.map((parent) => {
                      // Handle different possible data structures from API
                      const parentId = parent.id || parent.manager_id || parent.managerId;
                      const parentName = parent.name || 
                                       `${parent.first_name || ''} ${parent.middle_name || ''} ${parent.last_name || ''}`.trim() ||
                                       `${parent.firstName || ''} ${parent.middleName || ''} ${parent.lastName || ''}`.trim() ||
                                       parent.email ||
                                       'Unknown Manager';
                      
                      return (
                        <option key={parentId} value={parentId}>
                          {parentName}
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>No assignable managers available</option>
                  )}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {selectedReportingManagerId ? 'Selected manager will be assigned as reporting manager.' : 'Select a manager from the list above.'}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseAssignReportingManagerModal}
                disabled={isAssigningReportingManager}
                className={`px-5 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold ${
                  isAssigningReportingManager ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignReportingManager}
                disabled={isAssigningReportingManager || !selectedReportingManagerId}
                className={`px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold ${
                  isAssigningReportingManager || !selectedReportingManagerId
                    ? 'opacity-70 cursor-not-allowed'
                    : ''
                }`}
              >
                {isAssigningReportingManager ? 'Assigning...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venues List Modal */}
      {showVenuesListModal && selectedManagerForVenuesList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              All Assigned Venues - {selectedManagerForVenuesList.name}
            </h3>
            <div className="space-y-2 mb-4">
              {selectedManagerForVenuesList.assignedVenues && selectedManagerForVenuesList.assignedVenues.length > 0 ? (
                selectedManagerForVenuesList.assignedVenues.map(venueId => {
                  const venue =
                    venues.find(v => v.id === venueId || String(v.id) === String(venueId)) ||
                    selectedManagerForVenuesList.managedVenuesDetailed?.find(
                      v => v.id === venueId || String(v.id) === String(venueId)
                    );
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
                      <div className="text-sm text-gray-600">{venue.city || venue.locality || 'Location not specified'}</div>
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
                  setSelectedManagerForVenuesList(null);
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
      {assignActionModalManager && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Assign</p>
                <p className="text-lg font-bold text-gray-900">
                  {assignManagerIds.length > 1
                    ? `${assignManagerIds.length} managers selected`
                    : assignActionModalManager?.name || 'Manager'}
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

export default ManagerDashboard;

