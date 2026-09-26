import os
import sys
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
sys.modules['google._upb._message'] = None

from config import get_settings
import google.generativeai as genai

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
