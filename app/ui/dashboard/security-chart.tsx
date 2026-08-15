'use client'

import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SecurityStat } from '@/app/dashboard/actions'
import { SecurityChartSkeleton } from '@/app/ui/dashboard/security-chart-skeleton'

interface LegendPayload {
    value: string;
    color: string;
}

const CustomLegend = ({ payload }: { payload?: LegendPayload[] }) => {
    if (!payload) return null;

    return (
        <ul className="flex flex-wrap justify-center items-center gap-4 w-full m-0 p-0 mt-1">
            {payload.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.value}</span>
                </li>
            ))}
        </ul>
    );
}

export function SecurityChart({ data }: { data?: SecurityStat[] }) {
    if (!data) return <SecurityChartSkeleton />;

    const totalEvents = data.reduce((sum, item) => sum + item.value, 0);

    const chartData = totalEvents > 0
        ? data.map(item => ({
            ...item,
            fill: item.name === 'Granted' ? '#0F172A' : item.name === 'Denied' ? '#94A3B8' : '#DC2626',
            color: item.name === 'Granted' ? '#0F172A' : item.name === 'Denied' ? '#94A3B8' : '#DC2626'
        }))
        : [{ name: 'No Data', value: 1, fill: '#E2E8F0', color: '#E2E8F0' }];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-[340px] flex flex-col w-full relative">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Security Overview
            </h3>

            <div className="flex-1 w-full h-full min-h-0 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-2xl font-bold text-slate-900">{totalEvents}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Total Events</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={totalEvents > 0 ? 3 : 0}
                            dataKey="value"
                            stroke="#FFFFFF"
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                borderColor: '#E2E8F0',
                                borderRadius: '0.5rem',
                                color: '#0F172A',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '12px'
                            }}
                            itemStyle={{ fontWeight: 500 }}
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