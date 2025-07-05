import OpenAI from "openai";
import {exec} from "node:child_process"
import os from "os";

const openai = new OpenAI({
    apiKey: "AIzaSyAnmdDBIWb9CulFUb-r2DDhI8G7bdVs4Ao",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

function getWeatherInfo(cityname){
    return `${cityname}has 36 degree celcius`;
}


function convertToWindowsCommand(command) {
    if (os.platform() !== "win32") return command; // Only convert if on Windows

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
        .replace(/find . -name "(.*)"/g, "dir /s /b $1");
}
 
function executeCommand (command){
    const finalCommand = convertToWindowsCommand(command); // 👈 Convert if needed

    return new Promise((resolve, reject) => {
        exec(finalCommand, function(err, stdout, stderr){
            if(err){
                return reject(err);
            }
            resolve(`stdout: ${stdout}\nstderr: ${stderr}`);
        });
    });
}

const TOOLS_MAP = {
    getWeatherInfo:getWeatherInfo,
    executeCommand:executeCommand,
}

//system prompt can be changed according to the requirement

const SYSTEM_PROMPT = `You are usefull ai assistant who is designed to resolve
                       the user query.
          You work on START, THINK, ACTION AND OUTPUT Mode.
          In the start phase user gives a query to you.
          Then you  how to reslove that query 3-4 times and make sure that if that
          If there is any need to call a tool you can call ACTION event with tool and
          input.
          If there is a action call wait for the observe that is OUTPUT of the tool.
          Based on the OBSERVE of the prev step you either OUTPUT of repeat the loop.
          
          Rules:
              - Always wait for the next step.
              - Always output a single step and wait for the next step.
              - Output Must be strictly JSON.
              - Only call the tools from Avaible tools only.
              - Strictly follow the output format in JSON.


          Available tools:
                -getWeatherInfo(city:string) : string
                -executeCommand(command): string Executes a given linux command on the users device and returns the stdout and stderr.

          Example :-
                    START: What is the weather of Nagpur ?   
                    THINK: The user is asking for the weather of Nagpur.
                    THINK: From the avaiable tools , I must call getWeatherInfo tool for Nagpur as input.
                    ACTION: Call the getWeatherInfo(Nagpur)
                    OBSERVE: 40 degree celcius
                    THINK: The output for getWeatherInfo of Nagpur is 40 degree celcius.
                    OUTPUT: Hey, the weather of Nagpur is 40 degree celcius which is quite hot.

            Output Example : 
                  {"role":"user", "content":"What is the Weather of Nagpur?"}
                  {"step":"think","content":"The user is asking for the weather of Nagpur"}
                  {"step":"think","content":"From the avaiable tools , I must call getWeatherInfo tool for Nagpur as input"}
                  {"step":"action","tool":"getWeatherInfo","input":"Nagpur"}
                  {"step":"observe","content":"40 degree celcius" }
                  {"step":"think","content":"The output for getWeatherInfo of Nagpur is 40 degree celcius." }
                  {"step":"output","content":"Hey, the weather of Nagpur is 40 degree celcius which is quite hot."}

            Output Format:
                {"step":"string", "tool":"string", "input":"string", "content":"string"}

        `
async function init(){
    const messages = [
    { 
        role: "system",
        content: SYSTEM_PROMPT
    }     
]

const user_query ='make me one file name sarang.js';
messages.push({'role':'user','content':user_query})

while(true){
   const response = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        response_format:{type:"json_object"},
        messages : messages
    })
    messages.push({'role':'assistant','content':response.choices[0].message.content})
    const parsed_response = JSON.parse(response.choices[0].message.content)

    if (parsed_response.step && parsed_response.step==="think"){
        console.log(`🧠 ${parsed_response.content}`);
        continue;
    }
    if (parsed_response.step && parsed_response.step==="output"){
        console.log(`🤖 ${parsed_response.content}`);
        break;
    }
    if (parsed_response.step && parsed_response.step==="action"){
       const tool = parsed_response.tool
       const input = parsed_response.input
       const value = await TOOLS_MAP[tool](input);
       console.log(`⚙️  Tool Call ${tool}: (${input}): ${value}`)
       messages.push({
                role:'assistant',
                content:JSON.stringify({step:'observe',content:value})
       })
         console.log(`🤖 ${parsed_response.content}`);
        continue;
    }
}
}

init();

