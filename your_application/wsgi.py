import os
import sys


CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
SERVER_DIR = os.path.join(PROJECT_ROOT, "server")

if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from app import app as application  # noqa: E402

app = application
