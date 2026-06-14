'use client'

import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ShieldExclamationIcon } from '@heroicons/react/24/outline'
import { SecurityStat } from '@/app/dashboard/actions'
import { SecurityChartSkeleton } from '@/app/ui/dashboard/security-chart-skeleton'

interface LegendPayload {
    value: string;
    color: string;
}

const CustomLegend = ({ payload }: { payload?: LegendPayload[] }) => {
    if (!payload) return null;

    return (
        <ul className="flex flex-wrap justify-center items-center gap-4 w-full m-0 p-0 mt-2">
            {payload.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center gap-1.5 text-sm text-gray-300">
                    <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-medium">{entry.value}</span>
                </li>
            ))}
        </ul>
    );
}

export function SecurityChart({ data }: { data?: SecurityStat[] }) {
    if (!data) return <SecurityChartSkeleton />;

    const totalEvents = data.reduce((sum, item) => sum + item.value, 0);

    const chartData = totalEvents > 0
        ? data.map(item => ({ ...item, fill: item.color }))
        : [{ name: 'No Data', value: 1, fill: '#374151', color: '#374151' }];

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col w-full relative">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldExclamationIcon className="text-red-500 w-5 h-5" />
                Security Overview
            </h3>

            <div className="flex-1 w-full h-full min-h-0 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
                    <span className="text-3xl font-bold text-white">{totalEvents}</span>
                    <span className="text-xs text-dark-muted">Total Logs</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={totalEvents > 0 ? 5 : 0}
                            dataKey="value"
                            stroke="none"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                borderColor: '#374151',
                                borderRadius: '0.75rem',
                                color: '#fff'
                            }}
                            itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                            formatter={(value: unknown) => {
                                if (totalEvents === 0) return 0;
                                return typeof value === 'number' ? value : 0;
                            }}
                        />
                        {totalEvents > 0 && (
                            <Legend
                                content={<CustomLegend />}
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}