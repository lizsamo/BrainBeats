-- To create the tables for users: 

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);


-- To create the tables for the notes that we upload: 

CREATE TABLE notes (
    note_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT,
    title VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);



-- To create the tables for the music selections: 

CREATE TABLE music_selections (
    selection_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    music_type VARCHAR(50),
    parameters JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- To create the table for the newly generated songs with the notes and the music we chose and uploaded: 

CREATE TABLE generated_songs (
    song_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(100),
    file_path VARCHAR(255),
    note_id INTEGER REFERENCES notes(note_id) ON DELETE SET NULL,
    selection_id INTEGER REFERENCES music_selections(selection_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT TRUE
);


/* Each of the tables will be separated so that one user is not able to view other users' info. This
will be done by enabling row level security.
Indexes are created to speed up the queries as it prevents queries from looking through entire tables,
which prevents excessive time for querying. This is mainly for performance once the tables get populated 
with a lot of entries. */

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_music_selections_user_id ON music_selections(user_id);
CREATE INDEX idx_generated_songs_user_id ON generated_songs(user_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_songs ENABLE ROW LEVEL SECURITY;

-- Row-level security policies

CREATE POLICY user_own_data ON users
    USING (user_id = get_current_user_id() OR get_current_user_id() IS NULL);

CREATE POLICY user_notes_policy ON notes
    USING (user_id = get_current_user_id());

CREATE POLICY user_selections_policy ON music_selections
    USING (user_id = get_current_user_id());

CREATE POLICY user_songs_policy ON generated_songs
    USING (user_id = get_current_user_id());

-- Create app-user and app-admin roles
CREATE ROLE app_user;
GRANT SELECT, INSERT, UPDATE ON users, notes, music_selections, generated_songs TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

CREATE ROLE app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;