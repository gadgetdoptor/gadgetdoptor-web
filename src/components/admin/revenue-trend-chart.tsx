"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function RevenueTrendChart({ data }: { data: { date: string; total: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    fontFamily="inherit"
                    fontWeight="bold"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    minTickGap={24}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                    fontFamily="inherit"
                    fontWeight="bold"
                    width={48}
                />
                <Tooltip
                    cursor={{ stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-black text-white p-3 text-xs font-semibold tracking-normal border-0 rounded-[10px] shadow-xl">
                                    <p className="mb-1">{new Date(payload[0].payload.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                                    <p className="text-orange-500">Revenue: ৳{Number(payload[0].value).toLocaleString()}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#ea580c"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
