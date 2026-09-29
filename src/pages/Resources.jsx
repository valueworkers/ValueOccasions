import React, { useMemo, useState, useEffect } from 'react'
import { FiMapPin, FiXCircle } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Resources = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const selectedResourceType = searchParams.get('resourceType') || ''
	const mode = (searchParams.get('mode') || 'rent').toLowerCase()
	const [query, setQuery] = useState('')
	const [priceMin, setPriceMin] = useState('')
	const [priceMax, setPriceMax] = useState('')

	// Authentication state (for navigation only)
	const [authUser, setAuthUser] = useState(null)

	// Resource management state (shared with admin dashboard)
	const [adminResources, setAdminResources] = useState(() => {
		try {
			const savedAdminResources = localStorage.getItem('adminResources')
			if (savedAdminResources) {
				return JSON.parse(savedAdminResources)
			}
		} catch (error) {
			console.error('Error loading admin resources from localStorage:', error)
		}
		return []
	})

	// Check authentication status
	useEffect(() => {
		const checkAuthStatus = () => {
			const raw = localStorage.getItem('authUser')
			const user = raw ? JSON.parse(raw) : null
			setAuthUser(user)
		}

		checkAuthStatus()

		const handleAuthChange = () => checkAuthStatus()
		window.addEventListener('auth-changed', handleAuthChange)
		window.addEventListener('storage', handleAuthChange)

		return () => {
			window.removeEventListener('auth-changed', handleAuthChange)
			window.removeEventListener('storage', handleAuthChange)
		}
	}, [])

	// Listen for updates from dashboard (storage/local events)
	useEffect(() => {
		const syncResources = () => {
			try {
				const savedAdminResources = localStorage.getItem('adminResources')
				setAdminResources(savedAdminResources ? JSON.parse(savedAdminResources) : [])
			} catch (error) {
				console.error('Error syncing admin resources from localStorage:', error)
			}
		}

		syncResources()
		window.addEventListener('storage', syncResources)
		window.addEventListener('resources-updated', syncResources)

		return () => {
			window.removeEventListener('storage', syncResources)
			window.removeEventListener('resources-updated', syncResources)
		}
	}, [])


	const items = useMemo(() => adminResources, [adminResources])

	const isResourceTypeValid = useMemo(() => {
		if (!selectedResourceType) return true
		return items.some((item) => item.name === selectedResourceType)
	}, [items, selectedResourceType])

	const filtered = useMemo(() => {
		if (!isResourceTypeValid) return []

		let list = items.filter((it) => (it.mode || 'rent') === mode)
		if (selectedResourceType) {
			list = list.filter((it) => it.name === selectedResourceType)
		}
		if (query.trim()) {
			const q = query.trim().toLowerCase()
			list = list.filter((it) => it.name.toLowerCase().includes(q))
		}
		// Price range only for sell mode
		if (mode === 'sell' && (priceMin || priceMax)) {
			const parsePrice = (p) => {
				const m = String(p || '').match(/\d[\d,]*/)
				if (!m) return 0
				return parseInt(m[0].replace(/,/g, ''), 10) || 0
			}
			const minV = priceMin ? parseInt(priceMin, 10) : undefined
			const maxV = priceMax ? parseInt(priceMax, 10) : undefined
			list = list.filter((it) => {
				const val = parsePrice(it.price)
				if (minV !== undefined && val < minV) return false
				if (maxV !== undefined && val > maxV) return false
				return true
			})
		}
		return list
	}, [items, selectedResourceType, query, mode, priceMin, priceMax, isResourceTypeValid])

	const handleResourceNavigate = (resource) => {
		// Check if user is authenticated
		if (!authUser) {
			// User not authenticated, redirect to login
			navigate('/login')
			return
		}
		
		const resourceMode = resource.mode || 'rent'
		navigate(`/resources/${resource.id}`, {
			state: { ...resource, mode: resourceMode }
		})
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 py-10">
				<div className="mb-8 text-center">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Resources</h1>
					<p className="text-gray-600 mt-2">Decor, rentals, equipment and more for your events</p>

					<div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
						<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${mode === 'sell' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-blue-50 text-blue-700 ring-blue-200'}`}>
							Mode: {mode === 'sell' ? 'Sell / Buy' : 'Rent'}
						</span>
						<div className="inline-flex rounded-lg bg-gray-100 p-1">
							<button
								type="button"
								onClick={() => {
									const params = new URLSearchParams()
									if (selectedResourceType) params.set('resourceType', selectedResourceType)
									params.set('mode', 'rent')
									navigate(`/resources?${params.toString()}`)
								}}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
									mode !== 'sell' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
								}`}
							>
								Rent
							</button>
							<button
								type="button"
								onClick={() => {
									const params = new URLSearchParams()
									if (selectedResourceType) params.set('resourceType', selectedResourceType)
									params.set('mode', 'sell')
									navigate(`/resources?${params.toString()}`)
								}}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
									mode === 'sell' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
								}`}
							>
								Sell / Buy
							</button>
						</div>
						{selectedResourceType && isResourceTypeValid && (
							<span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-50 ring-1 ring-fuchsia-200 text-fuchsia-700">
								{selectedResourceType}
							</span>
						)}
					</div>
					<div className="mt-4 max-w-xl mx-auto">
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search resources (e.g., chairs, lights, DJ)"
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
						/>
					</div>
					{mode === 'sell' && (
						<div className="mt-3 max-w-xl mx-auto grid grid-cols-2 gap-3">
							<input
								value={priceMin}
								onChange={(e) => setPriceMin(e.target.value.replace(/[^\d]/g, ''))}
								placeholder="Min price (₹)"
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
							/>
							<input
								value={priceMax}
								onChange={(e) => setPriceMax(e.target.value.replace(/[^\d]/g, ''))}
								placeholder="Max price (₹)"
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
							/>
						</div>
					)}
					{selectedResourceType && isResourceTypeValid && (
						<div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
							<span className="px-2 py-0.5 rounded-full bg-fuchsia-50 ring-1 ring-fuchsia-200 text-fuchsia-700">Filtered by: {selectedResourceType}</span>
							<button onClick={() => navigate('/resources')} className="text-xs text-gray-600 underline">Clear</button>
						</div>
					)}
				</div>

				{isResourceTypeValid ? (
					filtered.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{filtered.map((item) => {
								const resourceMode = item.mode || 'rent'
								const isSell = resourceMode === 'sell'
								return (
								<div key={item.id} className="relative bg-white rounded-xl shadow-sm ring-1 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ring-gray-200">
									<span className={`absolute inset-x-0 top-0 h-1 ${isSell ? 'bg-emerald-500' : 'bg-fuchsia-500'}`}></span>
									<div className="h-36 w-full overflow-hidden">
										<img
											src={item.photo}
											alt={item.name}
											className="h-full w-full object-cover"
											loading="lazy"
										/>
									</div>
									<div className="p-4">
										<div className="flex items-start justify-between gap-2">
											<h3 className="text-base md:text-lg font-semibold text-gray-900 flex-1 min-w-0">{item.name}</h3>
											<div className="flex items-center gap-1 flex-shrink-0">
												<span className={`inline-flex items-center rounded-full text-xs font-semibold px-2 py-1 ring-1 ${isSell ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200'}`}>{item.price}</span>
											</div>
										</div>
										<p className="mt-2 text-sm text-gray-700 line-clamp-3">{item.description}</p>
										<div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
											<FiMapPin className="text-gray-500" />
											<span>{item.address}</span>
										</div>

										<div className="mt-4 flex justify-end">
											<button 
												onClick={() => handleResourceNavigate(item)}
												className={`inline-flex items-center justify-center rounded-full text-white px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${isSell ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-fuchsia-600 hover:bg-fuchsia-700'}`}
											>
												{isSell ? 'Buy / Details' : 'View Details'}
											</button>
										</div>
									</div>
								</div>
								)
							})}
						</div>
					) : (
						<div className="text-center py-12">
							<div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<FiMapPin className="w-12 h-12 text-gray-400" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Found</h3>
							<p className="text-gray-500 mb-6">
								{selectedResourceType
									? `No resources found for "${selectedResourceType}" in ${mode === 'sell' ? 'Sell / Buy' : 'Rent'} mode.`
									: items.length === 0
									? 'No resources have been added yet. Please check back soon.'
									: query
									? `No resources found matching "${query}". Try adjusting your search terms or filters.`
									: 'No resources available for the selected filters.'}
							</p>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<button
									onClick={() => {
										setQuery('')
										setPriceMin('')
										setPriceMax('')
										navigate(`/resources?mode=${mode}`)
									}}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									Clear Filters
								</button>
							</div>
						</div>
					)
				) : (
					<div className="text-center py-12">
						<div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<FiXCircle className="w-12 h-12 text-red-500" />
						</div>
						<h3 className="text-lg font-medium text-red-800 mb-2">Resource Category Not Available</h3>
						<p className="text-gray-500 mb-6">
							The resource category "{selectedResourceType}" is not available. Please select from the available categories above.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={() => {
									setQuery('')
									setPriceMin('')
									setPriceMax('')
									navigate(`/resources?mode=${mode}`)
								}}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								View All Resources
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Resources