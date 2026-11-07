import sys
import os

# Add backend directory to sys.path so app.py can be imported as serverless function on Vercel
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

# Vercel looks for the WSGI/ASGI 'app' object
if __name__ == '__main__':
    app.run(port=8080)
