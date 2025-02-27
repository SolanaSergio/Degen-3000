#!/usr/bin/env python
"""
Simple HTTP server for DEGEN ROAST 3000 application
This script serves files from the project root directory
"""

import os
import sys
import subprocess
import webbrowser
from pathlib import Path
import time

def main():
    print("Starting DEGEN ROAST 3000 Server...")
    
    # Get the root directory of the project
    root_dir = Path(__file__).parent.absolute()
    
    # Check if .env file exists
    env_file = root_dir / ".env"
    if not env_file.exists():
        print("Warning: No .env file found. Creating a default one.")
        with open(env_file, "w") as f:
            f.write("HF_TOKEN=your_huggingface_token_here\n")
        print("Please edit .env file with your Hugging Face token.")

    # Check if node_modules exists, if not run npm install
    node_modules = root_dir / "node_modules"
    if not node_modules.exists():
        print("Installing dependencies...")
        subprocess.run(["npm", "install"], cwd=root_dir, shell=True)
    
    # Start the server
    try:
        print("Starting Node.js server...")
        server_process = subprocess.Popen(
            ["node", "server/server.js"], 
            cwd=root_dir,
            shell=True
        )
        
        # Give the server time to start
        time.sleep(2)
        
        # Open the browser
        server_url = "http://localhost:8000"
        print(f"Opening browser to {server_url}")
        webbrowser.open(server_url)
        
        # Keep the server running until Ctrl+C
        server_process.wait()
    except KeyboardInterrupt:
        print("Shutting down server...")
        server_process.terminate()
        server_process.wait()
    except Exception as e:
        print(f"Error: {e}")
    
    print("Server stopped.")

if __name__ == "__main__":
    main() 