import React, { useEffect, useState } from 'react';

function Weather() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the Flask backend
        fetch('/weather/Kennedy%20Space%20Center')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setWeather(data);
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                setError("Unable to fetch weather data");
            });
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!weather) {
        return <div>Loading weather data...</div>;
    }

    return (
        <div>
            <h2>Weather in {weather.location}</h2>
            <p>Temperature: {weather.temperature}°C</p>
            <p>Condition: {weather.description}</p>
            <p>Wind Speed: {weather.wind_speed} m/s</p>
            <p>Humidity: {weather.humidity}%</p>
        </div>
    );
}

export default Weather;
