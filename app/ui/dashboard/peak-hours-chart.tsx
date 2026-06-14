'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HourlyStat } from '@/app/dashboard/actions'
import { PresentationChartLineIcon } from '@heroicons/react/24/outline'

export function PeakHoursChart({ data }: { data: HourlyStat[] }) {

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col w-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PresentationChartLineIcon className="w-5 h-5 text-amber-500" />
                Peak Hours (Last 30 Days)
            </h3>

            <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="hour"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={20}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                borderColor: '#374151',
                                borderRadius: '0.75rem',
                                color: '#fff'
                            }}
                            itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                            cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            name="Activity"
                            stroke="#F59E0B"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}