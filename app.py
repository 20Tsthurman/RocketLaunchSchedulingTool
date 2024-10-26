from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Your API key from OpenWeatherMap
API_KEY = 'a68141d5fda273bad55c2fd0f2b982b0'  # Replace this with your actual key

# Sample launch site coordinates for Kennedy Space Center and Cape Canaveral
launch_sites = {
    "Kennedy Space Center": {"lat": 28.573255, "lon": -80.646895},
    "Cape Canaveral": {"lat": 28.4889, "lon": -80.5778}
}

# Sample data for launches
launch_data = [
    {"id": 1, "site": "Kennedy Space Center", "date": "2024-12-15", "time": "14:30", "status": "Scheduled"},
    {"id": 2, "site": "Cape Canaveral", "date": "2024-12-18", "time": "10:00", "status": "Scheduled"},
]

@app.route('/')
def home():
    return "Welcome to the Rocket Launch Scheduling Application API!"

# Weather endpoint with real data using OpenWeatherMap
@app.route('/weather/<location>', methods=['GET'])
def get_weather(location):
    if location in launch_sites:
        lat = launch_sites[location]["lat"]
        lon = launch_sites[location]["lon"]
        
        weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        response = requests.get(weather_url)

        if response.status_code == 200:
            data = response.json()
            weather_data = {
                "location": location,
                "temperature": data['main']['temp'],
                "description": data['weather'][0]['description'],
                "wind_speed": data['wind']['speed'],
                "humidity": data['main']['humidity']
            }
        else:
            weather_data = {
                "error": "Could not fetch weather data for the provided location."
            }

        return jsonify(weather_data)
    else:
        return jsonify({"error": "Invalid location provided."})

# Launch schedule endpoint
@app.route('/launch_schedule', methods=['GET'])
def get_launch_schedule():
    return jsonify(launch_data)

# Launch score endpoint with real weather data from OpenWeatherMap
@app.route('/launch_score/<location>', methods=['GET'])
def get_launch_score(location):
    if location in launch_sites:
        lat = launch_sites[location]["lat"]
        lon = launch_sites[location]["lon"]

        weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        response = requests.get(weather_url)

        if response.status_code == 200:
            data = response.json()
            weather_score = calculate_weather_score(data)
            regulatory_score = 90  # Placeholder value for regulatory score

            # Combine these with weights to calculate the final score
            composite_score = 0.6 * weather_score + 0.4 * regulatory_score

            return jsonify({
                "location": location,
                "score": composite_score
            })
        else:
            return jsonify({
                "error": "Could not calculate launch score due to missing weather data."
            })
    else:
        return jsonify({"error": "Invalid location provided."})

# Function to calculate weather score
def calculate_weather_score(data):
    temperature = data['main']['temp']
    wind_speed = data['wind']['speed']
    humidity = data['main']['humidity']
    weather_description = data['weather'][0]['description']

    # Assign points based on temperature, wind speed, and weather conditions
    score = 100

    # Ideal temperature for a launch: between 15 to 25 °C
    if temperature < 15 or temperature > 25:
        score -= 20

    # Wind speed should ideally be below 10 m/s for safe launches
    if wind_speed > 10:
        score -= 30

    # Humidity above 80% could be problematic
    if humidity > 80:
        score -= 20

    # Penalize certain adverse weather conditions
    if "storm" in weather_description.lower() or "rain" in weather_description.lower():
        score -= 40

    # Ensure score stays within the range 0-100
    score = max(0, min(score, 100))

    return score

if __name__ == "__main__":
    app.run(debug=True)
