'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
    value: string;
    label: string;
}

export function CustomSelect({
                                 name,
                                 options,
                                 defaultValue
                             }: {
    name: string;
    options: Option[];
    defaultValue: string;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState(defaultValue)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Закриваємо список, якщо клікнули поза ним
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedLabel = options.find(o => o.value === selected)?.label || options[0].label

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Цей прихований інпут відправляє дані у форму */}
            <input type="hidden" name={name} value={selected} />

            {/* Візуальна кнопка селекта */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-dark-900 border border-dark-700 text-white rounded-xl pl-3 pr-3 py-2 text-sm outline-none hover:border-dark-600 transition-colors cursor-pointer flex items-center justify-between h-[38px]"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={16} className={`text-dark-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Випадаючий список, який тепер підкоряється нашим стилям */}
            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-dark-900 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                setSelected(option.value)
                                setIsOpen(false)
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-dark-800 transition-colors ${
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