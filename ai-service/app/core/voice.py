import os
from openai import OpenAI
from typing import Dict, Any, Optional
from .llm import get_llm, LLMConfig
from langchain_core.messages import SystemMessage, HumanMessage
from loguru import logger

class VoiceService:
    def __init__(self):
        self.openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def transcribe(self, audio_file_path: str, language: Optional[str] = None) -> str:
        """
        Transcribes audio using OpenAI Whisper.
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.openai.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    language=language
                )
                return transcript.text
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise e

    async def classify_and_structure(self, transcript: str) -> Dict[str, Any]:
        """
        Classifies node type, domain, and structures the transcript into a formal node.
        """
        llm = get_llm(LLMConfig(model_name="gpt-4o", temperature=0.0))
        
        prompt = f"""
        Transcript: {transcript}

        Analyze the transcript above and extract:
        1. title: A concise, formal title (max 10 words).
        2. content: A structured, academic-style expansion of the transcript (Markdown).
        3. node_type: One of [claim, question, hypothesis, essay, summary, data, project].
        4. domain: The primary intellectual domain (e.g., Neuroscience, Economics, AI Safety).
        5. tags: 3-5 relevant hashtags.

        Return strictly as JSON.
        """
        
        response = llm.invoke([
            SystemMessage(content="You are an expert intellectual curator."),
            HumanMessage(content=prompt)
        ])
        
        # Simple JSON extraction
        import json
        content = response.content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)

voice_service = VoiceService()
