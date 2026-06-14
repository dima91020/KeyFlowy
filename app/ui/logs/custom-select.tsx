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

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-dark-900 border border-dark-700 text-white rounded-xl py-2.5 outline-none hover:border-dark-600 transition-colors cursor-pointer flex items-center justify-between min-h-[46px]"
            >
                <div className="flex items-center gap-2 pl-3">
                    {icon && <span className="text-dark-muted">{icon}</span>}
                    <span className="truncate text-sm">{selectedLabel}</span>
                </div>
                <div className="pr-3">
                    <ChevronDownIcon className={`w-4 h-4 text-dark-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-[100] flex flex-col max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-dark-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-dark-800 transition-colors ${
                                selected === option.value ? 'text-primary font-medium bg-primary/5' : 'text-white'
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