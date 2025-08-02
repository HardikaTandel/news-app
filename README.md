# 📰 News App

A modern, full-stack news application built with React, Node.js, and Express. Get real-time news updates, personalized content, and Names Entity Recognition.

## 🌟 Features

- **Real-time News Updates**: Get the latest news from multiple sources
- **User Authentication**: Secure login with Google OAuth
- **Personalized Feed**: Customize your news preferences
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Text-to-Speech**: Built-in audio narration for improved accessibility
- **Named Entity Recognition**: Extract key entities from news articles using Hugging Face API
- **Modern UI/UX**: Clean, intuitive interface


## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Cors** - Cross-origin resource sharing

### APIs & Services
- **Hugging Face API** - Named Entity Recognition (NER)
- **Google OAuth** - User authentication
- **GNews API** - News content

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Clone the Repository
```bash
git clone https://github.com/HardikaTandel/news-app.git
cd news-app
```

### Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Environment Setup

1. **Copy the environment template:**
```bash
cp backend/config.env.template backend/config.env
```

2. **Configure your environment variables in `backend/config.env`:**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/news-app
JWT_SECRET=your_jwt_secret_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
GNEWS_API_KEY=your_gnews_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
PORT=5000
```

### API Keys Setup

1. **Hugging Face API Key**: Get from [Hugging Face](https://huggingface.co/settings/tokens)
2. **GNews API Key**: Get from [GNews](https://gnews.io/)
3. **Google OAuth**: Set up in [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server:**
```bash
cd backend
npm run dev
```

2. **Start the Frontend Development Server:**
```bash
npm run dev
```

3. **Open your browser and navigate to:**
```
http://localhost:5173
```

### Production Build

1. **Build the frontend:**
```bash
npm run build
```

2. **Start the production server:**
```bash
cd backend
npm start
```

## 📁 Project Structure

```
news-app/
├── backend/                 # Backend server
│   ├── config.env          # Environment variables (not in git)
│   ├── config.env.template # Environment template
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   └── middleware/         # Custom middleware
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── public/                # Static assets
├── package.json           # Frontend dependencies
└── README.md             # This file
```


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hardika Tandel**
- GitHub: [@HardikaTandel](https://github.com/HardikaTandel)

## 🙏 Acknowledgments

- Hugging Face for Named Entity Recognition models
- GNews for news content
- Google for OAuth authentication

---

⭐ **Star this repository if you found it helpful!**
