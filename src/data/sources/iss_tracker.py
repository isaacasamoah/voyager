"""ISS (International Space Station) real-time tracking.

Uses Open Notify API - no API key required!
API Docs: http://open-notify.org/Open-Notify-API/
"""

import requests
from typing import Optional
from datetime import datetime
from geopy.geocoders import Nominatim


def format_timestamp(timestamp: int) -> str:
    """Convert Unix timestamp to human-readable UTC time.

    Args:
        timestamp: Unix timestamp

    Returns:
        Formatted time string (24-hour format)
    """
    dt = datetime.utcfromtimestamp(timestamp)
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")


def get_nearest_city(lat: float, lon: float) -> str:
    """Get nearest city name from coordinates.

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        City name or ocean/location description
    """
    try:
        geolocator = Nominatim(user_agent="voyager_iss_tracker")
        location = geolocator.reverse(f"{lat}, {lon}", timeout=10)

        if location and location.raw.get('address'):
            address = location.raw['address']
            # Try to get city, town, or village
            city = address.get('city') or address.get('town') or address.get('village')
            country = address.get('country', '')

            if city:
                return f"{city}, {country}" if country else city
            elif country:
                return country
            else:
                return location.address.split(',')[0]
        else:
            return "Over ocean/remote area"
    except Exception as e:
        return f"Unknown location ({lat:.2f}, {lon:.2f})"


def get_iss_location():
    """Get current ISS position.

    Returns:
        dict with lat, lon, timestamp, altitude

    Example response from API:
    {
        "iss_position": {"latitude": "-45.1234", "longitude": "168.5678"},
        "timestamp": 1234567890,
        "message": "success"
    }
    """
    # TODO: Define the API endpoint
    url = "http://api.open-notify.org/iss-now.json"
    response = requests.get(url)
    # TODO: Make GET request using requests.get()
    # Store response in a variable

    if response.status_code == 200:
        data = response.json()
        iss_pos = data["iss_position"]
        formatted_iss_pos = {"latitude": float(iss_pos["latitude"]),
                             "longitude": float(iss_pos["longitude"]),
                             "timestamp": data["timestamp"],
                             "altitude_km": 408

        }
        return formatted_iss_pos
    else:
        raise RuntimeError(f"Failed to fetch ISS location: {response.status_code}")\
    
 



def get_iss_pass_times(lat: float, lon: float, altitude: float = 0):
    """Get upcoming ISS pass times for a location.

    Args:
        lat: Observer latitude
        lon: Observer longitude
        altitude: Observer altitude in meters (default 0)

    Returns:
        List of pass times with duration and max elevation

    Example API response:
    {
        "response": [
            {"risetime": 1234567890, "duration": 645}
        ]
    }
    """
    # TODO: Build API URL with parameters
    url = f"http://api.open-notify.org/iss-pass.json?lat={lat}&lon={lon}&alt={altitude}"
    print(f"URL: {url}")

    # TODO: Make GET request
    response = requests.get(url)

    if response.status_code == 200:
       return response
    else:
        raise RuntimeError(f"Service is no longer available: {response.status_code}")
        
    # TODO: Parse response and return list of passes
    # Each pass should include:
    # - risetime (when ISS appears)
    # - duration (how long it's visible in seconds)



def get_people_in_space():
    """Get list of people currently in space.

    Returns:
        dict with count and list of astronauts

    Example response:
    {
        "number": 7,
        "people": [
            {"name": "...", "craft": "ISS"}
        ]
    }
    """
    # TODO: API endpoint: http://api.open-notify.org/astros.json
    url = "http://api.open-notify.org/astros.json"

    # TODO: Make request and parse response
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        raise RuntimeError(f"Error calling api status: {response.status_code}")
    

    # TODO: Return formatted data with astronaut names and spacecraft

    


# Optional: Add a main block for testing
if __name__ == "__main__":
#     # Test the functions1
     location = get_iss_location()
     city = get_nearest_city(location['latitude'], location['longitude'])
     time = format_timestamp(location['timestamp'])

     print(f"ISS is at: {location}")
     print(f"Location: {city}")
     print(f"Time: {time}")

     # Note: ISS pass times endpoint discontinued as of 2025
     # pass_times = get_iss_pass_times(-35.2809, 149.1300)

     people = get_people_in_space()
     print(f"\n{people['number']} people in space!")
     for person in people['people']:
         print(f"  - {person['name']} on {person['craft']}")
