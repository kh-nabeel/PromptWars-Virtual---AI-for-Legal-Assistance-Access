import os
import sys

# Prevent protobuf from loading broken C-extension on Python 3.14
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
sys.modules['google._upb._message'] = None

from config import get_settings
import google.generativeai as genai

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

print(settings.gemini_model)
model = genai.GenerativeModel(settings.gemini_model)

try:
    res = model.generate_content("hello")
    print(res.text)
except Exception as e:
    import traceback
    traceback.print_exc()
