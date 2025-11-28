import os
import edge_tts

async def generate_voice(script: str, index: int = 0):
    if not script or script.strip() == "":
        raise ValueError("Script cannot be empty or whitespace.")

    # ✅ Path to the frontend/public folder (adjust if your folder name differs)
    frontend_public_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../frontend/public")
    )

    # Create the folder if it doesn't exist
    os.makedirs(frontend_public_path, exist_ok=True)

    # Save audio file in frontend/public
    output_path = os.path.join(frontend_public_path, f"audio_{index}.mp3")
    voice = "hi-IN-SwaraNeural"

    print(f"🎙 Generating voice for script: '{script[:50]}...'")
    print(f"💾 Saving file to: {output_path}")

    try:
        tts = edge_tts.Communicate(script, voice)
        await tts.save(output_path)
        print(f"✅ Audio saved at: {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Error generating voice: {e}")
        raise
