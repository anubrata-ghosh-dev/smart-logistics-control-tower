"""
allocation.py — Priority engine.

Maps cargo type to a business-priority level.
Medical supplies and vaccines have the highest urgency;
generic consumer goods the lowest.
"""

# Mapping cargo keyword → priority tier
PRIORITY_MAP = {
    "medical":      "high",
    "vaccine":      "high",
    "pharmaceutical": "high",
    "emergency":    "high",
    "food":         "medium",
    "grain":        "medium",
    "livestock":    "medium",
    "perishable":   "medium",
    "fuel":         "medium",
    "electronics":  "low",
    "textile":      "low",
    "automobile":   "low",
    "machinery":    "low",
    "general":      "low",
}


def assign_priority(cargo_type: str) -> str:
    """
    Return 'high', 'medium', or 'low' based on cargo type keyword match.

    Matching is case-insensitive and substring-based so
    "Medical Supplies" correctly maps to 'high'.
    """
    normalized = cargo_type.lower()
    for keyword, priority in PRIORITY_MAP.items():
        if keyword in normalized:
            return priority
    return "low"  # Default for unknown cargo types
