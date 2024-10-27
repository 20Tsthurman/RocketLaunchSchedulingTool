from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import time
import os
from config import API_KEY

app = Flask(__name__)
CORS(app)

# Launch sites data
launch_sites = {
    "Kennedy Space Center": {"lat": 28.573255, "lon": -80.646895},
    "Cape Canaveral": {"lat": 28.4889, "lon": -80.5778},
    "Vandenberg SFB": {"lat": 34.7420, "lon": -120.5724},
    "Wallops Flight Facility": {"lat": 37.9401, "lon": -75.4663},
    "Kodiak Launch Complex": {"lat": 57.4356, "lon": -152.3378},
    "Spaceport America": {"lat": 32.9903, "lon": -106.9749}
}

# Sample launch data
launch_data = [
    {
        "id": 1,
        "site": "Kennedy Space Center",
        "date": "2024-12-15",
        "time": "14:30",
        "status": "Scheduled",
        "mission": "Cargo Resupply",
        "rocket": "Falcon 9",
        "customer": "NASA"
    },
    {
        "id": 2,
        "site": "Cape Canaveral",
        "date": "2024-12-18",
        "time": "10:00",
        "status": "Scheduled",
        "mission": "Satellite Deploy",
        "rocket": "Atlas V",
        "customer": "ULA"
    },
    {
        "id": 3,
        "site": "Vandenberg SFB",
        "date": "2024-12-20",
        "time": "08:45",
        "status": "Scheduled",
        "mission": "Earth Observation",
        "rocket": "Falcon 9",
        "customer": "SpaceX"
    }
]

# Sample weather data
SAMPLE_WEATHER_DATA = {
    "current": {
        "temperature": 24,
        "feels_like": 25,
        "description": "Clear sky",
        "wind_speed": 5.2,
        "wind_direction": 180,
        "humidity": 65,
        "pressure": 1015,
        "visibility": 10,
        "clouds": 20,
        "precipitation": 0
    },
    "forecast": [
        {
            "timestamp": int(time.time()) + i * 3600,
            "temperature": 24 + (i % 3) - 1,
            "wind_speed": 5.0 + (i % 2),
            "description": "Clear sky",
            "precipitation": 0
        } for i in range(8)
    ]
}

# Sample launch score data
SAMPLE_LAUNCH_SCORE = {
    "composite_score": 85.5,
    "components": {
        "weather_score": 90.0,
        "visibility_score": 85.0,
        "wind_score": 80.0
    },
    "conditions": {
        "temperature": {
            "value": 22,
            "unit": "°C",
            "status": "optimal"
        },
        "wind": {
            "speed": 5.2,
            "direction": 180,
            "unit": "m/s",
            "status": "optimal"
        },
        "visibility": {
            "value": 10,
            "unit": "km",
            "status": "optimal"
        },
        "clouds": {
            "coverage": 20,
            "unit": "%",
            "status": "optimal"
        }
    }
}


@app.route('/weather/<location>', methods=['GET'])
def get_weather(location):
    use_sample = request.args.get('use_sample', 'false').lower() == 'true'
    
    if location in launch_sites:
        try:
            if use_sample:
                return jsonify({
                    "location": location,
                    **SAMPLE_WEATHER_DATA,
                    "is_sample": True
                })

            lat = launch_sites[location]["lat"]
            lon = launch_sites[location]["lon"]
            
            weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
            forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
            
            weather_response = requests.get(weather_url)
            forecast_response = requests.get(forecast_url)
            
            if weather_response.status_code == 429 or forecast_response.status_code == 429:
                return jsonify({
                    "error": "RATE_LIMIT_REACHED",
                    "message": "This site has reached its limit on weather retrieval, would you like sample data instead?"
                })

            if weather_response.status_code == 200 and forecast_response.status_code == 200:
                current_data = weather_response.json()
                forecast_data = forecast_response.json()
                
                weather_data = {
                    "location": location,
                    "current": {
                        "temperature": current_data['main']['temp'],
                        "feels_like": current_data['main']['feels_like'],
                        "description": current_data['weather'][0]['description'],
                        "wind_speed": current_data['wind']['speed'],
                        "wind_direction": current_data['wind'].get('deg', 0),
                        "humidity": current_data['main']['humidity'],
                        "pressure": current_data['main']['pressure'],
                        "visibility": current_data.get('visibility', 0) / 1000,
                        "clouds": current_data['clouds']['all'],
                        "precipitation": current_data.get('rain', {}).get('1h', 0)
                    },
                    "forecast": [
                        {
                            "timestamp": item['dt'],
                            "temperature": item['main']['temp'],
                            "wind_speed": item['wind']['speed'],
                            "description": item['weather'][0]['description'],
                            "precipitation": item.get('rain', {}).get('3h', 0)
                        }
                        for item in forecast_data['list'][:8]
                    ]
                }
                return jsonify(weather_data)
            else:
                return jsonify({"error": f"Weather service error: {weather_response.status_code}"})
                
        except Exception as e:
            return jsonify({"error": str(e)})
    else:
        return jsonify({"error": "Invalid location provided."})

@app.route('/launch_schedule', methods=['GET'])
def get_launch_schedule():
    # Add filtering capabilities
    site = request.args.get('site')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    status = request.args.get('status')
    
    filtered_launches = launch_data.copy()
    
    if site:
        filtered_launches = [l for l in filtered_launches if l['site'] == site]
    if start_date:
        filtered_launches = [l for l in filtered_launches if l['date'] >= start_date]
    if end_date:
        filtered_launches = [l for l in filtered_launches if l['date'] <= end_date]
    if status:
        filtered_launches = [l for l in filtered_launches if l['status'] == status]
    
    return jsonify(filtered_launches)

@app.route('/launch_score/<location>', methods=['GET'])
def get_launch_score(location):
    use_sample = request.args.get('use_sample', 'false').lower() == 'true'
    
    if location in launch_sites:
        try:
            if use_sample:
                return jsonify({
                    "location": location,
                    **SAMPLE_LAUNCH_SCORE,
                    "is_sample": True
                })

            lat = launch_sites[location]["lat"]
            lon = launch_sites[location]["lon"]

            try:
                weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
                response = requests.get(weather_url)
                
                if response.status_code == 429:
                    return jsonify({
                        "error": "RATE_LIMIT_REACHED",
                        "message": "This site has reached its limit on launch condition data retrieval"
                    })
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Calculate detailed scores
                    weather_score = calculate_weather_score(data)
                    visibility_score = calculate_visibility_score(data)
                    wind_score = calculate_wind_score(data)
                    
                    # Weighted average for final score
                    composite_score = (
                        0.4 * weather_score +
                        0.3 * visibility_score +
                        0.3 * wind_score
                    )

                    return jsonify({
                        "location": location,
                        "composite_score": round(composite_score, 1),
                        "components": {
                            "weather_score": round(weather_score, 1),
                            "visibility_score": round(visibility_score, 1),
                            "wind_score": round(wind_score, 1)
                        },
                        "conditions": get_condition_details(data)
                    })
                else:
                    return jsonify({"error": f"Weather service error: {response.status_code}"})
            except requests.exceptions.RequestException as e:
                return jsonify({"error": f"Network error: {str(e)}"})
        except Exception as e:
            return jsonify({"error": str(e)})
    else:
        return jsonify({"error": "Invalid location provided."})

def calculate_weather_score(data):
    score = 100
    
    # Temperature impact (ideal: 15-25°C)
    temp = data['main']['temp']
    if temp < 15 or temp > 25:
        score -= min(30, abs(temp - 20) * 2)
    
    # Humidity impact (ideal: below 60%)
    humidity = data['main']['humidity']
    if humidity > 60:
        score -= min(20, (humidity - 60) * 0.5)
    
    # Weather condition impact
    weather = data['weather'][0]['description'].lower()
    if any(cond in weather for cond in ['thunderstorm', 'storm']):
        score -= 100
    elif any(cond in weather for cond in ['rain', 'drizzle']):
        score -= 50
    elif any(cond in weather for cond in ['mist', 'fog']):
        score -= 30
    elif 'cloud' in weather:
        score -= 10
    
    return max(0, score)

def calculate_visibility_score(data):
    visibility = data.get('visibility', 0) / 1000  # Convert to km
    
    if visibility >= 10:
        return 100
    elif visibility >= 5:
        return 80
    elif visibility >= 3:
        return 50
    else:
        return max(0, visibility * 10)

def calculate_wind_score(data):
    wind_speed = data['wind']['speed']
    
    if wind_speed <= 5:
        return 100
    elif wind_speed <= 10:
        return 80
    elif wind_speed <= 15:
        return 50
    elif wind_speed <= 20:
        return 20
    else:
        return 0

def get_condition_details(data):
    return {
        "temperature": {
            "value": data['main']['temp'],
            "unit": "°C",
            "status": "optimal" if 15 <= data['main']['temp'] <= 25 else "suboptimal"
        },
        "wind": {
            "speed": data['wind']['speed'],
            "direction": data['wind'].get('deg', 0),
            "unit": "m/s",
            "status": "optimal" if data['wind']['speed'] <= 10 else "suboptimal"
        },
        "visibility": {
            "value": data.get('visibility', 0) / 1000,
            "unit": "km",
            "status": "optimal" if data.get('visibility', 0) >= 10000 else "suboptimal"
        },
        "clouds": {
            "coverage": data['clouds']['all'],
            "unit": "%",
            "status": "optimal" if data['clouds']['all'] <= 30 else "suboptimal"
        }
    }

if __name__ == "__main__":
    app.run(debug=True)