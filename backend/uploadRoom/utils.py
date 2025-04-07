import requests
import time
import base64
import re
spotify_token = None
token_expires_at = 0


def clean_song_name(song_name: str) -> str:
    # Remove file extensions like .mp3, .mp4, .wav, etc.
    song_name = re.sub(r"\.\w{2,4}$", "", song_name)

    # Remove text inside parentheses, brackets, and curly braces
    song_name = re.sub(r"\(.*?\)|\[.*?\]|\{.*?\}", "", song_name)

    # Remove common unwanted words
    unwanted_words = ["official video", "official audio", "lyrics", "remix", "live", "HD", "4K"]
    pattern = r"\b(?:{})\b".format("|".join(unwanted_words))
    song_name = re.sub(pattern, "", song_name, flags=re.IGNORECASE)

    # Replace multiple spaces with a single space and strip leading/trailing spaces
    song_name = re.sub(r"\s+", " ", song_name).strip()

    return song_name



def get_spotify_token():
    """Fetches a new token if expired, otherwise returns the existing one."""
    global spotify_token, token_expires_at
    
    current_time = time.time()

    # If token is still valid, return it
    if spotify_token and current_time < token_expires_at:
        return spotify_token

    # Request a new token
    credentials = f"{""}:{""}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}

    response = requests.post(url, headers=headers, data=data)
    token_data = response.json()

    # Store the new token and its expiration time
    spotify_token = token_data.get("access_token")
    token_expires_at = current_time + token_data.get("expires_in")  # Usually 3600 seconds

    return spotify_token


def fetch_song_details(song_name):
    token=get_spotify_token()
    song_name=clean_song_name(song_name)
    url = f"https://api.spotify.com/v1/search?q={song_name}&type=track&limit=1"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    song_data = response.json()

    if song_data.get("tracks") and song_data["tracks"]["items"]:
        song = song_data["tracks"]["items"][0]
        song_info = {
            "name": song["name"],
            "artist": song["artists"][0]["name"],
            "cover": song["album"]["images"][0]["url"]
        }
        return song_info
    return None
