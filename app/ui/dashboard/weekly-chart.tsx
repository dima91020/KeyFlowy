'use client'

// Зверни увагу: додали ComposedChart та Line
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
        <ul className="flex justify-center items-center gap-6 pt-4 w-full m-0 p-0">
            {payload.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center gap-2 text-sm text-gray-300">
                    <div
                        className={`w-3 h-3 ${entry.value === 'Work Hours' ? 'rounded-sm' : 'rounded-full'}`}
                        style={{ backgroundColor: entry.color }}
                    />
                    {entry.value}
                </li>
            ))}
        </ul>
    );
}

// Додали showWorkHours?: boolean
export function WeeklyChart({ data, showWorkHours = false }: { data: DailyStat[], showWorkHours?: boolean }) {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col w-full">
            {/* Динамічний заголовок */}
            <h3 className="text-xl font-bold text-white mb-6">
                {showWorkHours ? "Weekly Traffic & Time" : "Weekly Traffic"}
            </h3>

            <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
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
                            cursor={{ fill: '#374151', opacity: 0.4 }}
                        />

                        <Legend
                            content={<CustomLegend />}
                            wrapperStyle={{ left: 0, width: '100%' }}
                        />

                        <Bar dataKey="entries" name="Entries" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="exits" name="Exits" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={40} />

                        {/* Малюємо лінію ТІЛЬКИ якщо showWorkHours === true */}
                        {showWorkHours && (
                            <Line
                                type="monotone"
                                dataKey="workHours"
                                name="Work Hours"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#1F2937" }}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}