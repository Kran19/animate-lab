import math
from typing import List, Dict, Any, Tuple

class EasingCurveFitter:
    """
    Fits observed motion sequences against known parametric easing functions using
    deterministic Mean Squared Error (MSE) minimization.
    """

    @staticmethod
    def linear(t: float) -> float:
        return t

    @staticmethod
    def power1_in(t: float) -> float:
        return t * t

    @staticmethod
    def power1_out(t: float) -> float:
        return t * (2 - t)

    @staticmethod
    def power1_in_out(t: float) -> float:
        return 2 * t * t if t < 0.5 else -1 + (4 - 2 * t) * t

    @staticmethod
    def power2_in(t: float) -> float:
        return t * t * t

    @staticmethod
    def power2_out(t: float) -> float:
        t_minus = t - 1
        return t_minus * t_minus * t_minus + 1

    @staticmethod
    def power2_in_out(t: float) -> float:
        return 4 * t * t * t if t < 0.5 else (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

    @staticmethod
    def power3_in(t: float) -> float:
        return t * t * t * t

    @staticmethod
    def power3_out(t: float) -> float:
        t_minus = t - 1
        return 1 - t_minus * t_minus * t_minus * t_minus

    @staticmethod
    def power3_in_out(t: float) -> float:
        return 8 * t * t * t * t if t < 0.5 else 1 - 8 * (t - 1) ** 4

    @staticmethod
    def power4_out(t: float) -> float:
        t_minus = t - 1
        return 1 + t_minus * t_minus * t_minus * t_minus * t_minus

    @staticmethod
    def expo_out(t: float) -> float:
        return 1.0 if t >= 1.0 else 1.0 - math.pow(2, -10 * t)

    @staticmethod
    def circ_out(t: float) -> float:
        return math.sqrt(max(0.0, 1 - (t - 1) * (t - 1)))

    @staticmethod
    def back_out(t: float, s: float = 1.70158) -> float:
        t_minus = t - 1
        return t_minus * t_minus * ((s + 1) * t_minus + s) + 1

    @staticmethod
    def elastic_out(t: float) -> float:
        if t == 0.0 or t == 1.0:
            return t
        p = 0.3
        s = p / 4.0
        return math.pow(2, -10 * t) * math.sin((t - s) * (2 * math.pi) / p) + 1.0

    @classmethod
    def fit(cls, samples: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Takes a list of normalized (t, value) tuples where 0.0 <= t <= 1.0 and 0.0 <= value <= 1.0.
        Returns the best-fitting easing curve with Mean Squared Error (MSE).
        """
        if not samples or len(samples) < 2:
            return {
                "bestFit": "linear",
                "mse": 0.0,
                "confidence": 1.0,
                "isReconstructed": True,
                "allProfiles": {}
            }

        profiles = {
            "linear": cls.linear,
            "power1.in": cls.power1_in,
            "power1.out": cls.power1_out,
            "power1.inOut": cls.power1_in_out,
            "power2.in": cls.power2_in,
            "power2.out": cls.power2_out,
            "power2.inOut": cls.power2_in_out,
            "power3.in": cls.power3_in,
            "power3.out": cls.power3_out,
            "power3.inOut": cls.power3_in_out,
            "power4.out": cls.power4_out,
            "expo.out": cls.expo_out,
            "circ.out": cls.circ_out,
            "back.out": cls.back_out,
            "elastic.out": cls.elastic_out,
        }

        all_errors: Dict[str, float] = {}
        best_name = "linear"
        lowest_mse = float("inf")

        for name, fn in profiles.items():
            total_sq_err = 0.0
            for t, val in samples:
                # Clamp t to [0, 1]
                t_clamped = max(0.0, min(1.0, float(t)))
                try:
                    pred = fn(t_clamped)
                except Exception:
                    pred = t_clamped
                diff = float(val) - pred
                total_sq_err += diff * diff

            mse = total_sq_err / len(samples)
            all_errors[name] = round(mse, 6)

            if mse < lowest_mse:
                lowest_mse = mse
                best_name = name

        # Confidence is inversely proportional to MSE (1.0 = perfect match, 0.0 = high error)
        confidence = max(0.0, min(1.0, 1.0 - (lowest_mse * 10.0)))
        is_reconstructed = lowest_mse <= 0.05

        return {
            "bestFit": best_name,
            "mse": round(lowest_mse, 6),
            "confidence": round(confidence, 4),
            "isReconstructed": is_reconstructed,
            "allProfiles": all_errors
        }
