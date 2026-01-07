import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const QuizChart = ({ data, quizzes }) => {
  const [activeTab, setActiveTab] = useState('activity');
  const [chartPeriod, setChartPeriod] = useState('week');

  const categoryData = quizzes.reduce((acc, quiz) => {
    const category = quiz.category || 'other';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#6366f1'];

  const categoryNames = {
    general: 'Общие',
    science: 'Наука',
    history: 'История',
    geography: 'География',
    sports: 'Спорт',
    entertainment: 'Развлечения',
    technology: 'Технологии',
    other: 'Другое'
  };

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#a855f7' },
    { name: 'Mobile', value: 35, color: '#ec4899' },
    { name: 'Tablet', value: 20, color: '#06b6d4' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a2e] shadow-xl rounded-xl p-3 border border-white/10">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm text-gray-400">
              {item.name}: <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Статистика активности</h3>
          <p className="text-sm text-gray-400">Ваша активность за последний период</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1">
          {['activity', 'categories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'activity' ? 'Активность' : 'Категории'}
            </button>
          ))}
        </div>
      </div>

      {/* Period Filter */}
      {activeTab === 'activity' && (
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setChartPeriod(period)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                chartPeriod === period
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="h-72">
        {activeTab === 'activity' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.length ? data : [
              { name: 'Пн', score: 0 },
              { name: 'Вт', score: 0 },
              { name: 'Ср', score: 0 },
              { name: 'Чт', score: 0 },
              { name: 'Пт', score: 0 },
              { name: 'Сб', score: 0 },
              { name: 'Вс', score: 0 }
            ]}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                name="Результат"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full gap-8">
            {/* Pie Chart */}
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length ? categoryData : [{ name: 'Нет данных', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="w-1/2 space-y-3">
              {categoryData.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-400">
                      {categoryNames[item.name] || item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizChart;
