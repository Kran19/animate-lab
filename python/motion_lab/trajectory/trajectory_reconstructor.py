import math
from typing import List, Dict, Any

class TrajectoryReconstructor:
    """
    Reconstructs continuous parametric motion trajectories: x(t), y(t), scale(t), rotate(t), opacity(t).
    Supports time-domain, interaction-domain, and scroll-domain trajectories.
    """

    @classmethod
    def reconstruct_trajectory(
        cls,
        samples: List[Dict[str, Any]],
        domain_type: str = "TIME_DOMAIN"  # "TIME_DOMAIN" | "INTERACTION_DOMAIN" | "SCROLL_DOMAIN"
    ) -> Dict[str, Any]:
        """
        Takes discrete state samples and constructs continuous curves with velocity derivatives.
        """
        if not samples:
            return {
                "domainType": domain_type,
                "totalSamples": 0,
                "durationMs": 0,
                "trajectoryCurve": [],
                "peakVelocity": 0.0,
                "averageVelocity": 0.0,
                "inferredCurve": "linear",
            }

        total_samples = len(samples)
        trajectory_points: List[Dict[str, Any]] = []
        prev_time = 0.0
        prev_y = 0.0
        velocities: List[float] = []

        for idx, sample in enumerate(samples):
            t = float(sample.get("timestampMs", sample.get("progressRatio", idx * 100)))
            x = float(sample.get("x", 0.0))
            y = float(sample.get("y", 0.0))
            scale = float(sample.get("scale", 1.0))
            rotate = float(sample.get("rotateDeg", 0.0))
            opacity = float(sample.get("opacity", 1.0))

            dt = max(1.0, t - prev_time) if idx > 0 else 1.0
            dy = y - prev_y if idx > 0 else 0.0
            vel = abs(dy / dt) if idx > 0 else 0.0
            velocities.append(vel)

            trajectory_points.append({
                "index": idx,
                "t": t,
                "x": round(x, 2),
                "y": round(y, 2),
                "scale": round(scale, 4),
                "rotateDeg": round(rotate, 2),
                "opacity": round(opacity, 3),
                "velocity": round(vel, 4),
            })

            prev_time = t
            prev_y = y

        peak_vel = max(velocities) if velocities else 0.0
        avg_vel = sum(velocities) / len(velocities) if velocities else 0.0

        # Infer curve from velocity profile
        inferred_curve = "easeOutCubic" if peak_vel > avg_vel * 1.3 else "linear"

        return {
            "domainType": domain_type,
            "totalSamples": total_samples,
            "durationMs": trajectory_points[-1]["t"] if trajectory_points else 0,
            "trajectoryCurve": trajectory_points,
            "peakVelocity": round(peak_vel, 4),
            "averageVelocity": round(avg_vel, 4),
            "inferredCurve": inferred_curve,
        }
