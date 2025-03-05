DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    user_type TEXT CHECK(user_type IN ('seeker', 'provider') OR user_type IS NULL),
    industry TEXT,
    location TEXT,
    services TEXT,
    credit_rating TEXT CHECK(credit_rating IN ('excellent', 'good', 'fair', 'poor') OR credit_rating IS NULL),
    bio TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_industry ON users(industry);