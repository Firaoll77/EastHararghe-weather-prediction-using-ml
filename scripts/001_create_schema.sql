-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  rainfall_prediction DECIMAL(10, 2) NOT NULL,
  confidence_score DECIMAL(5, 4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  weather_input JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weather_history table
CREATE TABLE IF NOT EXISTS weather_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  raw_weather_data JSONB NOT NULL,
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  wind_speed DECIMAL(6, 2),
  pressure DECIMAL(7, 2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  preferred_location TEXT DEFAULT 'Harar City',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_location ON predictions(location);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_history_location ON weather_history(location);
CREATE INDEX IF NOT EXISTS idx_weather_history_timestamp ON weather_history(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for predictions
CREATE POLICY "Users can view their own predictions" ON predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions" ON predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions" ON predictions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for weather_history (public read, authenticated insert)
CREATE POLICY "Anyone can view weather history" ON weather_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert weather history" ON weather_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
