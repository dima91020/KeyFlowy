'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HourlyStat } from '@/app/dashboard/actions'

export function PeakHoursChart({ data }: { data: HourlyStat[] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-[340px] flex flex-col w-full">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Peak Hours (Last 30 Days)
            </h3>

            <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="hour"
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dy={8}
                            minTickGap={24}
                        />
                        <YAxis
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
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
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            name="Passages"
                            stroke="#0F172A"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}