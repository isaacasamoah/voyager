"""
Mars Mission Planning Tools

Collection of orbital mechanics and mission planning calculation tools
for use with LangChain agents.
"""

import numpy as np
from langchain.tools import tool


@tool
def calculate_delta_v_to_mars() -> str:
    """Calculate delta-v requirement for Mars transfer using Hohmann transfer orbit."""
    # Simple Hohmann transfer calculation
    earth_orbital_velocity = 29.78  # km/s
    mars_orbital_velocity = 24.07   # km/s

    # Delta-v for departure from Earth orbit
    departure_dv = 2.9  # km/s (to escape Earth's influence)

    # Delta-v for Mars orbital insertion
    arrival_dv = 0.7   # km/s (to enter Mars orbit)

    total_dv = departure_dv + arrival_dv

    return f"Mars transfer requires approximately {total_dv} km/s total delta-v: {departure_dv} km/s departure + {arrival_dv} km/s arrival"


@tool
def calculate_mission_duration() -> str:
    """Calculate typical Mars mission duration including transfer time and surface stay."""
    # Hohmann transfer window timing
    transfer_time_to_mars = 8.5  # months
    surface_stay_time = 18       # months (waiting for return window)
    transfer_time_to_earth = 8.5 # months

    total_mission_time = transfer_time_to_mars + surface_stay_time + transfer_time_to_earth

    return f"Total Mars mission duration: {total_mission_time} months ({total_mission_time/12:.1f} years). Breakdown: {transfer_time_to_mars} months to Mars + {surface_stay_time} months on surface + {transfer_time_to_earth} months return"


@tool
def find_launch_window() -> str:
    """Find the next Mars launch window opportunity and explain why launch windows exist."""
    from datetime import datetime, timedelta

    # Known Mars launch windows (approximate)
    known_windows = [
        "July 2024",
        "September 2026",
        "November 2028",
        "January 2031",
        "March 2033"
    ]

    current_date = datetime.now()
    current_year = current_date.year

    # Find next window
    next_window = None
    for window in known_windows:
        window_year = int(window.split()[-1])
        if window_year >= current_year:
            next_window = window
            break

    if not next_window:
        next_window = "2035+ (calculations needed for future windows)"

    synodic_period = 26  # months between Mars launch opportunities

    return f"Next Mars launch window: {next_window}. Launch windows occur every {synodic_period} months when Earth 'catches up' to Mars in their orbits. Missing a window means waiting over 2 years for the next opportunity!"