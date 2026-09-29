import React, { useMemo, useState } from 'react'

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year, month) {
	return new Date(year, month + 1, 0).getDate()
}

function startOfMonthWeekday(year, month) {
	return new Date(year, month, 1).getDay()
}

const Calendar = ({ value, onChange, minDate }) => {
	const initial = value || new Date()
	const [viewYear, setViewYear] = useState(initial.getFullYear())
	const [viewMonth, setViewMonth] = useState(initial.getMonth())

	const days = useMemo(() => {
		const total = getDaysInMonth(viewYear, viewMonth)
		const start = startOfMonthWeekday(viewYear, viewMonth)
		const cells = []
		for (let i = 0; i < start; i += 1) {
			cells.push(null)
		}
		for (let d = 1; d <= total; d += 1) {
			cells.push(new Date(viewYear, viewMonth, d))
		}
		return cells
	}, [viewYear, viewMonth])

	const isDisabled = (date) => {
		if (!minDate) return false
		const md = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
		const dd = new Date(date.getFullYear(), date.getMonth(), date.getDate())
		return dd < md
	}

	const goPrev = () => {
		const m = viewMonth - 1
		if (m < 0) {
			setViewMonth(11)
			setViewYear(viewYear - 1)
		} else {
			setViewMonth(m)
		}
	}
	const goNext = () => {
		const m = viewMonth + 1
		if (m > 11) {
			setViewMonth(0)
			setViewYear(viewYear + 1)
		} else {
			setViewMonth(m)
		}
	}

	return (
		<div className="w-72 select-none bg-white rounded-md shadow-lg border border-gray-200 p-3">
			<div className="flex items-center justify-between mb-2">
				<button type="button" onClick={goPrev} className="h-8 w-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">‹</button>
				<div className="text-sm font-semibold text-gray-900">
					{new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
				</div>
				<button type="button" onClick={goNext} className="h-8 w-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">›</button>
			</div>
			<div className="grid grid-cols-7 gap-1 text-center">
				{WEEKDAY_LABELS.map((w) => (
					<div key={w} className="text-[11px] uppercase tracking-wide text-gray-500 py-1">{w}</div>
				))}
				{days.map((d, idx) => {
					if (!d) return <div key={`e-${idx}`} />
					const selected = value && d.toDateString() === value.toDateString()
					const disabled = isDisabled(d)
					return (
						<button
							key={d.toISOString()}
							type="button"
							disabled={disabled}
							onClick={() => onChange && onChange(d)}
							className={[
								'py-1.5 text-sm rounded-md',
								selected ? 'bg-blue-600 text-white' : 'text-gray-800 hover:bg-gray-100',
								disabled ? 'opacity-40 hover:bg-transparent' : '',
							].join(' ')}
						>
							{d.getDate()}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default Calendar


