"""Starlink constellation tracking"""

import requests
import numpy as np
import os
from skyfield.api import load, wgs84, EarthSatellite
from typing import List, Dict, Tuple
try:
    import streamlit as st
    HAS_STREAMLIT = True
except ImportError:
    HAS_STREAMLIT = False

try:
    from iss_tracker import get_nearest_city
except ModuleNotFoundError:
    from data.sources.iss_tracker import get_nearest_city

# Path to static TLE cache
TLE_CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "tle_cache", "starlink_tle.txt")

@st.cache_data(ttl=3600) if HAS_STREAMLIT else lambda f: f
def fetch_starlink_tles(max_satellites=None):
    """Fetch Starlink TLE data from static cache (instant) with API fallback.
    Returns: List of dicts with 'name, 'line1', 'line2'
    """
    # Try static cache first (instant, no network required)
    if os.path.exists(TLE_CACHE_FILE):
        try:
            with open(TLE_CACHE_FILE, 'r') as f:
                tle_text = f.read()
        except Exception as e:
            # Fall through to API if file read fails
            pass
        else:
            lines = tle_text.strip().split('\n')
    else:
        # Fallback to API if no cache file
        url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle"
        try:
            response = requests.get(url, timeout=30)
            if response.status_code != 200:
                raise RuntimeError(f"Failed to fetch TLES: {response.status_code}")
            lines = response.text.strip().split('\n')
        except requests.exceptions.Timeout:
            raise RuntimeError("Celestrak API timed out. Please try again.")
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Failed to connect to Celestrak: {str(e)}")

    satellites = []
    for i in range(0, len(lines),3): # setp by 3
        if i+2 >= len(lines): # make sure we have all three lines
            break
        sat_data = {
            'name': lines[i].strip(),
            'line1' : lines[i+1].strip(),
            'line2' : lines[i+2].strip()
        }
        satellites.append(sat_data)
        if max_satellites and len(satellites) >= max_satellites:
            break

    return satellites

def propagate_satellite_position(tle_data, time=None):
    """Propagate satellite orbit to get current position.

    Args:
        tle_data: Dict with 'name', 'line1', 'line2'
        time: Optional Skyfield Time object (defaults to now)

    Returns:
        Tuple of (latitude, longitude, altitude_km)
    """
      # TODO:
    ts = load.timescale()
      # 1. Load timescale: ts = load.timescale()
      # 2. Get current time if not provided: time = ts.now()
    if not time:
        time = ts.now()
    satellite = EarthSatellite(tle_data['line1'], tle_data['line2'], tle_data['name'], ts)
    current_position = satellite.at(time)
    earth_current_poosition = wgs84.subpoint(current_position)
    lat = earth_current_poosition.latitude.degrees
    lon = earth_current_poosition.longitude.degrees
    alt_km = earth_current_poosition.elevation.km

    return (lat, lon, alt_km)


def get_starlink_constellation(num_satellites=10):
    """Get current positions of Starlink constellation for optimization.

    Args:
        num_satellites: Number of satellites to track

    Returns:
        numpy array of shape (n, 2) with (lat, lon) positions
    """
    print(f"Fetching {num_satellites} Starlink satellites...")
    satellites = fetch_starlink_tles(max_satellites=num_satellites)

    positions = []
    for sat in satellites:
        lat, lon, alt_km = propagate_satellite_position(sat)
        positions.append([lat, lon])

    positions_array = np.array(positions)
    print(f"✅ Got {len(positions_array)} positions")

    return positions_array


if __name__ == "__main__":
    print("🛰️ STARLINK CONSTELLATION OPTIMIZER TEST")
    print("=" * 60)

    # Test constellation tracking + optimization
    print("\n1️⃣ Fetching real Starlink constellation...")
    constellation = get_starlink_constellation(num_satellites=5)

    print(f"\nCurrent constellation positions:")
    for i, pos in enumerate(constellation):
        print(f"  Satellite {i+1}: ({pos[0]:7.2f}°, {pos[1]:8.2f}°)")

    # Import optimizer
    import sys
    sys.path.insert(0, '/home/isaac/voyager/src')
    from spaceml.constellation_optimizer import optimize_satellite_positions

    print("\n2️⃣ Optimizing constellation...")
    weights = {"efficiency": 0.4, "redundancy": 0.3, "communication": 0.3}
    print(f"   Weights: {weights}")

    optimized = optimize_satellite_positions(constellation, weights)

    print(f"\n✅ Optimized constellation positions:")
    for i, pos in enumerate(optimized):
        city = get_nearest_city(pos[0], pos[1])
        print(f"  Satellite {i+1}: ({pos[0]:7.2f}°, {pos[1]:8.2f}°) - {city}")
