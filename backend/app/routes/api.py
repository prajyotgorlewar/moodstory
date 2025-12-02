from app.services.gemini_api import generate_story
from app.services.lstm_model import generate_words
from app.services.mood_detector import fusion_mood_detect
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import traceback

router = APIRouter()

@router.post("/generate-story")
async def generate_story_endpoint(    
    image: UploadFile = File(...),
    audio: UploadFile = File(...),
    userId: str = Form(...),
    genre: str = Form("any")):
    try:
        # Save files
        img_path = f"uploads/{image.filename}"
        audio_path = f"uploads/{audio.filename}"
        
        with open(img_path, "wb") as f:
            f.write(await image.read())
        
        with open(audio_path, "wb") as f:
            f.write(await audio.read())

        # Dummy steps
        mood, amood, imood = fusion_mood_detect(img_path, audio_path)
        words = generate_words(mood)
        story = generate_story(mood, words)
        print(f"Generated audio at: {audio_path}")
        story_lines = story.split("\n", 1)
        title = story_lines[0].strip() if len(story_lines) > 0 else ""
        body = story_lines[1].strip() if len(story_lines) > 1 else ""

        # Check if Gemini API failed
        if "Gemini API error" in title:
            return {"status": "false", "message": "Gemini API failed to generate story"}

        # ✅ Success
        return {
            "status": "true",
            "mood": mood,
            "audioMood": amood,
            "imageMood": imood,
            "words": words,
            "title": title,
            "body": body,
            "userId": userId
        }

    except Exception as e:
        print("Error generating story:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
