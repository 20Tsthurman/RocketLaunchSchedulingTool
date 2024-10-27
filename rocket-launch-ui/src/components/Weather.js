import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, Wind, Droplets, ThermometerSun, Eye, Compass, AlertTriangle } from 'lucide-react';

function Weather() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState('Kennedy Space Center');
    const [loading, setLoading] = useState(true);
    const [showSampleDataPrompt, setShowSampleDataPrompt] = useState(false);

    const locations = [
        "Kennedy Space Center",
        "Cape Canaveral",
        "Vandenberg SFB",
        "Wallops Flight Facility",
        "Kodiak Launch Complex",
        "Spaceport America"
    ];

    const fetchWeatherData = useCallback((useSample = false) => {
        setLoading(true);
        setError(null);
        
        const url = `/weather/${encodeURIComponent(location)}${useSample ? '?use_sample=true' : ''}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.error === 'RATE_LIMIT_REACHED') {
                    setShowSampleDataPrompt(true);
                    setWeather(null);
                    setLoading(false);
                    return;
                }
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                setWeather(data);
                setShowSampleDataPrompt(false);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                setError(error.message);
                setWeather(null);
            })
            .finally(() => {
                setLoading(false);
            });
        }, [location]);

        useEffect(() => {
            fetchWeatherData();
        }, [fetchWeatherData]);

    const handleSampleDataResponse = (useSimple) => {
        setShowSampleDataPrompt(false);
        if (useSimple) {
            fetchWeatherData(true);
        } else {
            setError('Weather data retrieval limit reached');
        }
    };

    const WeatherCard = ({ icon: Icon, title, value, unit, description }) => (
        <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
                <Icon className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">{title}</span>
            </div>
            <div className="text-2xl font-bold">
                {typeof value !== 'undefined' && value !== null ? `${value} ${unit}` : 'N/A'}
            </div>
            {description && (
                <div className="text-sm text-gray-400 mt-1">{description}</div>
            )}
        </div>
    );

    const renderContent = () => {
        if (!weather || !weather.current) {
            return <div className="text-center p-4">No weather data available</div>;
        }

        return (
            <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <WeatherCard
                        icon={ThermometerSun}
                        title="Temperature"
                        value={weather.current.temperature}
                        unit="°C"
                        description={`Feels like ${weather.current.feels_like}°C`}
                    />

                    <WeatherCard
                        icon={Wind}
                        title="Wind"
                        value={weather.current.wind_speed}
                        unit="m/s"
                        description={`Direction: ${weather.current.wind_direction}°`}
                    />

                    <WeatherCard
                        icon={Droplets}
                        title="Humidity"
                        value={weather.current.humidity}
                        unit="%"
                    />

                    <WeatherCard
                        icon={Eye}
                        title="Visibility"
                        value={weather.current.visibility}
                        unit="km"
                    />

                    <WeatherCard
                        icon={Cloud}
                        title="Cloud Cover"
                        value={weather.current.clouds}
                        unit="%"
                    />

                    <WeatherCard
                        icon={Compass}
                        title="Pressure"
                        value={weather.current.pressure}
                        unit="hPa"
                    />
                </div>

                {weather.current.precipitation > 0 && (
                    <div className="mt-4 p-4 bg-blue-500 bg-opacity-20 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Droplets className="h-5 w-5" />
                            <span>Precipitation: {weather.current.precipitation} mm</span>
                        </div>
                    </div>
                )}

                {weather.forecast && weather.forecast.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">24-Hour Forecast</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {weather.forecast.slice(0, 4).map((item, index) => (
                                <div key={index} className="bg-gray-700 p-3 rounded-lg text-center">
                                    <div className="text-sm text-gray-400">
                                        {new Date(item.timestamp * 1000).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                    <div className="text-xl font-bold my-2">{item.temperature}°C</div>
                                    <div className="text-sm text-gray-300">{item.wind_speed} m/s</div>
                                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="p-6 rounded-lg bg-gray-800 text-white">
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Location</label>
                <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
            </div>

            {showSampleDataPrompt ? (
                <div className="p-4 bg-blue-500 bg-opacity-20 rounded-lg">
                    <p className="text-center mb-4">This site has reached its limit on weather retrieval, would you like sample data instead?</p>
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
                <div className="text-center p-4">Loading weather data...</div>
            ) : error ? (
                <div className="p-4 bg-red-500 bg-opacity-20 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                        <p className="font-medium">Unable to fetch weather data</p>
                        <p className="text-sm text-gray-300 mt-1">{error}</p>
                    </div>
                </div>
            ) : (
                renderContent()
            )}
        </div>
    );
}

export default Weather;