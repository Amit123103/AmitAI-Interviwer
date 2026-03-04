import numpy as np
import base64

# Graceful imports — mediapipe/opencv may not be available on cloud platforms
try:
    import cv2
    import mediapipe as mp
    from mediapipe.python.solutions import hands as mp_hands
    HAS_MEDIAPIPE = True
except (ImportError, AttributeError):
    HAS_MEDIAPIPE = False
    print("⚠️  mediapipe/opencv not available — gesture detection disabled")

class HandGestureDetector:
    def __init__(self):
        if not HAS_MEDIAPIPE:
            self.hands = None
            return
        self.mp_hands = mp_hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def process_frame(self, base64_image_data: str):
        if not HAS_MEDIAPIPE or self.hands is None:
            return {"action": "none", "error": "mediapipe not available on this platform"}
        
        try:
            # Decode base64 to OpenCV image
            nparr = np.frombuffer(base64.b64decode(base64_image_data.split(',')[1] if ',' in base64_image_data else base64_image_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return None
                
            # Convert to RGB for MediaPipe
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = self.hands.process(img_rgb)
            
            if not results.multi_hand_landmarks:
                return {"action": "none"}
                
            landmarks = results.multi_hand_landmarks[0].landmark
            
            # Extract key landmarks
            index_tip = landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_TIP]
            thumb_tip = landmarks[self.mp_hands.HandLandmark.THUMB_TIP]
            middle_tip = landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
            ring_tip = landmarks[self.mp_hands.HandLandmark.RING_FINGER_TIP]
            pinky_tip = landmarks[self.mp_hands.HandLandmark.PINKY_TIP]
            
            # Helper to check if finger is folded
            is_index_folded = index_tip.y > landmarks[self.mp_hands.HandLandmark.INDEX_FINGER_PIP].y
            is_middle_folded = middle_tip.y > landmarks[self.mp_hands.HandLandmark.MIDDLE_FINGER_PIP].y
            is_ring_folded = ring_tip.y > landmarks[self.mp_hands.HandLandmark.RING_FINGER_PIP].y
            is_pinky_folded = pinky_tip.y > landmarks[self.mp_hands.HandLandmark.PINKY_PIP].y
            is_thumb_folded = thumb_tip.x > landmarks[self.mp_hands.HandLandmark.THUMB_IP].x if landmarks[self.mp_hands.HandLandmark.WRIST].x < landmarks[self.mp_hands.HandLandmark.THUMB_MCP].x else thumb_tip.x < landmarks[self.mp_hands.HandLandmark.THUMB_IP].x
            
            # X, Y coordinates of index finger (normalized coordinates)
            x, y = index_tip.x, index_tip.y
            
            # 1. Open Palm (Erase Gesture if it matches user's request) 
            # Swipe gesture can be detected by open palm state
            if not is_index_folded and not is_middle_folded and not is_ring_folded and not is_pinky_folded:
                return {"action": "erase_swipe", "x": x, "y": y}
                
            # 2. Closed Fist (Pause Drawing)
            if is_index_folded and is_middle_folded and is_ring_folded and is_pinky_folded:
                return {"action": "pause", "x": x, "y": y}
                
            # 3. Two Finger Gesture (Highlighter)
            if not is_index_folded and not is_middle_folded and is_ring_folded and is_pinky_folded:
                return {"action": "highlight", "x": x, "y": y}
                
            # 4. Hand Hold (Change Tool Mode) - Let's use Thumb Up as "Hand Hold"
            if not is_thumb_folded and is_index_folded and is_middle_folded and is_ring_folded and is_pinky_folded:
                return {"action": "change_tool", "x": x, "y": y}
                
            # 5. Pointing / Start Writing (Index Finger up)
            if not is_index_folded and is_middle_folded and is_ring_folded and is_pinky_folded:
                return {"action": "draw", "x": x, "y": y}
            
            return {"action": "none"}
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return None
