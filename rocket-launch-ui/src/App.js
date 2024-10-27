import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Weather from './components/Weather';
import LaunchScore from './components/LaunchScore';
import LaunchMap from './components/LaunchMap';
import LaunchSchedule from './components/LaunchSchedule';
import LaunchStatistics from './components/LaunchStatistics';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1 className="text-4xl font-bold mb-8">Rocket Launch Scheduling Application</h1>
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <LaunchScore />
                        <Weather />
                    </div>
                    <div className="mb-8">
                        <LaunchMap />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <LaunchStatistics />
                        <LaunchSchedule />
                    </div>
                </div>
            </header>
        </div>
    );
}

export default App;