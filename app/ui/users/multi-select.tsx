'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Option {
    value: string;
    label: string;
}

export function MultiSelect({
    name,
    options,
    placeholder = "Select options",
    icon
}: {
    name: string;
    options: Option[];
    placeholder?: string;
    icon?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleOption = (value: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelected(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const removeOption = (value: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelected(prev => prev.filter(v => v !== value))
    }

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {selected.map(value => (
                <input key={value} type="hidden" name={name} value={value} />
            ))}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-slate-200 rounded-lg outline-none hover:border-slate-300 transition-colors cursor-pointer min-h-[38px] p-1.5 flex items-center justify-between shadow-sm"
            >
                <div className="flex items-center gap-1.5 flex-wrap flex-1 pl-1">
                    {icon && <span className="text-slate-400">{icon}</span>}

                    {selected.length === 0 ? (
                        <span className="text-slate-400 text-xs ml-1">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-1 ml-1">
                            {selected.map(val => {
                                const option = options.find(o => o.value === val)
                                return (
                                    <span key={val} className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                        {option?.label}
                                        <XMarkIcon className="w-3 h-3 cursor-pointer text-slate-400 hover:text-slate-700" onClick={(e) => removeOption(val, e)} />
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </div>
                <div className="px-1.5 shrink-0">
                    <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 flex flex-col max-h-60 overflow-y-auto py-1">
                    {options.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">No options available</div>
                    ) : (
                        options.map((option) => {
                            const isSelected = selected.includes(option.value)
                            return (
                                <div
                                    key={option.value}
                                    onClick={(e) => toggleOption(option.value, e)}
                                    className={`px-3 py-2 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                                        isSelected ? 'text-slate-900 font-medium bg-slate-100' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {option.label}
                                    {isSelected && <CheckIcon className="w-3.5 h-3.5 text-slate-900" />}
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}