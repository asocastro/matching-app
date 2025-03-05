# Seeker-Provider Matching Application

A minimal viable prototype (MVP) for a basic "Seeker-Provider" matching application that connects service seekers with service providers.

## System Architecture

This application follows a client-server architecture:

- **Frontend**: React.js with Tailwind CSS for styling
- **Backend**: Flask RESTful API
- **Database**: Supabase
- **Authentication**: Google OAuth2.0
- **Matching Algorithm**: Simple algorithm based on industry, location, and other profile attributes

## Features

- User Registration & Authentication via Google OAUTH
- Hosted database via Supabase
- Two user roles: Seeker and Provider
- Profile Management for both user types
- Matching functionality to suggest providers for seekers and vice versa

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Docker and Docker Compose (NOT WORKING YET Couldnt get this to work on time)

### Local Development Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd seeker-provider-matching
   ```

2. Frontend Setup:
   ```
   npm install
   ```

3. Backend Setup:
   ```
   python -r venv .venv
   .venv/scripts/activate
   pip install -r requirements.txt

   choco install ngrok
   ngrok config add-authtoken 2troMFoP5pHAdEBOTU2D1oyLeqe_4tCxWJ41cNpz9KsBLd8Wk
   ```


4. Run the application:
   ```
   npm run dev

   # open a new terminal and use this change the 5000 value 
   below to the port your pc is using from the node terminal.

   ngrok http --url=willing-donkey-gentle.ngrok-free.app 5000

   go to the link below: 
   Please wait 3-20 seconds for the website to login.

   ```

5. Access the application at `https://willing-donkey-gentle.ngrok-free.app`

6. Let me know if you have any other questions or can't run the code. But please
do let me know when you're done reviewing this so I can take down the supabase, OAuth, and NGrok instances.


## Known Limitations and Future Enhancements

- Currently using SQLite for simplicity; would migrate to PostgreSQL for production
- Basic matching algorithm; could be enhanced with machine learning for better recommendations
- Limited error handling and validation
- No real-time notifications or messaging between users
- No admin dashboard for monitoring and management
- No Analytics 

## Project Structure

```
├── app.py                 # Flask backend application
├── schema.sql             # Database schema
├── requirements.txt       # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── package.json           # Node.js dependencies
├── vite.config.js         # Vite configuration
├── index.html             # HTML entry point
├── src/                   # Frontend source code
│   ├── components/        # React components
│   ├── context/           # React context providers
│   ├── App.jsx            # Main React component
│   └── main.jsx           # React entry point
└── dist/                  # Built frontend assets (after npm run build)
```