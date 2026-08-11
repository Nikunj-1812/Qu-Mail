import logging
import json
from datetime import datetime

logger = logging.getLogger("crypto_trace")

class TraceLogger:
    """
    TraceLogger logs step-by-step cryptographic operation events.
    """
    @staticmethod
    def log_event(action: str, details: dict):
        timestamp = datetime.utcnow().isoformat()
        trace_entry = {
            "timestamp": timestamp,
            "action": action,
            "details": details
        }
        logger.info(json.dumps(trace_entry))
        return trace_entry
