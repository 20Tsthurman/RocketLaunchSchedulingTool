import React, { useEffect, useState } from 'react';

function LaunchSchedule() {
    const [launches, setLaunches] = useState([]);

    useEffect(() => {
        fetch('/launch_schedule')
            .then(response => response.json())
            .then(data => setLaunches(data))
            .catch(error => console.error('Error fetching launch schedule:', error));
    }, []);

    return (
        <div>
            <h2>Upcoming Launches</h2>
            <ul>
                {launches.map(launch => (
                    <li key={launch.id}>
                        <strong>{launch.site}</strong> - {launch.date} at {launch.time} ({launch.status})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LaunchSchedule;
