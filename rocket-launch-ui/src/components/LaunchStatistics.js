import React, { useState, useMemo } from 'react';
import { BarChart, XAxis, YAxis, Bar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Clock } from 'lucide-react';

const LaunchStatistics = () => {
  const [activeTab, setActiveTab] = useState('monthly');

  // Use useMemo to prevent recreating data arrays on every render
  const monthlyData = useMemo(() => [
    { name: 'Jan', launches: 4, success: 4 },
    { name: 'Feb', launches: 3, success: 2 },
    { name: 'Mar', launches: 5, success: 5 },
    { name: 'Apr', launches: 2, success: 2 },
    { name: 'May', launches: 6, success: 5 }
  ], []);

  const siteData = useMemo(() => [
    { name: 'Kennedy', launches: 12, success: 11 },
    { name: 'Canaveral', launches: 8, success: 7 },
    { name: 'Vandenberg', launches: 5, success: 5 }
  ], []);

  // Use the appropriate data based on active tab
  const statsData = activeTab === 'monthly' ? monthlyData : siteData;

  return (
    <div className="p-6 rounded-lg bg-gray-800 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Launch Statistics
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'monthly' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'sites' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            By Site
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statsData}>
            <XAxis 
              dataKey="name" 
              stroke="#fff" 
              fontSize={12}
              tickMargin={5}
            />
            <YAxis 
              stroke="#fff" 
              fontSize={12}
              tickMargin={5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                padding: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '10px'
              }}
            />
            <Bar 
              dataKey="launches" 
              fill="#3b82f6" 
              name="Total Launches"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="success" 
              fill="#10b981" 
              name="Successful"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-gray-200">Success Rate</span>
          </div>
          <p className="text-2xl font-bold">94.7%</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span className="text-gray-200">Avg. Launch Interval</span>
          </div>
          <p className="text-2xl font-bold">8.2 days</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span className="text-gray-200">Total Launches</span>
          </div>
          <p className="text-2xl font-bold">25</p>
        </div>
      </div>
    </div>
  );
};

export default LaunchStatistics;