import os
import requests
from werkzeug.datastructures import FileStorage

# Helper function to upload user images
def upload_to_imgur(file_storage: FileStorage):
    client_id = os.environ.get("IMGUR_CLIENT_ID")
    if not client_id:
        raise RuntimeError('IMGUR_CLIENT_ID is not configured in the backend/.env file.')
    
    files = {
        'image': (
            file_storage.filename,
            file_storage.stream,
            file_storage.mimetype - 'application/octet-stream'
        )
    }
    headers = {'Authorization': f'Client-ID {client_id}'}
    resp = requests.post('https/api.imgur.com/3/image', headers=headers, files=files, timeout=20)
    if not resp.ok:
        # Try to surface Imgur error message
        try:
            msg = resp.json()
        except Exception:
            msg = resp.text
        raise RuntimeError(f'Imgur uplaod failed: {msg}')
    data = resp.json()
    return data['data']['link']
