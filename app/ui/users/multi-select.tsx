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
            {/* Генеруємо приховані інпути для кожного вибраного елемента */}
            {selected.map(value => (
                <input key={value} type="hidden" name={name} value={value} />
            ))}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl outline-none hover:border-dark-600 transition-colors cursor-pointer min-h-[46px] p-2 flex items-center justify-between"
            >
                <div className="flex items-center gap-2 flex-wrap flex-1 pl-1">
                    {icon && <span className="text-dark-muted ml-1">{icon}</span>}

                    {selected.length === 0 ? (
                        <span className="text-dark-muted text-sm ml-1">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-1.5 ml-1">
                            {selected.map(val => {
                                const option = options.find(o => o.value === val)
                                return (
                                    <span key={val} className="bg-primary/20 border border-primary/30 text-primary text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                        {option?.label}
                                        <XMarkIcon className="w-3 h-3 cursor-pointer hover:text-white transition-colors" onClick={(e) => removeOption(val, e)} />
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </div>
                <div className="px-2 shrink-0">
                    <ChevronDownIcon className={`w-4 h-4 text-dark-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-dark-900 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col max-h-60 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="p-3 text-sm text-dark-muted text-center">No options available</div>
                    ) : (
                        options.map((option) => {
                            const isSelected = selected.includes(option.value)
                            return (
                                <div
                                    key={option.value}
                                    onClick={(e) => toggleOption(option.value, e)}
                                    className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-dark-800 transition-colors flex items-center justify-between ${
                                        isSelected ? 'text-primary font-medium bg-primary/5' : 'text-white'
                                    }`}
                                >
                                    {option.label}
                                    {isSelected && <CheckIcon className="w-4 h-4 text-primary" />}
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}