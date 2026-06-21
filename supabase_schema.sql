-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'employee', -- 'employee', 'hr', 'admin'
  department TEXT,
  branch TEXT,
  skills TEXT[],
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  
  -- The Core Grading Metric and AI Review
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  review TEXT,

  burnout_risk TEXT DEFAULT 'Low',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project members join table
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT,
  PRIMARY KEY (project_id, profile_id)
);

-- Create productivity logs for charts
CREATE TABLE productivity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  score INTEGER,
  hours_worked DECIMAL(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create market trends table (fetched from external APIs)
CREATE TABLE market_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL, -- e.g., 'Avg Salary', 'Top Skill', 'Industry Growth'
  value TEXT NOT NULL,
  category TEXT, -- e.g., 'Engineering', 'Design'
  source_api TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking Grade Changes over time
CREATE TABLE grade_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  old_grade INTEGER,
  new_grade INTEGER,
  reason TEXT, -- e.g., 'Market Trend Update'
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- HR-assigned roadmaps and skill recommendations
CREATE TABLE upskilling_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The Employee
  hr_id UUID REFERENCES profiles(id), -- The HR who assigned it
  
  title TEXT NOT NULL, -- e.g., 'Q3 Cloud Engineering Roadmap'
  roadmap_details TEXT, -- Detailed instructions/roadmap
  target_skills TEXT[], -- Trending skills to acquire
  
  status TEXT DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE upskilling_recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Projects are viewable by authenticated users." ON projects
  FOR SELECT TO authenticated USING (true);

-- Productivity Logs Policies
CREATE POLICY "Users can view their own productivity logs." ON productivity_logs
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own productivity logs." ON productivity_logs
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- HR/Admin can view all productivity logs
CREATE POLICY "HR/Admin can view all productivity logs." ON productivity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'hr' OR profiles.role = 'admin')
    )
  );

-- Market Trends Policies
CREATE POLICY "Market trends are viewable by everyone." ON market_trends
  FOR SELECT USING (true);

-- Grade History Policies
CREATE POLICY "Users can view their own grade history." ON grade_history
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "HR/Admin can view all grade history." ON grade_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'hr' OR profiles.role = 'admin')
    )
  );

-- Upskilling Recommendations Policies
CREATE POLICY "Employees can view their own recommendations." ON upskilling_recommendations
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "HR can manage all recommendations." ON upskilling_recommendations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'hr' OR profiles.role = 'admin')
    )
  );

-- Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, score, review, experience_years, department, skills, bio)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'firstName', 
    new.raw_user_meta_data->>'lastName',
    COALESCE(new.raw_user_meta_data->>'role', 'employee'),
    (new.raw_user_meta_data->>'score')::INTEGER,
    new.raw_user_meta_data->>'review',
    (new.raw_user_meta_data->>'experienceYears')::INTEGER,
    new.raw_user_meta_data->>'department',
    ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'skills')),
    new.raw_user_meta_data->>'bio'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
