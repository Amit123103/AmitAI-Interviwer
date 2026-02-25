import time
import psutil
from typing import Dict, Any

class SystemMonitor:
    """Monitoring utility for tracking service health and performance."""
    
    def __init__(self):
        self.start_time = time.time()
        self.requests_count = 0

    def get_stats(self) -> Dict[str, Any]:
        """Returns current system resource usage stats."""
        return {
            "uptime": time.time() - self.start_time,
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "process_memory_mb": psutil.Process().memory_info().rss / 1024 / 1024,
            "total_requests": self.requests_count
        }

    def record_request(self):
        self.requests_count += 1

monitor = SystemMonitor()
