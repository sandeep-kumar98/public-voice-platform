# ✅ Purpose: Analyze sentiment of issue text
# Determines if issue is urgent, neutral, or positive

from textblob import TextBlob
import re

# Keywords that indicate urgency
URGENT_KEYWORDS = [
    "urgent", "emergency", "dangerous", "critical", "severe",
    "accident", "death", "dying", "fire", "flood", "attack",
    "violence", "crime", "robbery", "murder", "rape", "abuse",
    "collapse", "broken", "destroyed", "contaminated", "toxic",
    "injured", "bleeding", "hospital", "police", "help"
]

# Keywords that indicate fake/spam content
SPAM_KEYWORDS = [
    "click here", "free money", "win prize", "lottery",
    "buy now", "discount", "offer", "deal", "cheap",
    "make money", "earn cash", "work from home"
]

def analyze_sentiment(title: str, description: str) -> dict:
    """
    Analyze sentiment of issue text
    Returns: sentiment label + score + is_urgent flag
    """
    # Combine title and description
    full_text = f"{title} {description}".lower()

    # Check for urgent keywords
    urgent_found = [
        word for word in URGENT_KEYWORDS
        if word in full_text
    ]
    is_urgent = len(urgent_found) > 0

    # Use TextBlob for sentiment polarity
    # polarity: -1 (negative) to +1 (positive)
    blob = TextBlob(full_text)
    polarity = blob.sentiment.polarity

    # Determine sentiment label
    if is_urgent or polarity < -0.2:
        sentiment = "urgent"
    elif polarity > 0.2:
        sentiment = "positive"
    else:
        sentiment = "neutral"

    return {
        "sentiment": sentiment,
        "polarity": round(polarity, 2),
        "is_urgent": is_urgent,
        "urgent_keywords_found": urgent_found,
        "subjectivity": round(blob.sentiment.subjectivity, 2)
    }


def detect_fake_content(title: str, description: str) -> dict:
    """
    Detect if content looks fake or spammy
    Returns: is_fake flag + reason
    """
    full_text = f"{title} {description}".lower()

    # Check for spam keywords
    spam_found = [
        word for word in SPAM_KEYWORDS
        if word in full_text
    ]

    # Check for very short description (likely fake)
    is_too_short = len(description.strip()) < 20

    # Check for repeated characters (like "aaaaaaa")
    has_repeated_chars = bool(re.search(r'(.)\1{4,}', full_text))

    # Check for all caps (shouting/spam)
    words = title.split()
    caps_words = [w for w in words if w.isupper() and len(w) > 2]
    is_all_caps = len(caps_words) > len(words) * 0.5

    # Calculate fake score
    fake_score = 0
    reasons = []

    if spam_found:
        fake_score += 40
        reasons.append(f"Spam keywords: {spam_found}")

    if is_too_short:
        fake_score += 20
        reasons.append("Description too short")

    if has_repeated_chars:
        fake_score += 20
        reasons.append("Repeated characters detected")

    if is_all_caps:
        fake_score += 20
        reasons.append("Excessive caps detected")

    is_fake = fake_score >= 40

    return {
        "is_fake": is_fake,
        "fake_score": fake_score,
        "reasons": reasons
    }