'use client'

import { ArrowDownTrayIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function ExportButton() {
    const [isExporting, setIsExporting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)
            setIsSuccess(false) // Скидаємо стан успіху, якщо раптом натиснули вдруге

            // Робимо запит до нашого API
            const response = await fetch('/api/export/logs')
            if (!response.ok) throw new Error('Export failed')

            // Отримуємо файл у вигляді Blob (бінарні дані)
            const blob = await response.blob()

            // Створюємо тимчасове посилання на файл в пам'яті браузера
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'access_logs.csv'

            // Симулюємо клік для завантаження
            document.body.appendChild(a)
            a.click()

            // Прибираємо сліди
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            // Вмикаємо зелену кнопку з галочкою
            setIsSuccess(true)

            // Чекаємо 4 секунди і повертаємо кнопку в нормальний стан
            setTimeout(() => {
                setIsSuccess(false)
            }, 4000)

        } catch (error) {
            console.error('Error exporting logs:', error)
            alert('Failed to export logs. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            // Блокуємо кнопку, поки йде завантаження АБО поки висить зелена галочка
            disabled={isExporting || isSuccess}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all w-full sm:w-auto outline-none focus:outline-none ${
                isSuccess
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-dark-800 hover:bg-dark-700 text-white border border-dark-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
            {isExporting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : isSuccess ? (
                <CheckIcon className="w-4 h-4" />
            ) : (
                <ArrowDownTrayIcon className="w-4 h-4" />
            )}

            {isExporting ? 'Exporting...' : isSuccess ? 'Exported!' : 'Export CSV'}
        </button>
    )
}