#!/usr/bin/env python
"""
Simple HTTP server for DEGEN ROAST 3000 application
This script serves files from the project root directory
"""

import http.server
import socketserver
import os
import sys

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler that serves from the directory containing this script."""
    
    def translate_path(self, path):
        """Translate paths to be relative to this script's directory."""
        path = super().translate_path(path)
        rel_path = os.path.relpath(path, os.getcwd())
        return os.path.join(DIRECTORY, rel_path)
    
    def log_message(self, format, *args):
        """Override to add more info to log messages."""
        sys.stderr.write("[%s] %s - %s\n" % (
            self.log_date_time_string(),
            self.address_string(),
            format % args
        ))

def run_server():
    """Start the HTTP server."""
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Server running at http://localhost:{PORT}")
        print(f"📁 Serving from: {DIRECTORY}")
        print("💡 Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped!")

if __name__ == "__main__":
    run_server() 