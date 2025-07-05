# 🤖 Cursor AI Assistant

A beautiful, modern web interface for your AI assistant with real-time processing visualization. This application provides a sleek chat interface that shows the AI's thinking process step-by-step.

## ✨ Features

- **Modern Web Interface**: Beautiful, responsive design with glassmorphism effects
- **Real-time Processing**: Watch the AI think, act, and respond in real-time
- **Tool Visualization**: See when tools are called and their results
- **Interactive Chat**: Smooth, animated chat experience
- **Process Steps**: Visual breakdown of the AI's reasoning process
- **Weather Information**: Get weather data for any city
- **Command Execution**: Safely execute system commands
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Navigate to the cursor folder**
   ```bash
   cd C:\Users\saran\Desktop\cursor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Go to: `http://localhost:3000`
   - The web interface will load automatically!

## 🎯 Usage

### Web Interface

1. **Start the server** using `npm start`
2. **Open your browser** to `http://localhost:3000`
3. **Type your message** in the input field
4. **Press Enter** or click the send button
5. **Watch the magic happen**:
   - See the AI's thinking process in the right panel
   - Watch tool calls execute in real-time
   - Get the final response in the chat

### Example Queries

- "What's the weather in New York?"
- "Create a new file called test.txt"
- "List all files in the current directory"
- "What's the current date and time?"
- "Help me organize my files"

## 🔧 Available Tools

### Weather Information
- **Function**: `getWeatherInfo(city)`
- **Description**: Get current weather information for any city
- **Example**: "What's the weather in London?"

### Command Execution
- **Function**: `executeCommand(command)`
- **Description**: Execute system commands safely
- **Example**: "Show me the current directory contents"
- **Note**: Commands are automatically converted for Windows compatibility

## 🎨 Interface Features

### Chat Area
- **Smooth animations** for message appearance
- **User and AI avatars** for easy identification
- **Auto-scrolling** to latest messages
- **Responsive design** for all screen sizes

### Process Visualization
- **Think Steps** 🧠: See the AI's reasoning
- **Action Steps** ⚙️: Watch tool calls
- **Observe Steps** 👀: View tool results
- **Color-coded steps** for easy understanding

### Status Indicators
- **Green dot**: Connected and ready
- **Orange dot**: Processing your request
- **Red dot**: Error or disconnected

## 📁 Project Structure

```
cursor/
├── index.html          # Main web interface
├── styles.css          # Beautiful styling
├── script.js           # Frontend logic
├── server.js           # Backend server
├── cursor_ai.js.js     # Original CLI version
├── package.json        # Dependencies
└── README.md          # This file
```

## 🛠️ Technical Details

### Backend
- **Express.js** server for API endpoints
- **Server-Sent Events** for real-time streaming
- **OpenAI API** integration (configured for Gemini)
- **Cross-platform** command execution

### Frontend
- **Vanilla JavaScript** for lightweight performance
- **CSS Grid & Flexbox** for responsive layout
- **CSS Animations** for smooth interactions
- **Font Awesome** icons for beautiful UI

### AI Integration
- **Gemini 2.0 Flash** model via OpenAI API
- **JSON-structured** responses
- **Step-by-step** processing visualization
- **Tool calling** with real-time feedback

## 🔒 Security Notes

- Commands are executed in a controlled environment
- The AI follows strict output formatting
- Tool calls are limited to predefined functions
- Cross-platform command conversion for safety

## 🚨 Troubleshooting

### Server won't start
- Check if Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is available

### Frontend shows "Backend not running"
- Make sure the server is running: `npm start`
- Check the console for error messages
- Verify the server is accessible at `localhost:3000`

### AI responses seem slow
- This is normal - the AI processes step-by-step
- Check your internet connection
- Verify the API key is valid

## 🎉 Enjoy!

Your Cursor AI Assistant is now ready with a beautiful web interface! Ask it anything and watch it think and respond in real-time.

---

**Made with ❤️ for a better AI experience**

