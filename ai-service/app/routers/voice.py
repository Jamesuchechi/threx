from fastapi import APIRouter, UploadFile, File, HTTPException
from ..core.voice import voice_service
import os
import uuid
from typing import Optional

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/process")
async def process_voice(
    file: UploadFile = File(...),
    language: Optional[str] = None
):
    """
    Endpoint to receive audio, transcribe it, and structure it into a node draft.
    """
    temp_path = f"temp_{uuid.uuid4()}.wav"
    try:
        # Save temp file
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # 1. Transcribe
        transcript = voice_service.transcribe(temp_path, language=language)

        # 2. Classify and Structure
        structured_data = await voice_service.classify_and_structure(transcript)

        return {
            "transcript": transcript,
            "draft": structured_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
