import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def test_supabase_connection():
    try:
        # Initialize Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Try a simple query to test the connection
        response = supabase.table("users").select("*").limit(1).execute()
        
        print("Successfully connected to Supabase!")
        print("\nTable Details:")
        print("--------------")
        print(f"Data received: {response.data}")
        print(f"Number of rows: {len(response.data)}")
        if response.data:
            print(f"Columns: {', '.join(response.data[0].keys())}")
        
        return True
    except Exception as e:
        print(f"Failed to connect to Supabase: {str(e)}")
        return False

if __name__ == "__main__":
    test_supabase_connection()
