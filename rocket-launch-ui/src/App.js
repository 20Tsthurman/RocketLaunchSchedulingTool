import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap should come first
import './App.css'; // Your custom styles should come after Bootstrap
import Weather from './components/Weather';
import LaunchScore from './components/LaunchScore';
import LaunchMap from './components/LaunchMap';
import LaunchSchedule from './components/LaunchSchedule';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Rocket Launch Scheduling Application</h1>
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <Weather />
                        </div>
                        <div className="col-md-6">
                            <LaunchScore />
                        </div>
                    </div>
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="map-container">
                                <LaunchMap />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <LaunchSchedule />
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default App;