import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import moment from 'moment';

export default function EarningsChart({ transactions }) {
  const data = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const m = moment().subtract(i, 'months');
      const key = m.format('YYYY-MM');
      months.push({ key, label: m.format('MMM YY'), amount: 0 });
    }
    const monthMap = {};
    months.forEach((m) => { monthMap[m.key] = m; });

    transactions
      .filter((t) => t.type === 'earnings')
      .forEach((t) => {
        if (!t.created_date) return;
        const key = moment(t.created_date).format('YYYY-MM');
        if (monthMap[key]) {
          monthMap[key].amount += t.amount || 0;
        }
      });

    return months;
  }, [transactions]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h2 className="font-medium text-slate-900 mb-4">Net earnings (last 12 months)</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            formatter={(value) => [`AED ${Number(value).toLocaleString()}`, 'Earnings']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          />
          <Bar dataKey="amount" fill="#6D3BF5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}