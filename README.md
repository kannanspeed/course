# Task Manager App

A modern, real-time task management application built with React, TypeScript, and Supabase.

## 🚀 Features

- ✅ **Real-time task management** - Create, edit, and delete tasks instantly
- ✅ **User authentication** - Sign up and sign in with email
- ✅ **Image uploads** - Attach images to your tasks
- ✅ **Real-time updates** - See changes instantly without page refresh
- ✅ **User-specific tasks** - Each user sees only their own tasks
- ✅ **Responsive design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Styling**: CSS3 with modern design
- **Deployment**: GitHub Pages

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kannanspeed/course.git
   cd course
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the database setup SQL in your Supabase SQL Editor
   - Enable Row Level Security (RLS) for user-specific tasks

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

Run this SQL in your Supabase SQL Editor to set up the database:

```sql
-- Create tasks table
CREATE TABLE public.tasks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    image_url TEXT,
    email TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create user-specific policies
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.jwt() ->> 'email' = email);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tasks-images', 'tasks-images', true);

-- Create storage policy
CREATE POLICY "Open storage for all" ON storage.objects
    FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
```

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Go to**: [https://render.com](https://render.com)
2. **Sign up** with your GitHub account
3. **Click "New +"** → **"Static Site"**
4. **Connect repository**: `kannanspeed/course`
5. **Use these settings**:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18`
6. **Add environment variables**:
   - `VITE_SUPABASE_URL`: `https://qodpovituewhzjmtvghh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
7. **Click "Create Static Site"**

**Your app will be live at**: `https://your-app-name.onrender.com`

### Deploy to GitHub Pages

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   - Go to your repository settings
   - Navigate to Pages section
   - Select source as "GitHub Actions"
   - The app will be deployed automatically

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## 📱 Usage

1. **Sign up** with your email address
2. **Check your email** for confirmation link
3. **Sign in** to your account
4. **Create tasks** with titles and descriptions
5. **Upload images** to your tasks
6. **Edit and delete** tasks as needed
7. **See real-time updates** across all devices

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/
│   ├── auth.tsx          # Authentication component
│   └── task-manager.tsx  # Main task management component
├── App.tsx               # Main app component
├── main.tsx              # App entry point
├── supabase-client.ts    # Supabase configuration
└── index.css             # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [React](https://reactjs.org/) for the frontend framework
- [Vite](https://vitejs.dev/) for the build tool

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Live Demo**: [https://kannanspeed.github.io/course](https://kannanspeed.github.io/course)