"""Elegant satellite constellation visualization using Plotly."""

import plotly.graph_objects as go
import numpy as np


def create_earth_globe():
    """Create a simple Earth sphere for 3D visualization."""
    # Create sphere mesh
    u = np.linspace(0, 2 * np.pi, 50)
    v = np.linspace(0, np.pi, 50)
    x = np.outer(np.cos(u), np.sin(v))
    y = np.outer(np.sin(u), np.sin(v))
    z = np.outer(np.ones(np.size(u)), np.cos(v))

    return go.Surface(
        x=x, y=y, z=z,
        colorscale=[[0, '#0B3D91'], [1, '#1E88E5']],  # NASA blue gradient
        showscale=False,
        opacity=0.7,
        name='Earth'
    )


def latlon_to_cartesian(lat, lon, radius=1.05):
    """Convert lat/lon to 3D Cartesian coordinates (slightly above Earth surface)."""
    lat_rad = np.radians(lat)
    lon_rad = np.radians(lon)

    x = radius * np.cos(lat_rad) * np.cos(lon_rad)
    y = radius * np.cos(lat_rad) * np.sin(lon_rad)
    z = radius * np.sin(lat_rad)

    return x, y, z


def visualize_satellites(positions, optimized_positions=None, title="Satellite Constellation"):
    """Create an elegant 3D visualization of satellite positions.

    Args:
        positions: numpy array of shape (n, 2) with (lat, lon)
        optimized_positions: Optional numpy array for before/after comparison
        title: Plot title

    Returns:
        Plotly figure object
    """
    fig = go.Figure()

    # Add Earth
    fig.add_trace(create_earth_globe())

    # Convert current positions to 3D
    lats, lons = positions[:, 0], positions[:, 1]
    x, y, z = latlon_to_cartesian(lats, lons)

    # Add current satellite positions
    fig.add_trace(go.Scatter3d(
        x=x, y=y, z=z,
        mode='markers',
        marker=dict(
            size=8,
            color='#FF6B6B',  # Coral red for current
            symbol='diamond',
            line=dict(color='white', width=1)
        ),
        name='Current Position',
        text=[f'Sat {i+1}: ({lats[i]:.1f}°, {lons[i]:.1f}°)' for i in range(len(lats))],
        hoverinfo='text'
    ))

    # Add optimized positions if provided
    if optimized_positions is not None:
        opt_lats, opt_lons = optimized_positions[:, 0], optimized_positions[:, 1]
        opt_x, opt_y, opt_z = latlon_to_cartesian(opt_lats, opt_lons)

        fig.add_trace(go.Scatter3d(
            x=opt_x, y=opt_y, z=opt_z,
            mode='markers',
            marker=dict(
                size=8,
                color='#4ECDC4',  # Teal for optimized
                symbol='circle',
                line=dict(color='white', width=1)
            ),
            name='Optimized Position',
            text=[f'Sat {i+1}: ({opt_lats[i]:.1f}°, {opt_lons[i]:.1f}°)' for i in range(len(opt_lats))],
            hoverinfo='text'
        ))

        # Add lines showing movement
        for i in range(len(positions)):
            fig.add_trace(go.Scatter3d(
                x=[x[i], opt_x[i]],
                y=[y[i], opt_y[i]],
                z=[z[i], opt_z[i]],
                mode='lines',
                line=dict(color='rgba(255,255,255,0.3)', width=2),
                showlegend=False,
                hoverinfo='skip'
            ))

    # Clean, minimal layout
    fig.update_layout(
        title=dict(text=title, font=dict(size=20, color='#0B3D91')),
        scene=dict(
            xaxis=dict(visible=False),
            yaxis=dict(visible=False),
            zaxis=dict(visible=False),
            bgcolor='rgba(0,0,0,0)',
            camera=dict(
                eye=dict(x=1.5, y=1.5, z=1.5)
            )
        ),
        paper_bgcolor='white',
        height=600,
        showlegend=True,
        legend=dict(
            x=0.02,
            y=0.98,
            bgcolor='rgba(255,255,255,0.8)',
            bordercolor='#0B3D91',
            borderwidth=1
        )
    )

    return fig
