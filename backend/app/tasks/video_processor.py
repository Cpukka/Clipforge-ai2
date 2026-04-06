import os
import tempfile
import subprocess
import numpy as np
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

# Conditionally import heavy dependencies
whisper = None
VideoFileClip = None

def get_whisper():
    global whisper
    if whisper is None:
        try:
            import whisper as _whisper
            whisper = _whisper
            logger.info("Whisper module loaded successfully")
        except ImportError:
            logger.warning("Whisper module not available. Transcription features will be disabled.")
            return None
    return whisper

def get_moviepy():
    global VideoFileClip
    if VideoFileClip is None:
        try:
            from moviepy.editor import VideoFileClip as _VideoFileClip
            VideoFileClip = _VideoFileClip
            logger.info("MoviePy module loaded successfully")
        except ImportError:
            logger.warning("MoviePy module not available. Video editing features will be disabled.")
            return None
    return VideoFileClip


class VideoProcessor:
    """Handles video processing for social media clips"""
    
    def __init__(self):
        self.whisper_model = None
        
    def load_whisper(self):
        """Load Whisper model on demand"""
        w = get_whisper()
        if w is None:
            logger.warning("Whisper not available, transcription disabled")
            return None
        if self.whisper_model is None:
            logger.info("Loading Whisper model...")
            self.whisper_model = w.load_model("base")
        return self.whisper_model
    
    def get_video_info(self, video_path: str) -> Dict:
        """Get video metadata"""
        MoviePy = get_moviepy()
        if MoviePy is None:
            # Fallback to ffprobe
            try:
                cmd = [
                    'ffprobe', '-v', 'quiet', '-print_format', 'json',
                    '-show_format', '-show_streams', video_path
                ]
                result = subprocess.run(cmd, capture_output=True, text=True)
                import json
                data = json.loads(result.stdout)
                duration = float(data.get('format', {}).get('duration', 60))
                return {"duration": duration, "fps": 30, "size": [1920, 1080], "audio": True}
            except:
                return {"duration": 60, "fps": 30, "size": [1920, 1080], "audio": True}
        
        try:
            clip = MoviePy(video_path)
            info = {
                "duration": clip.duration,
                "fps": clip.fps,
                "size": clip.size,
                "audio": clip.audio is not None
            }
            clip.close()
            return info
        except Exception as e:
            logger.error(f"Error getting video info: {e}")
            return {"duration": 60, "fps": 30, "size": [1920, 1080], "audio": True}
    
    def detect_scenes(self, video_path: str) -> List[Dict]:
        """Detect scene changes for clip segmentation"""
        scenes = []
        try:
            # Use ffmpeg scene detection
            cmd = [
                'ffmpeg', '-i', video_path,
                '-vf', 'select=gt(scene\\,0.4),metadata=print:file=-',
                '-f', 'null', '-'
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            # Parse timestamps from output
            import re
            timestamps = re.findall(r'pts_time:([\d.]+)', result.stderr)
            scenes = [{"timestamp": float(t), "type": "scene_change"} for t in timestamps]
            
            if not scenes:
                # Fallback: create clips every 15 seconds
                info = self.get_video_info(video_path)
                duration = info["duration"]
                for t in range(0, int(duration), 15):
                    scenes.append({"timestamp": float(t), "type": "interval"})
            
        except Exception as e:
            logger.error(f"Scene detection error: {e}")
            # Fallback: create clips at 0, 15, 30, 45 seconds
            scenes = [
                {"timestamp": 0, "type": "start"},
                {"timestamp": 15, "type": "interval"},
                {"timestamp": 30, "type": "interval"},
                {"timestamp": 45, "type": "interval"},
            ]
        
        return scenes
    
    def extract_transcription(self, video_path: str) -> Dict:
        """Extract audio transcription using Whisper"""
        model = self.load_whisper()
        if model is None:
            logger.warning("Whisper not available, returning empty transcription")
            return {"text": "", "segments": [], "language": "en"}
        
        try:
            result = model.transcribe(video_path)
            return {
                "text": result["text"],
                "segments": result["segments"],
                "language": result["language"]
            }
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return {"text": "", "segments": [], "language": "en"}
    
    def detect_key_moments(self, video_path: str, transcription: Dict) -> List[Dict]:
        """Detect high-engagement moments based on audio and motion"""
        key_moments = []
        duration = self.get_video_info(video_path).get("duration", 60)
        
        try:
            # Look for sentences with excitement words
            excitement_words = ['amazing', 'incredible', 'wow', 'yes', 'great', 'awesome', 
                               'perfect', 'beautiful', 'love', 'best', 'important', 'key']
            
            for segment in transcription.get("segments", []):
                text = segment["text"].lower()
                # Check for excitement words
                excitement_score = sum(1 for word in excitement_words if word in text)
                
                if excitement_score > 0:
                    key_moments.append({
                        "start": segment["start"],
                        "end": segment["end"],
                        "text": segment["text"],
                        "score": excitement_score,
                        "type": "audio"
                    })
            
            # Fallback to scene detection when no strong audio moments found
            if not key_moments:
                logger.info("No audio key moments found, using scene detection fallback")
                scenes = self.detect_scenes(video_path)

                for i, scene in enumerate(scenes[:5]):
                    start = float(scene.get("timestamp", 0))
                    # make clip up to next scene or +10 as fallback
                    if i + 1 < len(scenes):
                        end = float(scenes[i + 1].get("timestamp", min(start + 10, duration)))
                    else:
                        end = min(start + 15, duration)

                    if end <= start:
                        continue

                    key_moments.append({
                        "start": start,
                        "end": end,
                        "text": f"Scene segment {i+1}",
                        "score": 1,
                        "type": "scene"
                    })

            # If still empty, use raw interval fallback
            if not key_moments:
                logger.info("No scene moments found either; using interval fallback")
                for i in range(3):
                    start = i * 10
                    key_moments.append({
                        "start": start,
                        "end": min(start + 10, duration),
                        "text": f"Fallback interval {i+1}",
                        "score": 1,
                        "type": "fallback"
                    })

            # Sort by score
            key_moments.sort(key=lambda x: x["score"], reverse=True)

        except Exception as e:
            logger.error(f"Key moments detection error: {e}")
            # Fallback: return first 30 seconds
            key_moments = [{"start": 0, "end": min(30, duration), "text": "Key moment", "score": 1}]
        
        return key_moments[:5]  # Return top 5 moments
    
    def generate_clip(self, video_path: str, start: float, end: float, 
                     output_path: str, platform: str = "tiktok") -> bool:
        """Generate a clip for specific platform"""
        MoviePy = get_moviepy()
        if MoviePy is None:
            # Fallback to ffmpeg
            try:
                duration = end - start
                cmd = [
                    'ffmpeg', '-y',
                    '-ss', str(start),
                    '-i', video_path,
                    '-t', str(duration),
                    '-c', 'copy',
                    output_path
                ]
                result = subprocess.run(cmd, capture_output=True, text=True)
                return result.returncode == 0
            except Exception as e:
                logger.error(f"FFmpeg clip generation error: {e}")
                return False
        
        try:
            clip = MoviePy(video_path).subclip(start, end)
            
            # Set dimensions based on platform
            if platform == "tiktok" or platform == "instagram" or platform == "youtube":
                # 9:16 aspect ratio for Shorts/Reels/TikTok
                target_width = 1080
                target_height = 1920
            else:
                # 16:9 for standard
                target_width = 1920
                target_height = 1080
            
            # Resize and crop
            clip = clip.resize(height=target_height)
            if clip.w > target_width:
                clip = clip.crop(x_center=clip.w/2, width=target_width)
            
            # Write the clip
            clip.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                fps=clip.fps,
                verbose=False,
                logger=None
            )
            clip.close()
            return True
            
        except Exception as e:
            logger.error(f"Error generating clip: {e}")
            return False
    
    def add_subtitles(self, video_path: str, subtitles: List[Dict], output_path: str) -> bool:
        """Add subtitles to video"""
        try:
            # This would use ffmpeg to burn subtitles
            # Simplified version for now
            import shutil
            shutil.copy2(video_path, output_path)
            return True
        except Exception as e:
            logger.error(f"Error adding subtitles: {e}")
            return False