# Scoring Framework

Use two separate scores. Do not compress them into one number.

Round final scores to the nearest 5. Treat them as explainable decision aids, not false precision.

## 1) Jerk Potential Score

Use this score to estimate the probability that the company is entering a true jerk-growth regime.

Rate each ingredient as:

- **0** = absent, weakening, contradicted, or unproven
- **1** = partial, mixed, or early evidence
- **2** = strong, repeated, and source-backed evidence

Apply these weights:

| Ingredient | Weight |
| --- | ---: |
| Forward growth acceleration vs prior trend | 20 |
| Quality of growth vs one-time boosts | 15 |
| Estimate or guidance revision velocity | 20 |
| Multiple growth engines stacking | 15 |
| Visibility or duration extension | 10 |
| Margin, cash-flow, or unit-economics reinforcement | 10 |
| Sector-specific leading indicators | 10 |

Compute:

`weighted score = sum(weight × rating / 2)`

Interpretation:

- **80-100** = strong evidence of a true jerk setup
- **60-75** = credible emerging setup, still incomplete
- **40-55** = acceleration exists but revision proof is weak or mixed
- **0-35** = insufficient evidence of a jerk-growth regime

## 2) Recognition / Crowding Score

Use this score to estimate how much of the story is already recognized or priced.

Rate each ingredient as 0, 1, or 2 using the same scale.

Apply these weights:

| Ingredient | Weight |
| --- | ---: |
| Post-earnings price confirmation and gap persistence | 20 |
| Multiple expansion vs own history and peers | 20 |
| Media or narrative saturation | 20 |
| Estimate dispersion collapse or consensus convergence | 20 |
| Obvious crowdedness vs still-misaligned expectations | 20 |

Compute:

`weighted score = sum(weight × rating / 2)`

Interpretation:

- **0-35** = under-recognized
- **40-60** = partially recognized
- **65-100** = obvious, crowded, or increasingly priced

## Best hunting zone

Prefer the zone where:

- Jerk Potential is high
- Recognition or Crowding is low to medium

## Score-to-label synthesis

Use the score combination as a guide, then override it when stronger contradictory evidence exists.

| Jerk Potential | Recognition / Crowding | Default label |
| --- | --- | --- |
| High | Low to medium | **True early jerk candidate** |
| Medium-high | Low to medium | **Acceleration only** unless revision evidence is clearly compounding |
| High | Medium-high | **Confirmed jerk regime** |
| Medium | Any | **Acceleration only** |
| High | High | **Crowded / late jerk** |
| Low | Medium-high or high | **Hype without business support** |

Use **Step-up only** when the setup depends mainly on one quarter, one beat-and-raise, or one event reset without duration proof.
