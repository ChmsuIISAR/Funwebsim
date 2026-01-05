
export const PHYSICS = {
  GRAVITY: 9.81, // Standard Earth gravity (m/s^2)
  FRAME_RATE: 60,
  DT: 1 / 60,
  MAX_TRAIL_LENGTH: 120, // Increased for smoother visualization at high speeds
  TRAIL_FADE_SPEED: 0.01,
  STATIC_FRICTION_MULTIPLIER: 1.2, // Static friction is typically ~20% higher than kinetic
};

export const COLORS = {
  BLOSSOM: '#ff69b4',
  BUBBLES: '#00d2ff',
  BUTTERCUP: '#32cd32',
  TRACK_ACCENT: '#334155',
  TRACK_BG: '#1e293b',
};

export const CHARACTERS = [
  {
    id: 'blossom',
    name: 'Blossom',
    color: COLORS.BLOSSOM,
    image: './assets/blossom.png',
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    color: COLORS.BUBBLES,
    image: './assets/bubbles.png',
  },
  {
    id: 'buttercup',
    name: 'Buttercup',
    color: COLORS.BUTTERCUP,
    image: './assets/buttercup.png',
  }
];

/**
 * INITIAL_VARIABLES are calibrated to achieve 300m in ~8.0s 
 * based on the solved kinematic equation for quadratic drag:
 * x(t) = (m/k) * ln(cosh(sqrt(k*F_net)/m * t))
 * With m=5kg, mu=0.1, k=0.015, F=75N -> x(8) ≈ 302m.
 */
export const INITIAL_VARIABLES: Record<string, any> = {
  force: 75,           // Applied Force in Newtons (N)
  mass: 5,             // Mass in Kilograms (kg)
  friction: 0.1,       // Kinetic friction coefficient (mu)
  airResistance: 0.015, // Air resistance coefficient (k)
  maxDistance: 300,    // Track length in Meters (m)
  timeScale: 1.0,      // Simulation time multiplier
  velocity: 0,         // Initial Velocity (m/s)
};
