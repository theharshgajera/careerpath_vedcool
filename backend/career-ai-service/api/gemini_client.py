import os
import logging
import google.generativeai as genai
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API configuration parameters
MAX_RETRIES = 3
API_TIMEOUT = 30  # Request timeout in seconds

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s: %(message)s")

def setup_gemini_api():
    """Configure Gemini API with validation."""
    try:
        api_key = os.getenv('GOOGLE_API_KEY')  # Ensure this key exists in your .env file
        if not api_key:
            raise ValueError("Missing GOOGLE_API_KEY in environment variables.")

        genai.configure(api_key=api_key)
        logging.info("Gemini API configured successfully")
        
        # List available models
        available_models = [model.name for model in genai.list_models()]
        logging.info(f"Available models: {available_models}")

        # Ensure the selected model exists
        selected_model = "models/gemini-2.0-flash"  # Change this if needed
        if selected_model not in available_models:
            raise ValueError(f"Model '{selected_model}' is not available. Check your API key and permissions.")
        
    except Exception as e:
        logging.error(f"API configuration failed: {str(e)}")
        raise

@lru_cache(maxsize=512)
def generate_content(prompt, max_tokens=2048, temperature=0.7):
    """Generate content using Gemini with error handling."""
    selected_model = "models/gemini-2.0-flash"  # Change this if needed

    for attempt in range(MAX_RETRIES):
        try:
            model = genai.GenerativeModel(selected_model)
            response = model.generate_content(
                prompt,
                generation_config={
                    'temperature': temperature,
                    'max_output_tokens': max_tokens,
                    'top_p': 0.9
                },
                request_options={'timeout': API_TIMEOUT}
            )
            return response.text if response.text else None
        except Exception as e:
            logging.warning(f"API Error (attempt {attempt+1}): {str(e)}")
            if attempt == MAX_RETRIES - 1:
                raise
    return None

# Initialize API
try:
    setup_gemini_api()
except Exception as e:
    logging.error(f"Failed to initialize Gemini API: {str(e)}")

# import os
# import logging
# import google.generativeai as genai
# from functools import lru_cache

# # API configuration parameters
# MAX_RETRIES = 3
# RETRY_DELAY = 1.5  # Seconds between retries
# API_TIMEOUT = 30   # Seconds
# RATE_LIMIT_DELAY = 2  # Seconds between requests

# def setup_gemini_api():
#     """Configure Gemini API with validation."""
#     try:
#         api_key = os.getenv('GEMINI_API_KEY')
#         if not api_key:
#             raise ValueError("Missing GEMINI_API_KEY in environment variables")

#         genai.configure(api_key=api_key)
#         logging.info("Gemini API configured successfully")
#     except Exception as e:
#         logging.error(f"API configuration failed: {str(e)}")
#         raise

# @lru_cache(maxsize=512)
# def generate_content(prompt, max_tokens=2048, temperature=0.7):
#     """Generic content generation function with retries."""
#     for attempt in range(MAX_RETRIES):
#         try:
#             model = genai.GenerativeModel('gemini-pro')
#             response = model.generate_content(
#                 prompt,
#                 generation_config={
#                     'temperature': temperature,
#                     'max_output_tokens': max_tokens,
#                     'top_p': 0.9
#                 },
#                 request_options={'timeout': API_TIMEOUT}
#             )
#             return response.text if response.text else None
#         except Exception as e:
#             logging.warning(f"API Error (attempt {attempt+1}): {str(e)}")
#             if attempt == MAX_RETRIES - 1:
#                 raise
#     return None