"""
Space Physics Reasoning Data Generator
Creates synthetic training examples with step-by-step solutions
"""

import json
import math
from typing import List, Dict

# Earth constants
MU_EARTH = 398600  # km³/s²
R_EARTH = 6371     # km

def hohmann_transfer(r1: float, r2: float) -> Dict:
    """Generate Hohmann transfer problem with solution"""
    
    # Calculations
    v1 = math.sqrt(MU_EARTH / r1)
    a = (r1 + r2) / 2
    v2 = math.sqrt(MU_EARTH * (2/r1 - 1/a))
    dv1 = v2 - v1
    
    v3 = math.sqrt(MU_EARTH / r2)
    v4 = math.sqrt(MU_EARTH * (2/r2 - 1/a))
    dv2 = v3 - v4
    
    dv_total = dv1 + dv2
    
    return {
        "problem": f"A spacecraft is in circular orbit at {r1:.0f} km from Earth's center. Calculate delta-v for Hohmann transfer to {r2:.0f} km.",
        "solution": f"""**Step 1: Current velocity**
v₁ = √(μ/r₁) = √({MU_EARTH}/{r1:.0f}) = {v1:.2f} km/s

**Step 2: Transfer orbit**
Semi-major axis: a = ({r1:.0f} + {r2:.0f})/2 = {a:.0f} km

**Step 3: First burn (perigee)**
v₂ = √(μ(2/r₁ - 1/a)) = {v2:.2f} km/s
Δv₁ = {dv1:.2f} km/s

**Step 4: Target velocity**
v₃ = √(μ/r₂) = {v3:.2f} km/s

**Step 5: Second burn (apogee)**
v₄ = √(μ(2/r₂ - 1/a)) = {v4:.2f} km/s
Δv₂ = {dv2:.2f} km/s

**Total: Δv = {dv_total:.2f} km/s**

Physical insight: Two impulsive burns - enter transfer ellipse, then circularize."""
    }

def orbital_period(altitude: float) -> Dict:
    """Generate orbital period problem"""
    
    r = R_EARTH + altitude
    T = 2 * math.pi * math.sqrt(r**3 / MU_EARTH)
    T_min = T / 60
    
    context = "LEO" if altitude < 2000 else "MEO" if altitude < 20000 else "near GEO"
    
    return {
        "problem": f"Calculate orbital period at {altitude:.0f} km altitude.",
        "solution": f"""**Step 1: Orbital radius**
r = {R_EARTH} + {altitude:.0f} = {r:.0f} km

**Step 2: Kepler's Third Law**
T = 2π√(r³/μ)

**Step 3: Calculate**
T = 2π√({r:.0f}³/{MU_EARTH})
T = {T:.0f} seconds = {T_min:.1f} minutes

Physical insight: At {altitude:.0f} km ({context}), one orbit takes {T_min:.1f} minutes."""
    }

def escape_velocity(altitude: float) -> Dict:
    """Generate escape velocity problem"""
    
    r = R_EARTH + altitude
    v_esc = math.sqrt(2 * MU_EARTH / r)
    v_circ = math.sqrt(MU_EARTH / r)
    ratio = v_esc / v_circ
    
    return {
        "problem": f"What velocity escapes Earth from {altitude:.0f} km altitude?",
        "solution": f"""**Step 1: Radius**
r = {R_EARTH} + {altitude:.0f} = {r:.0f} km

**Step 2: Escape velocity**
v_esc = √(2μ/r) = √(2 × {MU_EARTH}/{r:.0f})
v_esc = {v_esc:.2f} km/s

**Step 3: Compare to circular**
v_circ = √(μ/r) = {v_circ:.2f} km/s
Ratio = {ratio:.2f} (always √2 ≈ 1.41)

Physical insight: Escape velocity is √2 times circular velocity at any altitude."""
    }

def inclination_change(i1: float, i2: float, altitude: float) -> Dict:
    """Generate plane change problem"""
    
    r = R_EARTH + altitude
    v = math.sqrt(MU_EARTH / r)
    delta_i = abs(i2 - i1)
    delta_i_rad = math.radians(delta_i)
    dv = 2 * v * math.sin(delta_i_rad / 2)
    
    return {
        "problem": f"Calculate delta-v to change inclination from {i1:.0f}° to {i2:.0f}° at {altitude:.0f} km.",
        "solution": f"""**Step 1: Orbital velocity**
r = {R_EARTH} + {altitude:.0f} = {r:.0f} km
v = √(μ/r) = {v:.2f} km/s

**Step 2: Plane change angle**
Δi = |{i2:.0f}° - {i1:.0f}°| = {delta_i:.0f}°

**Step 3: Delta-v formula**
Δv = 2v sin(Δi/2)
Δv = 2 × {v:.2f} × sin({delta_i:.0f}°/2)
Δv = {dv:.2f} km/s

Physical insight: Plane changes are expensive! Δv scales with orbital velocity and sin(Δi/2)."""
    }

def generate_dataset(n_examples: int = 100) -> List[Dict]:
    """Generate full training dataset"""
    
    examples = []
    
    # Hohmann transfers (30%)
    transfers = [
        (6771, 42164),   # LEO to GEO
        (6571, 6771),    # ISS boost
        (6671, 26560),   # LEO to GPS
        (7771, 384400),  # To Moon
        (6871, 7871),    # 500km to 1500km
    ]
    for r1, r2 in transfers * (n_examples // 30):
        examples.append(hohmann_transfer(r1, r2))
    
    # Orbital periods (25%)
    altitudes = [200, 400, 600, 800, 1000, 1500, 20200, 35786]
    for alt in altitudes * (n_examples // 25):
        examples.append(orbital_period(alt))
    
    # Escape velocities (20%)
    esc_alts = [0, 200, 400, 1000, 5000, 10000]
    for alt in esc_alts * (n_examples // 20):
        examples.append(escape_velocity(alt))
    
    # Inclination changes (25%)
    plane_changes = [
        (0, 28.5, 400),   # Equatorial to KSC
        (28.5, 51.6, 400), # KSC to ISS
        (51.6, 98, 400),   # ISS to polar
        (0, 90, 600),      # Equatorial to polar
    ]
    for i1, i2, alt in plane_changes * (n_examples // 25):
        examples.append(inclination_change(i1, i2, alt))
    
    return examples[:n_examples]

def export_jsonl(examples: List[Dict], filename: str = "space_reasoning.jsonl"):
    """Export to JSONL format for training"""
    
    with open(filename, 'w') as f:
        for ex in examples:
            entry = {
                "messages": [
                    {"role": "user", "content": ex["problem"]},
                    {"role": "assistant", "content": ex["solution"]}
                ]
            }
            f.write(json.dumps(entry) + '\n')
    
    print(f"✅ Exported {len(examples)} examples to {filename}")

if __name__ == "__main__":
    # Generate 1000 examples for GCP learning
    examples = generate_dataset(1000)
    
    # Show samples
    print("📝 Sample examples:\n")
    for i, ex in enumerate(examples[:3], 1):
        print(f"--- Example {i} ---")
        print(f"Q: {ex['problem']}")
        print(f"A: {ex['solution'][:200]}...\n")
    
    # Export
    export_jsonl(examples)
    
    print(f"\n🚀 Ready to train!")
    print(f"   Dataset: space_reasoning.jsonl")
    print(f"   Examples: {len(examples)}")
    print(f"   Topics: Hohmann, periods, escape velocity, plane changes")