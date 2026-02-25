import cv2
import mediapipe as mp
import numpy as np

face_mesh = None
VISION_AVAILABLE = True
INITIALIZED = False

def initialize_vision():
    global face_mesh, VISION_AVAILABLE, INITIALIZED
    if INITIALIZED: return
    
    print("Initializing Vision Module...")
    try:
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        VISION_AVAILABLE = True
    except Exception as e:
        print(f"Warning: MediaPipe Vision not available: {e}")
        VISION_AVAILABLE = False
        face_mesh = None
    finally:
        INITIALIZED = True

def analyze_frame_content(image_content: bytes):
    """
    Analyzes an image frame for face presence, attention, and basic emotion cues.
    Returns a dictionary of analysis results.
    """
    if not INITIALIZED:
        initialize_vision()

    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return {"error": "Could not decode image"}

        if not VISION_AVAILABLE:
            return {
                 "face_detected": False,
                 "looking_away": False,
                 "emotion": "Unknown",
                 "lighting": "Unknown",
                 "engagement_score": 0,
                 "error": "Vision module unavailable"
            }

        # Convert to RGB for MediaPipe
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return {
                "face_detected": False,
                "engagement_score": 0,
                "emotion": "Unknown",
                "looking_away": True
            }

        face_landmarks = results.multi_face_landmarks[0]
        h, w, _ = image.shape
        
        # 1. Improved Attention & Eye Gaze Tracking
        nose_tip = face_landmarks.landmark[1]
        left_eye_inner = face_landmarks.landmark[133]
        right_eye_inner = face_landmarks.landmark[362]
        left_ear = face_landmarks.landmark[234]
        right_ear = face_landmarks.landmark[454]
        
        # Horizontal Center
        face_center_x = (left_ear.x + right_ear.x) / 2
        nose_offset_x = nose_tip.x - face_center_x
        
        # Looking Away heuristic (Improved)
        looking_away = abs(nose_offset_x) > 0.06
        
        # 2. Posture Analysis (Head Tilt & Slouching)
        face_top = face_landmarks.landmark[10] # Forehead
        face_bottom = face_landmarks.landmark[152] # Chin
        face_center_y = (face_top.y + face_bottom.y) / 2
        nose_offset_y = nose_tip.y - face_center_y
        
        posture = "Neutral"
        if nose_offset_y < -0.05:
            posture = "Looking Up"
        elif nose_offset_y > 0.05:
            posture = "Slouching / Looking Down"
            
        # Angle between eyes (Head tilt)
        dy = right_eye_inner.y - left_eye_inner.y
        dx = right_eye_inner.x - left_eye_inner.x
        angle = np.degrees(np.arctan2(dy, dx))
        
        if abs(angle) > 15:
            posture = "Head Tilted"

        # 3. Emotion Heuristics (Smile Detection)
        lip_left = face_landmarks.landmark[61]
        lip_right = face_landmarks.landmark[291]
        lip_top = face_landmarks.landmark[0]
        lip_bottom = face_landmarks.landmark[17]
        
        mouth_width = np.linalg.norm(np.array([lip_left.x, lip_left.y]) - np.array([lip_right.x, lip_right.y]))
        mouth_height = np.linalg.norm(np.array([lip_top.x, lip_top.y]) - np.array([lip_bottom.x, lip_bottom.y]))
        mouth_ratio = mouth_width / (mouth_height + 1e-6)
        
        emotion = "Neutral"
        if mouth_ratio > 3.2: 
            emotion = "Smiling"
        elif mouth_ratio < 1.1:
            emotion = "Open Mouth"

        # 4. Composite Engagement Score
        engagement_score = 100
        if looking_away: engagement_score -= 40
        if posture != "Neutral": engagement_score -= 20
        if emotion == "Neutral": engagement_score -= 5
        engagement_score = max(0, engagement_score)

        # 5. Lighting Check
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        lighting_status = "Good"
        if brightness < 40:
            lighting_status = "Too Dark"
        elif brightness > 220:
            lighting_status = "Too Bright"

        return {
            "face_detected": True,
            "looking_away": looking_away,
            "emotion": emotion,
            "posture": posture,
            "lighting": lighting_status,
            "engagement_score": engagement_score,
            "head_angle": round(float(angle), 2)
        }

    except Exception as e:
        print(f"Error in vision analysis: {e}")
        return {"error": str(e)}
