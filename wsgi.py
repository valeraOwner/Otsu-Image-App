import sys
path = '/home/drajev/otsu_app'
if path not in sys.path:
    sys.path.append(path)

from app import app as application