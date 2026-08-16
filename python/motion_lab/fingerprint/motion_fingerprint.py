import math
from typing import List, Dict, Any

class MotionFingerprintEngine:
    """
    Generates and compares multi-dimensional motion fingerprints across the entire animation lifecycle.
    Tracks position, scale, rotation, opacity, velocity, and acceleration.
    """

    @classmethod
    def generate_fingerprint(
        cls,
        element_id: str,
        samples: List[Dict[str, Any]],
        duration_ms: float = 1000.0
    ) -> Dict[str, Any]:
        """
        Generates normalized motion fingerprint vector.
        """
        if not samples:
            return {
                "elementId": element_id,
                "durationMs": duration_ms,
                "totalCheckpoints": 0,
                "fingerprintVector": [],
                "peakAcceleration": 0.0,
                "kineticEnergy": 0.0,
            }

        vector: List[Dict[str, Any]] = []
        prev_v = 0.0
        prev_t = 0.0
        prev_y = 0.0
        total_energy = 0.0
        accelerations: List[float] = []

        for idx, s in enumerate(samples):
            t = float(s.get("timestampMs", (idx / max(1, len(samples) - 1)) * duration_ms))
            normalized_t = round(t / max(1.0, duration_ms), 4)
            x = float(s.get("x", 0.0))
            y = float(s.get("y", 0.0))
            scale = float(s.get("scale", 1.0))
            rotate = float(s.get("rotateDeg", 0.0))
            opacity = float(s.get("opacity", 1.0))

            dt = max(1.0, t - prev_t) if idx > 0 else 1.0
            dy = y - prev_y if idx > 0 else 0.0
            v = dy / dt if idx > 0 else 0.0
            dv = v - prev_v if idx > 0 else 0.0
            a = dv / dt if idx > 0 else 0.0

            accelerations.append(abs(a))
            total_energy += abs(v)

            vector.append({
                "normalizedTime": normalized_t,
                "x": round(x, 2),
                "y": round(y, 2),
                "scale": round(scale, 4),
                "rotateDeg": round(rotate, 2),
                "opacity": round(opacity, 3),
                "velocity": round(v, 5),
                "acceleration": round(a, 6),
            })

            prev_t = t
            prev_y = y
            prev_v = v

        peak_acc = max(accelerations) if accelerations else 0.0

        return {
            "elementId": element_id,
            "durationMs": duration_ms,
            "totalCheckpoints": len(vector),
            "fingerprintVector": vector,
            "peakAcceleration": round(peak_acc, 6),
            "kineticEnergy": round(total_energy, 4),
            "isHighKineticMotion": peak_acc > 0.0001 or total_energy > 0.1,
        }

    @classmethod
    def compare_fingerprints(
        cls,
        source_vector: List[Dict[str, Any]],
        candidate_vector: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compares two motion fingerprints and returns Mean Absolute Error (MAE) and fidelity score.
        """
        limit = min(len(source_vector), len(candidate_vector))
        if limit == 0:
            return {"similarity": 1.0, "mae": 0.0, "isTrajectoryEquivalent": True}

        total_err = 0.0
        for i in range(limit):
            s = source_vector[i]
            c = candidate_vector[i]

            dy = abs(float(s.get("y", 0)) - float(c.get("y", 0)))
            d_scale = abs(float(s.get("scale", 1)) - float(c.get("scale", 1))) * 100.0
            d_op = abs(float(s.get("opacity", 1)) - float(c.get("opacity", 1))) * 50.0
            d_v = abs(float(s.get("velocity", 0)) - float(c.get("velocity", 0))) * 10.0

            frame_err = (dy + d_scale + d_op + d_v) / 4.0
            total_err += frame_err

        mae = total_err / limit
        similarity = max(0.0, min(1.0, 1.0 - (mae / 100.0)))

        return {
            "similarity": round(similarity, 4),
            "mae": round(mae, 4),
            "isTrajectoryEquivalent": similarity >= 0.98,
        }
