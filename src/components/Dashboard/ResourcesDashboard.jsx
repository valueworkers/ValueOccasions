import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiX, FiMapPin, FiEdit2, FiTrash2 } from 'react-icons/fi';
import subramanyaImage from './assest/subramanya.jpeg';
import krishnaImage from "./assest/Krishna.jpeg"
import Nandi from "./assest/Nandi.jpeg"
import Ganesha from "./assest/Ganesha.jpeg"
import DurgaDevi from "./assest/DurgaDevi.jpeg"

const photoByName = (name) => {
  const n = name.toLowerCase();
  const mapping = [
    { keywords: ['ganesha', 'god idol'], url: 'https://images.unsplash.com/photo-1567591391293-f9a99c77e128?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['background', 'backdrop'], url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['flower'], url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['balloon'], url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['mandap', 'shamiana'], url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['wedding arch'], url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['fairy lights', 'chandeliers', 'led lights'], url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['carpet'], url: 'https://images.unsplash.com/photo-1614080035039-af24354a6478?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['photo booth'], url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['chair'], url: 'https://images.unsplash.com/photo-1571428229830-4f2e5b3f0c74?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['sofa'], url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2a02?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['dining tables', 'round tables'], url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['cocktail tables'], url: 'https://images.unsplash.com/photo-1541542684-4a88a05b76d3?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['dj', 'sound system'], url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['speakers', 'microphones'], url: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['led screens', 'projectors'], url: 'https://images.unsplash.com/photo-1514302240736-b1fee5985889?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['dance floor'], url: 'https://images.unsplash.com/photo-1511110011919-7fea1f0e2c69?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['stage platforms', 'risers'], url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['cutlery'], url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['serving counters', 'buffet'], url: 'https://images.unsplash.com/photo-1604908176997-fbf48fd15698?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['chafing dishes'], url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['juice', 'mocktail'], url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['coffee machine', 'tea stall'], url: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['fans', 'coolers', 'heaters'], url: 'https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['portable ac'], url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['generators', 'backup power'], url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['bouncy castle', 'inflatable'], url: 'https://images.unsplash.com/photo-1528763380143-65b3acfd0df6?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['magician', 'clown'], url: 'https://images.unsplash.com/photo-1505744762024-59cf4f3b6b3b?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['cake table'], url: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['party props'], url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop' },
    { keywords: ['themed cutouts', 'cartoon'], url: 'https://images.unsplash.com/photo-1542452255191-c85a98f2c5b9?q=80&w=1200&auto=format&fit=crop' },
  ];

  const found = mapping.find(item =>
    item.keywords.some(k => n.includes(k))
  );

  return found
    ? found.url
    : 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?q=80&w=1200&auto=format&fit=crop';
};

const ITEMS_PER_PAGE = 6;

const ResourcesDashboard = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [adminResources, setAdminResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    address: '',
    description: '',
    photo: '',
    mode: 'rent'
  });

  const defaultStaticResources = useMemo(() => [
    {
      id: 1001,
      name: 'Subramanya Swamy Idol',
      price: '₹18900',
      address: 'Bengaluru, KA, India',
      description: 'A beautifully crafted Subramanya Swamy idol featuring Lord Murugan with His sacred Vel and peacock. Symbolizing courage, wisdom, and protection, this idol brings peace, positivity, and divine blessings to any home or temple.',
      photo: subramanyaImage,
      mode: 'sell',
      isAdminAdded: true
    },
    {
      id: 1002,
      name: 'Krishna Idol',
      price: '₹11000',
      address: 'Bengaluru, KA, India',
      description: 'A beautifully crafted Krishna idol',
      photo: krishnaImage,
      mode: 'rent',
      isAdminAdded: true
    },
    {
      id: 1003,
      name: 'Nandi Idol',
      price: '₹19000',
      address: 'Bengaluru, KA, India',
      description: 'A beautifully crafted Nandi idol',
      photo:  Nandi,
      mode: 'sell',
      isAdminAdded: true
    },
    {
      id: 1004,
      name: 'Ganesha Idol',
      price: '₹10700',
      address: 'Bengaluru, KA, India',
      description: 'A beautifully crafted Ganesha idol',
      photo: Ganesha,
      mode: 'rent',
      isAdminAdded: true
    },
    {
      id: 1005,
      name: 'Durga Devi',
      price: '₹8050',
      address: 'Bengaluru, KA, India',
      description: 'A beautifully crafted Durga Devi idol',
      photo: DurgaDevi,
      mode: 'sell',
      isAdminAdded: true
    }
  ], []);

  // Load admin resources from localStorage
  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadResources = () => {
    try {
      const raw = localStorage.getItem('adminResources');
      let savedResources = raw ? JSON.parse(raw) : [];

      if (!Array.isArray(savedResources)) {
        savedResources = [];
      }

      const savedMap = new Map(savedResources.map((resource) => [resource.id, resource]));
      let hasChanges = false;

      const mergedDefaults = defaultStaticResources.map((defaultResource) => {
        const existing = savedMap.get(defaultResource.id);

        if (!existing) {
          hasChanges = true;
          return defaultResource;
        }

        const trackedKeys = ['name', 'price', 'address', 'description', 'photo', 'mode'];
        const differs = trackedKeys.some((key) => existing[key] !== defaultResource[key]);

        if (differs) {
          hasChanges = true;
          savedMap.delete(defaultResource.id);
          return { ...defaultResource, isAdminAdded: existing.isAdminAdded ?? defaultResource.isAdminAdded };
        }

        savedMap.delete(defaultResource.id);
        return existing;
      });

      const customResources = Array.from(savedMap.values());
      const finalResources = [...mergedDefaults, ...customResources];

      if (hasChanges || savedResources.length === 0) {
        localStorage.setItem('adminResources', JSON.stringify(finalResources));
      }

      setAdminResources(finalResources);
    } catch (error) {
      console.error('Error loading admin resources:', error);
      setAdminResources(defaultStaticResources);
      localStorage.setItem('adminResources', JSON.stringify(defaultStaticResources));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      address: '',
      description: '',
      photo: '',
      mode: 'rent'
    });
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        photo: reader.result || ''
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddResource = () => {
    if (!formData.name || !formData.price || !formData.address || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const priceWithMode = formData.mode === 'sell' 
      ? formData.price 
      : `${formData.price} / day`;

    const newResource = {
      id: Date.now(),
      name: formData.name,
      price: priceWithMode,
      address: formData.address,
      description: formData.description,
      photo: formData.photo || photoByName(formData.name),
      mode: formData.mode,
      isAdminAdded: true
    };

    const updatedResources = [...adminResources, newResource];
    setAdminResources(updatedResources);
    localStorage.setItem('adminResources', JSON.stringify(updatedResources));
    
    resetForm();
    setShowAddModal(false);
    loadResources();
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    // Extract base price (remove " / day" if present)
    const basePrice = resource.price.replace(' / day', '').trim();
    setFormData({
      name: resource.name,
      price: basePrice,
      address: resource.address,
      description: resource.description,
      photo: resource.photo,
      mode: resource.mode || 'rent'
    });
    setShowEditModal(true);
  };

  const handleUpdateResource = () => {
    if (!formData.name || !formData.price || !formData.address || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const priceWithMode = formData.mode === 'sell' 
      ? formData.price 
      : `${formData.price} / day`;

    const updatedResource = {
      ...editingResource,
      name: formData.name,
      price: priceWithMode,
      address: formData.address,
      description: formData.description,
      photo: formData.photo || photoByName(formData.name),
      mode: formData.mode,
      isAdminAdded: true
    };

    const updatedResources = adminResources.map(r => r.id === editingResource.id ? updatedResource : r);
    setAdminResources(updatedResources);
    localStorage.setItem('adminResources', JSON.stringify(updatedResources));
    
    resetForm();
    setShowEditModal(false);
    setEditingResource(null);
    loadResources();
  };

  const handleDeleteResource = (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      const updatedResources = adminResources.filter(r => r.id !== resourceId);
      setAdminResources(updatedResources);
      localStorage.setItem('adminResources', JSON.stringify(updatedResources));
      loadResources();
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(adminResources.length / ITEMS_PER_PAGE)), [adminResources.length]);
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return adminResources.slice(start, start + ITEMS_PER_PAGE);
  }, [adminResources, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [adminResources.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="py-3 px-1">
      <div className="max-w-7xl mx-auto">
        {/* Add Resource Button */}
        <div className="mb-3 flex justify-end gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Resource
          </button>
        </div>

        {/* Resources List */}
        <div className="flex flex-col gap-2">
          {adminResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResources.map((resource) => {
                const isRent = resource.price.includes('/ day') || resource.mode === 'rent';
                return (
                  <div key={resource.id} className="relative bg-white rounded-xl shadow-sm ring-1 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ring-gray-200 flex flex-col">
                    <span className="absolute inset-x-0 top-0 h-1 bg-fuchsia-500"></span>
                    <div className="h-36 w-full overflow-hidden">
                      <img
                        src={resource.photo}
                        alt={resource.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?q=80&w=1200&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 flex-1 min-w-0">{resource.name}</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2 py-1 ring-1 ${isRent ? 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                            {resource.price}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-3">{resource.description}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                        <FiMapPin className="text-gray-500" />
                        <span>{resource.address}</span>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditResource(resource)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                            title="Edit Resource"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                            title="Delete Resource"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center text-gray-600">No resources found.</div>
          )}
        </div>
        {adminResources.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold">
                {adminResources.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, adminResources.length)}
              </span>{' '}
              of <span className="font-semibold">{adminResources.length}</span> resources
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

        {/* Edit Resource Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); resetForm(); setEditingResource(null); }} />
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Edit Resource</h2>
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); setEditingResource(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter resource name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="₹1,500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter price only (e.g., ₹1,500). "/ day" will be added automatically for rent mode.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location/Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mumbai, MH, India"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({...formData, mode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="rent">Rent</option>
                      <option value="sell">Sell / Buy</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate image based on resource name</p>
                      {formData.photo && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Preview:</p>
                          <img
                            src={formData.photo}
                            alt="Resource preview"
                            className="w-full max-h-40 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="High-quality resource available for events and functions. Setup and delivery options available."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); setEditingResource(null); }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateResource}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Resource
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Resource Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); resetForm(); }} />
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Add New Resource</h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter resource name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="₹1,500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter price only (e.g., ₹1,500). "/ day" will be added automatically for rent mode.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location/Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mumbai, MH, India"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({...formData, mode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="rent">Rent</option>
                      <option value="sell">Sell / Buy</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate image based on resource name</p>
                      {formData.photo && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Preview:</p>
                          <img
                            src={formData.photo}
                            alt="Resource preview"
                            className="w-full max-h-40 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="High-quality resource available for events and functions. Setup and delivery options available."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddResource}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Resource
                </button>
              </div>
        </div>
      </div>
        )}
    </div>
  </div>
);
};

export default ResourcesDashboard;
