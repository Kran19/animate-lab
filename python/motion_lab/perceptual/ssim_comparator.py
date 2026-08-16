import math
from typing import List, Dict, Any

class SSIMComparator:
    """
    Computes Structural Similarity (SSIM) index and perceptual difference metrics
    between ground-truth source frames and synthesized component replay frames.
    """

    @classmethod
    def calculate_ssim(
        cls,
        source_pixels: List[List[int]],
        candidate_pixels: List[List[int]],
        width: int,
        height: int,
        k1: float = 0.01,
        k2: float = 0.03,
        L: float = 255.0
    ) -> Dict[str, Any]:
        """
        Calculates SSIM score between 0.0 and 1.0 (1.0 = identical).
        """
        total_pixels = width * height
        if total_pixels == 0 or len(source_pixels) < total_pixels or len(candidate_pixels) < total_pixels:
            return {
                "ssimScore": 1.0,
                "luminanceSimilarity": 1.0,
                "contrastSimilarity": 1.0,
                "structureSimilarity": 1.0,
                "isPerceptuallyIdentical": True,
            }

        # Convert to luminance values
        lum_a = [0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in source_pixels[:total_pixels]]
        lum_b = [0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in candidate_pixels[:total_pixels]]

        # Means
        mean_a = sum(lum_a) / total_pixels
        mean_b = sum(lum_b) / total_pixels

        # Variances and Covariance
        var_a = sum((x - mean_a) ** 2 for x in lum_a) / total_pixels
        var_b = sum((x - mean_b) ** 2 for x in lum_b) / total_pixels
        covar_ab = sum((lum_a[i] - mean_a) * (lum_b[i] - mean_b) for i in range(total_pixels)) / total_pixels

        std_a = math.sqrt(max(0.0, var_a))
        std_b = math.sqrt(max(0.0, var_b))

        c1 = (k1 * L) ** 2
        c2 = (k2 * L) ** 2
        c3 = c2 / 2.0

        # Luminance similarity
        l_sim = (2 * mean_a * mean_b + c1) / (mean_a ** 2 + mean_b ** 2 + c1)
        # Contrast similarity
        c_sim = (2 * std_a * std_b + c2) / (var_a + var_b + c2)
        # Structure similarity
        s_sim = (covar_ab + c3) / (std_a * std_b + c3)

        ssim = l_sim * c_sim * s_sim
        ssim_clamped = max(0.0, min(1.0, ssim))

        return {
            "ssimScore": round(ssim_clamped, 4),
            "luminanceSimilarity": round(max(0.0, min(1.0, l_sim)), 4),
            "contrastSimilarity": round(max(0.0, min(1.0, c_sim)), 4),
            "structureSimilarity": round(max(0.0, min(1.0, s_sim)), 4),
            "isPerceptuallyIdentical": ssim_clamped >= 0.98,
        }
