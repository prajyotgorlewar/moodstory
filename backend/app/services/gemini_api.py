import os
import random
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
# print("Loaded GEMINI_API_KEY:", API_KEY)

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set or empty.")

genai.configure(api_key=API_KEY)

_INVALID_TOKENS = {"unk", "<unk>", "pad", "<pad>", "none", ""}
_FALLBACK_WORDS = {
    "angry": ["focus", "path", "choice", "calm", "resolve"],
    "disgust": ["change", "renewal", "growth", "fresh", "start"],
    "fear": ["courage", "light", "hope", "friend", "bravery"],
    "happy": ["sun", "music", "laughter", "joy", "breeze"],
    "neutral": ["moment", "day", "quiet", "place", "time"],
    "sad": ["rain", "warmth", "letter", "memory", "hug"],
    "surprise": ["twist", "smile", "chance", "spark", "luck"],
}
_DEFAULT_FALLBACK = ["light", "kindness", "calm", "friend", "moment"]

def _clean_words(raw, max_tokens: int = 10):
    """Cleans up LSTM output (list or str), removes UNK-like and non-word tokens."""
    if isinstance(raw, list):
        raw = " ".join(map(str, raw))
    raw = str(raw or "")
    parts = re.split(r"[\s,|/;]+", raw.strip())
    cleaned = []
    for token in parts:
        token = re.sub(r"^[^\w]+|[^\w]+$", "", token).lower()
        if token and token not in _INVALID_TOKENS and re.match(r"^[a-zA-Z]+$", token):
            cleaned.append(token)
        if len(cleaned) >= max_tokens:
            break
    return cleaned

def generate_story(mood: str, words=None):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        mood = (mood or "neutral").strip().lower()
        genres = {
            "angry": ["motivational comeback", "redemption arc", "reflective journey"],
            "disgust": ["renewal story", "personal transformation", "fresh start"],
            "fear": ["courageous adventure", "hopeful suspense", "inner triumph"],
            "happy": ["wholesome slice of life", "romantic comedy", "light adventure"],
            "neutral": ["simple reflection", "ordinary day", "gentle vignette"],
            "sad": ["uplifting drama", "hopeful reflection", "quiet reunion"],
            "surprise": ["unexpected joy", "serendipitous moment", "delightful twist"],
        }
        chosen_genre = random.choice(genres.get(mood, ["feel-good short fiction"]))

        cleaned = _clean_words(words)
        if not cleaned:
            cleaned = _FALLBACK_WORDS.get(mood, _DEFAULT_FALLBACK)

        prompt = f"""
                        Write a short, emotionally engaging moral story meant to gently uplift the reader.
                        Mood: {mood}
                        Tone/style: {chosen_genre}
                        Try to use these words naturally (if they fit): {', '.join(cleaned)}

                            Rules:
                            - Begin with a creative standalone title (no quotes or labels).
                            - 300–400 words, conversational and vivid.
                            - No Markdown, emojis, symbols, or lists.
                            - Avoid complex or poetic language.
                            - End with a warm or hopeful message.
                            Output only the title and story.
                            """

        response = model.generate_content(prompt)
        return (response.text or "").strip()

    except Exception as e:
        return f"Gemini API error: {str(e)}"
