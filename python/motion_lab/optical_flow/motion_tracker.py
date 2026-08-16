import math
from typing import List, Dict, Any

class MotionTracker:
    """
    Computes optical flow motion vectors and velocity profiles across consecutive image frames.
    """

    @classmethod
    def calculate_optical_flow(
        cls,
        frame_a_pixels: List[List[int]],
        frame_b_pixels: List[List[int]],
        width: int,
        height: int,
        grid_size: int = 10
    ) -> Dict[str, Any]:
        """
        Computes motion vectors in a grid of blocks across frame A and frame B.
        Returns average velocity, direction angle, total motion energy, and motion vectors.
        """
        total_pixels = width * height
        if total_pixels == 0 or len(frame_a_pixels) < total_pixels or len(frame_b_pixels) < total_pixels:
            return {
                "averageVelocity": 0.0,
                "dominantDirectionDeg": 0.0,
                "motionEnergy": 0.0,
                "vectors": [],
                "hasSignificantMotion": False,
            }

        vectors: List[Dict[str, Any]] = []
        total_vx = 0.0
        total_vy = 0.0
        total_energy = 0.0
        active_blocks = 0

        blocks_x = max(1, width // grid_size)
        blocks_y = max(1, height // grid_size)

        for by in range(blocks_y):
            for bx in range(blocks_x):
                start_x = bx * grid_size
                start_y = by * grid_size

                diff_sum = 0.0
                grad_x = 0.0
                grad_y = 0.0

                for y in range(start_y, min(start_y + grid_size, height)):
                    for x in range(start_x, min(start_x + grid_size, width)):
                        idx = y * width + x
                        pa = frame_a_pixels[idx]
                        pb = frame_b_pixels[idx]

                        lum_a = 0.299 * pa[0] + 0.587 * pa[1] + 0.114 * pa[2]
                        lum_b = 0.299 * pb[0] + 0.587 * pb[1] + 0.114 * pb[2]
                        diff = lum_b - lum_a
                        diff_sum += abs(diff)

                        # Spatial gradients
                        if x + 1 < width:
                            lum_a_right = 0.299 * frame_a_pixels[idx + 1][0] + 0.587 * frame_a_pixels[idx + 1][1] + 0.114 * frame_a_pixels[idx + 1][2]
                            grad_x += (lum_a_right - lum_a)
                        if y + 1 < height:
                            lum_a_down = 0.299 * frame_a_pixels[idx + width][0] + 0.587 * frame_a_pixels[idx + width][1] + 0.114 * frame_a_pixels[idx + width][2]
                            grad_y += (lum_a_down - lum_a)

                block_pixels = max(1, grid_size * grid_size)
                avg_diff = diff_sum / block_pixels

                if avg_diff > 5.0:
                    if abs(grad_x) + abs(grad_y) < 0.1:
                        vx = 0.0
                        vy = min(15.0, avg_diff * 0.1)
                    else:
                        denom = max(0.1, grad_x * grad_x + grad_y * grad_y)
                        vx = -(avg_diff * grad_x) / denom
                        vy = -(avg_diff * grad_y) / denom

                    # Clamp velocity
                    vx = max(-20.0, min(20.0, vx))
                    vy = max(-20.0, min(20.0, vy))

                    vel = math.sqrt(vx * vx + vy * vy)
                    total_vx += vx
                    total_vy += vy
                    total_energy += vel
                    active_blocks += 1

                    vectors.append({
                        "x": start_x + grid_size // 2,
                        "y": start_y + grid_size // 2,
                        "vx": round(vx, 3),
                        "vy": round(vy, 3),
                        "velocity": round(vel, 3),
                    })

        avg_vel = (total_energy / max(1, active_blocks)) if active_blocks > 0 else 0.0
        angle = (math.degrees(math.atan2(total_vy, total_vx)) + 360.0) % 360.0 if active_blocks > 0 else 0.0

        return {
            "averageVelocity": round(avg_vel, 3),
            "dominantDirectionDeg": round(angle, 1),
            "motionEnergy": round(total_energy, 3),
            "activeMotionBlocks": active_blocks,
            "vectors": vectors[:50],  # Limit vector array size
            "hasSignificantMotion": avg_vel > 0.5,
        }
