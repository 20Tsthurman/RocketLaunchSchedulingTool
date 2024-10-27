import React, { useState, useEffect } from 'react';
import { Calendar, Rocket } from 'lucide-react';

const LaunchSchedule = () => {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    site: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  const statuses = ['Scheduled', 'Delayed', 'Scrubbed', 'Completed'];
  const sites = [
    "Kennedy Space Center",
    "Cape Canaveral",
    "Vandenberg SFB",
    "Wallops Flight Facility",
    "Kodiak Launch Complex",
    "Spaceport America"
  ];

  useEffect(() => {
    const fetchLaunches = async () => {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      try {
        const response = await fetch(`/launch_schedule?${queryParams}`);
        const data = await response.json();
        setLaunches(data);
      } catch (error) {
        console.error('Error fetching launches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunches();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      site: '',
      startDate: '',
      endDate: '',
      status: ''
    });
  };

  return (
    <div className="p-6 rounded-lg bg-gray-800 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          Upcoming Launches
        </h2>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Launch Site</label>
          <select
            name="site"
            value={filters.site}
            onChange={handleFilterChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          >
            <option value="">All Sites</option>
            {sites.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-4">Loading launches...</div>
      ) : (
        <div className="grid gap-4">
          {launches.map(launch => (
            <div 
              key={launch.id}
              className="p-4 bg-gray-700 rounded flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <Rocket className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="font-semibold">{launch.mission}</h3>
                  <p className="text-sm text-gray-300">
                    {launch.site} • {launch.rocket}
                  </p>
                  <p className="text-sm text-gray-400">
                    Customer: {launch.customer}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{launch.date}</p>
                <p className="text-sm text-gray-300">{launch.time}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  launch.status === 'Scheduled' ? 'bg-green-500' :
                  launch.status === 'Delayed' ? 'bg-yellow-500' :
                  launch.status === 'Scrubbed' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}>
                  {launch.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaunchSchedule;