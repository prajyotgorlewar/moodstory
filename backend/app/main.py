from app.routes.api import router
from fastapi import FastAPI,Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.responses import JSONResponse
from datetime import datetime  
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

app = FastAPI()

# Configure CORS origins (adjust as needed)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://moodstory-zeta.vercel.app",
    # You can add more origins here, e.g., your deployed frontend URLs
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # or ["*"] to allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
def health():
    return {"status": "Backend running!", "version": "v1.0"}


client = MongoClient(MONGO_URI)
db = client["moodstory"]
users_collection = db["users"]

class User(BaseModel):
    id: str
    name: str
    email: str
    # imageUrl: str | None = None

@app.post("/sync-user")
def sync_user(user: User):
    # print(MONGO_URI)
    existing_user = users_collection.find_one({"id": user.id})
    if existing_user:
        return {"message": "User already exists", "success": True}

    # ✅ Convert Pydantic model to dict before inserting
    user_data = user.dict()
    users_collection.insert_one(user_data)

    return {"message": "User inserted successfully", "success": True}


stories_collection = db["stories"]
class Story(BaseModel):
    userId: str
    mood: str
    audioMood: str | None = None
    imageMood: str | None = None
    words: list[str]
    title: str
    body: str
    genre: str | None = "any"


# ✅ API endpoint to save story

@app.post("/save-story")
def save_story(story: Story):
    try:
        story_data = story.dict()
        story_data["created_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # ✅ Insert and get the inserted ID
        result = stories_collection.insert_one(story_data)

        # ✅ Convert ObjectId to string for JSON
        story_data["_id"] = str(result.inserted_id)

        return JSONResponse(
            content={
                "message": "Story saved successfully",
                "success": True,
                "data": story_data
            },
            status_code=200
        )

    except Exception as e:
        return JSONResponse(
            content={
                "message": f"Error saving story: {str(e)}",
                "success": False
            },
            status_code=500
        )



from fastapi.responses import JSONResponse
from datetime import datetime, timedelta

@app.get("/get-user-stats/{user_id}")
def get_user_stats(user_id: str):
    try:
        stories = list(stories_collection.find({"userId": user_id}))
        for story in stories:
            story["_id"] = str(story["_id"])
        return JSONResponse({"success": True, "data": stories})
    except Exception as e:
        return JSONResponse({"success": False, "message": str(e)}, status_code=500)
