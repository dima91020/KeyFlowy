'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DailyStat } from '@/app/dashboard/actions'

interface LegendPayload {
    value: string;
    color: string;
}

interface CustomLegendProps {
    payload?: LegendPayload[];
}

const CustomLegend = ({ payload }: CustomLegendProps) => {
    if (!payload) return null;

    return (
        <ul className="flex justify-center items-center gap-6 pt-3 w-full m-0 p-0">
            {payload.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <div
                        className={`w-2.5 h-2.5 ${entry.value === 'Work Hours' ? 'rounded-xs' : 'rounded-full'}`}
                        style={{ backgroundColor: entry.color }}
                    />
                    {entry.value}
                </li>
            ))}
        </ul>
    );
}

export function WeeklyChart({ data, showWorkHours = false }: { data: DailyStat[], showWorkHours?: boolean }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-[360px] flex flex-col w-full">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                {showWorkHours ? "Weekly Traffic & Work Hours" : "Weekly Access Traffic"}
            </h3>

            <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#94A3B8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dy={8}
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
                            cursor={{ fill: '#F8FAFC' }}
                        />

                        <Legend
                            content={<CustomLegend />}
                            wrapperStyle={{ left: 0, width: '100%' }}
                        />

                        <Bar dataKey="entries" name="Entries" fill="#0F172A" radius={[3, 3, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="exits" name="Exits" fill="#94A3B8" radius={[3, 3, 0, 0]} maxBarSize={32} />

                        {showWorkHours && (
                            <Line
                                type="monotone"
                                dataKey="workHours"
                                name="Work Hours"
                                stroke="#16A34A"
                                strokeWidth={2}
                                dot={{ r: 3.5, fill: "#16A34A", strokeWidth: 1.5, stroke: "#FFFFFF" }}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}