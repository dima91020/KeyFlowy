'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Option {
    value: string;
    label: string;
}

export function CustomSelect({
    name,
    options,
    defaultValue,
    onChange,
    icon
}: {
    name?: string;
    options: Option[];
    defaultValue: string;
    onChange?: (value: string) => void;
    icon?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState(defaultValue)
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

    useEffect(() => {
        setSelected(defaultValue)
    }, [defaultValue])

    const selectedLabel = options.find(o => o.value === selected)?.label || options[0]?.label || ''

    const handleSelect = (value: string) => {
        setSelected(value)
        setIsOpen(false)
        if (onChange) {
            onChange(value)
        }
    }

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {name && <input type="hidden" name={name} value={selected} />}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg py-2.5 px-3 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between text-sm shadow-sm outline-none focus:border-slate-900"
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-slate-400">{icon}</span>}
                    <span className="truncate text-slate-800">{selectedLabel}</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-white border border-slate-200 rounded-lg shadow-lg z-[100] flex flex-col max-h-60 overflow-y-auto py-1">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                selected === option.value
                                    ? 'text-slate-900 font-medium bg-slate-100'
                                    : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}