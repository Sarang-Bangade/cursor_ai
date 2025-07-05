import OpenAI from "openai";
import { exec } from "node:child_process";
import os from "os";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

const openai = new OpenAI({
    apiKey: "AIzaSyAnmdDBIWb9CulFUb-r2DDhI8G7bdVs4Ao",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

function getWeatherInfo(cityname) {
    return `${cityname} has 36 degree celsius`;
}

function convertToWindowsCommand(command) {
    if (os.platform() !== "win32") return command;

    return command
        .replace(/touch ([\w.\s]+)/g, (_, files) =>
            files.split(" ").map(f => `echo.>${f}`).join(" && ")
        )
        .replace(/ls/g, "dir")
        .replace(/cat (\S+)/g, "type $1")
        .replace(/clear/g, "cls")
        .replace(/rm -r (\S+)/g, "rmdir /s /q $1")
        .replace(/rm (\S+)/g, "del $1")
        .replace(/mv (\S+) (\S+)/g, "move $1 $2")
        .replace(/cp (\S+) (\S+)/g, "copy $1 $2")
        .replace(/pwd/g, "cd")
        .replace(/find . -name \"(.*)\"/, "dir /s /b $1");
}

function executeCommand(command) {
    const finalCommand = convertToWindowsCommand(command);

    return new Promise((resolve, reject) => {
        exec(finalCommand, function (err, stdout, stderr) {
            if (err) {
                return reject(err);
            }
            resolve(`stdout: ${stdout}\nstderr: ${stderr}`);
        });
    });
}

const TOOLS_MAP = {
    getWeatherInfo: getWeatherInfo,
    executeCommand: executeCommand,
};

const SYSTEM_PROMPT = `You are useful ai assistant who is designed to resolve
                       the user query.
          You work on START, THINK, ACTION AND OUTPUT Mode.
          In the start phase user gives a query to you.
          Then you think how to resolve that query 3-4 times and make sure that if that
          If there is any need to call a tool you can call ACTION event with tool and
          input.
          If there is a action call wait for the observe that is OUTPUT of the tool.
          Based on the OBSERVE of the prev step you either OUTPUT or repeat the loop.
          
          Rules:
              - Always wait for the next step.
              - Always output a single step and wait for the next step.
              - Output Must be strictly JSON.
              - Only call the tools from Available tools only.
              - Strictly follow the output format in JSON.


          Available tools:
                -getWeatherInfo(city:string) : string
                -executeCommand(command): string Executes a given command on the users device and returns the stdout and stderr.

          Example :-
                    START: What is the weather of Nagpur ?   
                    THINK: The user is asking for the weather of Nagpur.
                    THINK: From the available tools , I must call getWeatherInfo tool for Nagpur as input.
                    ACTION: Call the getWeatherInfo(Nagpur)
                    OBSERVE: 40 degree celsius
                    THINK: The output for getWeatherInfo of Nagpur is 40 degree celsius.
                    OUTPUT: Hey, the weather of Nagpur is 40 degree celsius which is quite hot.

            Output Example : 
                  {"role":"user", "content":"What is the Weather of Nagpur?"}
                  {"step":"think","content":"The user is asking for the weather of Nagpur"}
                  {"step":"think","content":"From the available tools , I must call getWeatherInfo tool for Nagpur as input"}
                  {"step":"action","tool":"getWeatherInfo","input":"Nagpur"}
                  {"step":"observe","content":"40 degree celsius" }
                  {"step":"think","content":"The output for getWeatherInfo of Nagpur is 40 degree celsius." }
                  {"step":"output","content":"Hey, the weather of Nagpur is 40 degree celsius which is quite hot."}

            Output Format:
                {"step":"string", "tool":"string", "input":"string", "content":"string"}

        `;

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Set up Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
        });

        const messages = [
            { 
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: message
            }
        ];

        // Process the conversation
        while (true) {
            const response = await openai.chat.completions.create({
                model: "gemini-2.0-flash",
                response_format: { type: "json_object" },
                messages: messages
            });

            messages.push({ 'role': 'assistant', 'content': response.choices[0].message.content });
            const parsed_response = JSON.parse(response.choices[0].message.content);

            // Send step data to frontend
            res.write(`data: ${JSON.stringify(parsed_response)}\n\n`);

            if (parsed_response.step && parsed_response.step === "think") {
                console.log(`🧠 ${parsed_response.content}`);
                continue;
            }

            if (parsed_response.step && parsed_response.step === "output") {
                console.log(`🤖 ${parsed_response.content}`);
                break;
            }

            if (parsed_response.step && parsed_response.step === "action") {
                const tool = parsed_response.tool;
                const input = parsed_response.input;
                const value = await TOOLS_MAP[tool](input);
                console.log(`⚙️ Tool Call ${tool}: (${input}): ${value}`);
                
                const observeResponse = { step: 'observe', content: value };
                messages.push({
                    role: 'assistant',
                    content: JSON.stringify(observeResponse)
                });
                
                // Send observe data to frontend
                res.write(`data: ${JSON.stringify(observeResponse)}\n\n`);
                continue;
            }
        }

        res.end();
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
        res.end();
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Cursor AI Assistant Server is running!`);
    console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`🔧 Backend API available at: http://localhost:${PORT}/api`);
    console.log(`\n💡 The web interface is now ready to use!`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    process.exit(0);
});

