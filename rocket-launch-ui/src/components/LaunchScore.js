import React, { useState, useEffect, useCallback } from 'react';
import { ThermometerSun, Wind, Cloud, Sun, AlertTriangle } from 'lucide-react';

const LaunchScore = () => {
    const [location, setLocation] = useState('Kennedy Space Center');
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSampleDataPrompt, setShowSampleDataPrompt] = useState(false);
  
    const launchSites = [
        { name: "Kennedy Space Center", lat: 28.573255, lon: -80.646895 },
        { name: "Cape Canaveral", lat: 28.4889, lon: -80.5778 },
        { name: "Vandenberg SFB", lat: 34.7420, lon: -120.5724 },
        { name: "Wallops Flight Facility", lat: 37.9401, lon: -75.4663 },
        { name: "Kodiak Launch Complex", lat: 57.4356, lon: -152.3378 },
        { name: "Spaceport America", lat: 32.9903, lon: -106.9749 }
    ];

    const fetchScoreData = useCallback((useSample = false) => {
        setLoading(true);
        setError(null);

        const url = `/launch_score/${encodeURIComponent(location)}${useSample ? '?use_sample=true' : ''}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.error === 'RATE_LIMIT_REACHED') {
                    setShowSampleDataPrompt(true);
                    setScoreData(null);
                    setLoading(false);
                    return;
                }

                if (data.error) {
                    throw new Error(data.error);
                }

                setScoreData(data);
                setShowSampleDataPrompt(false);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching launch score:', error);
                setError(error.message);
                setScoreData(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [location]);

    useEffect(() => {
        fetchScoreData();
    }, [fetchScoreData]);

    const handleSampleDataResponse = (useSimple) => {
        setShowSampleDataPrompt(false);
        if (useSimple) {
            fetchScoreData(true);
        } else {
            setError('Launch condition data retrieval limit reached');
        }
    };

    const getScoreColor = (score) => {
        if (!score && score !== 0) return 'bg-gray-500';
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getScoreMessage = (score) => {
        if (!score && score !== 0) return 'No data available';
        if (score >= 80) return 'Excellent launch conditions';
        if (score >= 60) return 'Good launch conditions';
        if (score >= 40) return 'Marginal launch conditions';
        return 'Poor launch conditions';
    };

    const ScoreIndicator = ({ score, label }) => (
        <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full ${getScoreColor(score)} flex items-center justify-center mb-2`}>
                <span className="text-2xl font-bold text-white">{score?.toFixed(1) || 'N/A'}</span>
            </div>
            <span className="text-sm text-gray-300">{label}</span>
        </div>
    );

    const renderContent = () => {
        if (!scoreData || !scoreData.components) {
            return <div className="text-center p-4">No launch condition data available</div>;
        }

        return (
            <div className="space-y-6">
                <div className="flex justify-center space-x-8">
                    <ScoreIndicator 
                        score={scoreData.composite_score} 
                        label="Overall Score" 
                    />
                    <ScoreIndicator 
                        score={scoreData.components.weather_score} 
                        label="Weather" 
                    />
                    <ScoreIndicator 
                        score={scoreData.components.visibility_score} 
                        label="Visibility" 
                    />
                    <ScoreIndicator 
                        score={scoreData.components.wind_score} 
                        label="Wind" 
                    />
                </div>

                <div className={`p-4 rounded-lg ${getScoreColor(scoreData.composite_score)} bg-opacity-20 flex items-center gap-2`}>
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">{getScoreMessage(scoreData.composite_score)}</p>
                </div>

                {scoreData.conditions && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-700 rounded">
                            <div className="flex items-center space-x-2 mb-2">
                                <ThermometerSun className="h-5 w-5" />
                                <span>Temperature</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {scoreData.conditions.temperature.value}°C
                            </p>
                            <span className={`text-sm ${
                                scoreData.conditions.temperature.status === 'optimal' 
                                    ? 'text-green-400' 
                                    : 'text-yellow-400'
                            }`}>
                                {scoreData.conditions.temperature.status}
                            </span>
                        </div>

                        <div className="p-4 bg-gray-700 rounded">
                            <div className="flex items-center space-x-2 mb-2">
                                <Wind className="h-5 w-5" />
                                <span>Wind Speed</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {scoreData.conditions.wind.speed} m/s
                            </p>
                            <span className={`text-sm ${
                                scoreData.conditions.wind.status === 'optimal' 
                                    ? 'text-green-400' 
                                    : 'text-yellow-400'
                            }`}>
                                {scoreData.conditions.wind.status}
                            </span>
                        </div>

                        <div className="p-4 bg-gray-700 rounded">
                            <div className="flex items-center space-x-2 mb-2">
                                <Sun className="h-5 w-5" />
                                <span>Visibility</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {scoreData.conditions.visibility.value} km
                            </p>
                            <span className={`text-sm ${
                                scoreData.conditions.visibility.status === 'optimal' 
                                    ? 'text-green-400' 
                                    : 'text-yellow-400'
                            }`}>
                                {scoreData.conditions.visibility.status}
                            </span>
                        </div>

                        <div className="p-4 bg-gray-700 rounded">
                            <div className="flex items-center space-x-2 mb-2">
                                <Cloud className="h-5 w-5" />
                                <span>Cloud Cover</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {scoreData.conditions.clouds.coverage}%
                            </p>
                            <span className={`text-sm ${
                                scoreData.conditions.clouds.status === 'optimal' 
                                    ? 'text-green-400' 
                                    : 'text-yellow-400'
                            }`}>
                                {scoreData.conditions.clouds.status}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 rounded-lg bg-gray-800 text-white">
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Launch Site</label>
                <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    {launchSites.map(site => (
                        <option key={site.name} value={site.name}>
                            {site.name}
                        </option>
                    ))}
                </select>
            </div>

            {showSampleDataPrompt ? (
                <div className="p-4 bg-blue-500 bg-opacity-20 rounded-lg">
                    <p className="text-center mb-4">This site has reached its limit on launch condition data retrieval, would you like sample data instead?</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => handleSampleDataResponse(true)}
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleSampleDataResponse(false)}
                            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
                        >
                            No
                        </button>
                    </div>
                </div>
            ) : loading ? (
                <div className="text-center p-4">Loading launch conditions...</div>
            ) : error ? (
                <div className="p-4 bg-red-500 bg-opacity-20 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                        <p className="font-medium">Unable to fetch launch conditions</p>
                        <p className="text-sm text-gray-300 mt-1">{error}</p>
                    </div>
                </div>
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default LaunchScore;