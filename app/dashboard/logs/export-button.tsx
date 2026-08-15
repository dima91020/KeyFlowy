'use client'

import { ArrowDownTrayIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function ExportButton() {
    const [isExporting, setIsExporting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)
            setIsSuccess(false)

            const response = await fetch('/api/export/logs')
            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'access_logs.csv'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setIsSuccess(true)
            setTimeout(() => {
                setIsSuccess(false)
            }, 3000)
        } catch {
            alert('Failed to export logs. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={isExporting || isSuccess}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors w-full sm:w-auto shadow-sm border ${
                isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
            {isExporting ? (
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : isSuccess ? (
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
                <ArrowDownTrayIcon className="w-3.5 h-3.5 text-slate-500" />
            )}

            {isExporting ? 'Exporting...' : isSuccess ? 'Downloaded CSV' : 'Export CSV'}
        </button>
    )
}