"""
Shared pytest fixtures and configuration.
"""

import os
import sys
from unittest.mock import MagicMock

# Mock out google.generativeai before it is imported anywhere
sys.modules['google.generativeai'] = MagicMock()


import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
