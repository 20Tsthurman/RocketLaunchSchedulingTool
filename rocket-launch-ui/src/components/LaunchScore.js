import React, { useEffect, useState } from 'react';

function LaunchScore() {
    const [location, setLocation] = useState('Kennedy Space Center');
    const [score, setScore] = useState(null);

    useEffect(() => {
        if (location) {
            fetch(`/launch_score/${location}`)
                .then(response => response.json())
                .then(data => setScore(data.score))
                .catch(error => console.error('Error fetching launch score:', error));
        }
    }, [location]);

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };

    return (
        <div>
            <h2>Launch Score</h2>
            <select value={location} onChange={handleLocationChange}>
                <option value="Kennedy Space Center">Kennedy Space Center</option>
                <option value="Cape Canaveral">Cape Canaveral</option>
            </select>
            {score !== null && (
                <p>The launch score for {location} is: <strong>{score}</strong>/100</p>
            )}
        </div>
    );
}

export default LaunchScore;
