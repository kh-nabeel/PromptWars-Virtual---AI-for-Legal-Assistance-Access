import asyncio
from services.summarizer import summarize_document
from config import get_settings
import google.generativeai as genai

print("API Key:", get_settings().gemini_api_key)

try:
    res = summarize_document("session_123", "This is a test NDA document.", "NDA")
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
