from flask import Flask, request, jsonify, session
import os
import json
from functools import wraps
from google.oauth2 import id_token
from google.auth.transport import requests
import uuid
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from urllib.parse import urlparse
from dotenv import load_dotenv
from supabase import create_client
from fuzzywuzzy import fuzz

load_dotenv()


app = Flask(__name__, static_folder='dist', static_url_path='/')

# Supabase Configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuration
app.secret_key = os.environ.get('SECRET_KEY', 'dev_secret_key')
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # Get user info
        user_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        # Check if user exists
        response = supabase.table('users').select("*").eq('google_id', user_id).execute()
        user = response.data[0] if response.data else None
        
        if user is None:
            # Create new user
            new_user = {
                'id': str(uuid.uuid4()),
                'google_id': user_id,
                'email': email,
                'name': name,
                'picture': picture,
                'created_at': datetime.now().isoformat()
            }
            response = supabase.table('users').insert(new_user).execute()
            user = response.data[0]
        
        # Set session
        session['user_id'] = user['id']
        
        # Return user data
        return jsonify({
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'picture': user['picture'],
            'user_type': user.get('user_type'),
            'industry': user.get('industry'),
            'location': user.get('location'),
            'services': user.get('services'),
            'credit_rating': user.get('credit_rating'),
            'bio': user.get('bio'),
            'is_profile_complete': bool(user.get('user_type'))
        })
        
    except ValueError:
        # Invalid token
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/api/auth/user', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = supabase.table('users').select("*").eq('id', session['user_id']).execute().data[0]
    
    if user is None:
        session.pop('user_id', None)
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'picture': user['picture'],
        'user_type': user.get('user_type'),
        'industry': user.get('industry'),
        'location': user.get('location'),
        'services': user.get('services'),
        'credit_rating': user.get('credit_rating'),
        'bio': user.get('bio'),
        'is_profile_complete': bool(user.get('user_type'))
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.json
    user_id = session['user_id']
    
    # Validate data
    if 'user_type' not in data or data['user_type'] not in ['seeker', 'provider']:
        return jsonify({'error': 'Invalid user type'}), 400
    
    if 'industry' not in data or not data['industry']:
        return jsonify({'error': 'Industry is required'}), 400
    
    if 'location' not in data or not data['location']:
        return jsonify({'error': 'Location is required'}), 400
    
    # Additional validation based on user type
    if data['user_type'] == 'provider' and ('services' not in data or not data['services']):
        return jsonify({'error': 'Services are required for providers'}), 400
    
    if data['user_type'] == 'seeker' and ('credit_rating' not in data or not data['credit_rating']):
        return jsonify({'error': 'Credit rating is required for seekers'}), 400
    
    # Update user profile
    update_data = {
        'user_type': data['user_type'],
        'industry': data['industry'],
        'location': data['location'],
        'services': data.get('services', ''),
        'credit_rating': data.get('credit_rating', ''),
        'bio': data.get('bio', ''),
        'updated_at': datetime.now().isoformat()
    }
    print(user_id, 'UPDATE', data)
    response = supabase.table('users').update(update_data).eq('id', user_id).execute()
    
    if not response.data:
        return jsonify({'error': 'User not found'}), 404
    
    user = response.data[0]
    return jsonify({
        'user_type': user['user_type'],
        'industry': user['industry'],
        'location': user['location'],
        'services': user['services'],
        'credit_rating': user['credit_rating'],
        'bio': user['bio'],
        'is_profile_complete': True
    })

@app.route('/api/matches', methods=['GET'])
@login_required
def get_matches():
    user_id = session['user_id']
    
    user = supabase.table('users').select("*").eq('id', user_id).execute().data[0]
    
    if not user or not user.get('user_type'):
        return jsonify([])
    
    # Find matches based on user type
    match_type = 'provider' if user['user_type'] == 'seeker' else 'seeker'
    
    matches = supabase.table('users').select("*").eq('user_type', match_type).neq('id', user_id).execute().data
    
    # Convert to list of dicts and calculate match score
    result = []
    for match in matches:
        match_score = calculate_match_score(user, match)
        match_dict = {
            'id': match['id'],
            'name': match['name'],
            'email': match['email'],
            'picture': match['picture'],
            'user_type': match['user_type'],
            'industry': match['industry'],
            'location': match['location'],
            'services': match['services'],
            'credit_rating': match['credit_rating'],
            'bio': match['bio'],
            'match_score': match_score
        }
        result.append(match_dict)
    
    # Sort by match score
    result.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify(result)

def calculate_match_score(user, match):
    score = 50  # Start with base score of 50
    
    # Industry match (0-20 points) - case insensitive
    user_industry = user.get('industry', '').lower() if user.get('industry') else ''
    match_industry = match.get('industry', '').lower() if match.get('industry') else ''
    
    if user_industry and match_industry and user_industry == match_industry:
        score += 20
    
    # Location match (0-15 points) - case insensitive
    user_location = user.get('location', '').lower() if user.get('location') else ''
    match_location = match.get('location', '').lower() if match.get('location') else ''
    
    if user_location and match_location and user_location == match_location:
        score += 15
    
    # Bio match with fuzzy matching (0-15 points)
    bio_score = calculate_fuzzy_similarity(user.get('bio', ''), match.get('bio', ''))
    score += int(15 * bio_score)
    
    return score

def calculate_fuzzy_similarity(str1, str2):
    """
    Calculate similarity between two strings using fuzzy matching.
    Returns a score between 0 and 1.
    """
    if not str1 or not str2:
        return 0
    
    # Convert to lowercase for better matching
    str1 = str1.lower()
    str2 = str2.lower()
    
    # Exact match
    if str1 == str2:
        return 1.0
    
    # Calculate Levenshtein distance (edit distance)
    distance = levenshtein_distance(str1, str2)
    max_len = max(len(str1), len(str2))
    
    # Normalize the distance to get similarity
    if max_len == 0:
        return 0
    
    similarity = 1 - (distance / max_len)
    
    # Only consider it a match if similarity is above threshold
    if similarity < 0.3:
        return 0
    
    return similarity

def levenshtein_distance(s1, s2):
    """
    Calculate the Levenshtein distance between two strings.
    This measures the minimum number of single-character edits needed
    to change one string into another.
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)