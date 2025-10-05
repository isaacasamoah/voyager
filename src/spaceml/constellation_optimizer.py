"""Satellite constellation optimizer using eigenvalue-based multi-constraint optimization.

Imported from SpaceML project - uses scipy minimize with L-BFGS-B method.
"""

import numpy as np
from scipy.optimize import minimize
from typing import Dict


def great_circle_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great circle (angular) distance between two geographical coordinates.

    Args:
        lat1, lon1: First coordinate (degrees)
        lat2, lon2: Second coordinate (degrees)

    Returns:
        Angular distance in radians
    """
    lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(np.radians, [lat1, lon1, lat2, lon2])

    x1 = np.cos(lat1_rad) * np.cos(lon1_rad)
    y1 = np.cos(lat1_rad) * np.sin(lon1_rad)
    z1 = np.sin(lat1_rad)

    x2 = np.cos(lat2_rad) * np.cos(lon2_rad)
    y2 = np.cos(lat2_rad) * np.sin(lon2_rad)
    z2 = np.sin(lat2_rad)

    dot_product = x1*x2 + y1*y2 + z1*z2
    angular_distance = np.arccos(max(-1, min(1, dot_product)))

    return angular_distance


def spherical_coverage_overlap(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate coverage overlap between two satellites.

    Args:
        lat1, lon1: First satellite position (degrees)
        lat2, lon2: Second satellite position (degrees)

    Returns:
        Overlap value [0, 1]
    """
    angular_distance = great_circle_distance(lat1, lon1, lat2, lon2)
    overlap = np.cos(angular_distance/2)
    return max(0, overlap)


def constraint_matrix(satellite_positions: np.ndarray, constraint_type: str) -> np.ndarray:
    """Derive constraint matrix for n satellites (FIXED penalty-based approach).

    Args:
        satellite_positions: Array of shape (n, 2) with (lat, lon) in degrees
        constraint_type: "efficiency" or "redundancy"

    Returns:
        Constraint matrix of shape (n, n)
    """
    number_satellites = len(satellite_positions)

    # FIXED: All constraints represent PENALTIES for poor constraint satisfaction
    constraint_functions = {
        "efficiency": lambda overlap: overlap,        # Penalty for high overlap (bad for efficiency)
        "redundancy": lambda overlap: 1 - overlap    # Penalty for low overlap (bad for redundancy)
    }

    C = np.zeros((number_satellites, number_satellites))

    for i in range(number_satellites):
        for j in range(number_satellites):
            if i == j:
                C[i,j] = 1
            else:
                overlap = spherical_coverage_overlap(
                    satellite_positions[i][0], satellite_positions[i][1],
                    satellite_positions[j][0], satellite_positions[j][1]
                )
                try:
                    C[i,j] = constraint_functions[constraint_type](overlap)
                except KeyError:
                    valid_options = list(constraint_functions.keys())
                    raise ValueError(f"Unknown constraint: {constraint_type}. Valid options: {valid_options}")

    return C


def communication_matrix(satellite_positions: np.ndarray, altitudes=None,
                        optimal_distance: float = 5000, sigma: float = 2500, **kwargs) -> np.ndarray:
    """Derive communication matrix for n satellites (FIXED penalty-based approach).

    Args:
        satellite_positions: Array of shape (n, 2) with (lat, lon) in degrees
        altitudes: Optional satellite altitudes (unused, for compatibility)
        optimal_distance: Optimal communication distance in km (default 5000)
        sigma: Gaussian width parameter (default 2500)

    Returns:
        Communication matrix of shape (n, n)
    """
    number_satellites = len(satellite_positions)
    C = np.zeros((number_satellites, number_satellites))

    for i in range(number_satellites):
        for j in range(number_satellites):
            if i == j:
                C[i,j] = 1
            else:
                angular_distance = great_circle_distance(
                    satellite_positions[i][0], satellite_positions[i][1],
                    satellite_positions[j][0], satellite_positions[j][1]
                )

                distance_km = 6371 * angular_distance

                # Gaussian communication model: peak at optimal_distance
                communication_quality = np.exp(-((distance_km - optimal_distance)**2) / (2 * sigma**2))

                # FIXED: Use penalty for poor communication instead of reward
                communication_penalty = 1 - communication_quality
                C[i,j] = communication_penalty

    return C


def combined_matrix(satellite_positions: np.ndarray, weights: Dict[str, float],
                   altitudes=None, **kwargs) -> np.ndarray:
    """Combine constraint matrices with weights (uses FIXED penalty-based functions).

    Args:
        satellite_positions: Array of shape (n, 2) with (lat, lon) in degrees
        weights: Dict with keys 'efficiency', 'redundancy', 'communication'
        altitudes: Optional satellite altitudes

    Returns:
        Combined constraint matrix
    """
    efficiency_matrix = constraint_matrix(satellite_positions, "efficiency")
    redundancy_matrix = constraint_matrix(satellite_positions, "redundancy")
    signal_matrix = communication_matrix(satellite_positions, altitudes, **kwargs)

    C = (weights["efficiency"] * efficiency_matrix +
         weights["redundancy"] * redundancy_matrix +
         weights["communication"] * signal_matrix)

    return C


def objective(satellite_positions: np.ndarray, weights: Dict[str, float]) -> float:
    """Calculate objective (minimum eigenvalue) for optimization.

    Args:
        satellite_positions: Flattened array of positions
        weights: Optimization weights dict

    Returns:
        Negative minimum eigenvalue (to minimize)
    """
    np_positions = np.reshape(satellite_positions, (-1, 2))
    C = combined_matrix(np_positions, weights)
    eigenvalues = np.linalg.eigvals(C)
    optimal = -np.min(eigenvalues)
    return optimal


def optimize_satellite_positions(satellite_positions: np.ndarray,
                                 weights: Dict[str, float],
                                 method: str = "scipy", **kwargs) -> np.ndarray:
    """Find optimal positions for satellites (FIXED constraints).

    Args:
        satellite_positions: Initial positions array of shape (n, 2)
        weights: Dict with 'efficiency', 'redundancy', 'communication' (must sum to 1)
        method: Optimization method (default "scipy")

    Returns:
        Optimized positions array of shape (n, 2)

    Raises:
        KeyError: If weights dict missing required keys
        ValueError: If weights don't sum to 1
    """
    # Validate weights
    required_keys = {"efficiency", "redundancy", "communication"}
    if set(weights.keys()) != required_keys:
        raise KeyError(f"weights must be specifically {required_keys}")

    tolerance = 0.001
    if sum(weights.values()) - 1.0 > tolerance:
        raise ValueError(f"weights must add to 1, these weights add to {sum(weights.values()):.6f}")

    flat_satellite_positions = satellite_positions.flatten()
    bounds = [(-89, 89), (-179, 179)] * len(satellite_positions)
    args = (weights,)

    optimized_object = minimize(
        objective,
        flat_satellite_positions,
        args=args,
        method='L-BFGS-B',
        bounds=bounds
    )

    optimized_positions = np.reshape(optimized_object['x'], (-1, 2))
    return optimized_positions
