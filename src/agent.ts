import ollama, { Message, ChatResponse } from 'ollama';
import * as dotenv from 'dotenv';
import { executeCommand, readFile, writeFile } from './tools';

dotenv.config();

const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.1';

const agentTools = [
  {
    type: 'function',
    function: {
      name: 'execute_command',
      description: 'Execute a bash command in the terminal. Useful for git commands, npm install, running scripts, etc.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The bash command to execute' },
          cwd: { type: 'string', description: 'Optional. The directory to run the command in.' },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the contents of a file.',
      parameters: {
        type: 'object',
        properties: {
          filepath: { type: 'string', description: 'The absolute or relative path to the file' },
        },
        required: ['filepath'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file. Overwrites the file if it exists.',
      parameters: {
        type: 'object',
        properties: {
          filepath: { type: 'string', description: 'The absolute or relative path to the file' },
          content: { type: 'string', description: 'The text content to write' },
        },
        required: ['filepath', 'content'],
      },
    },
  }
];

export async function handleSlackMessage(prompt: string, say?: any): Promise<string> {
  const messages: Message[] = [
    {
        role: 'system',
        content: 'You are an autonomous coding assistant who operates on the user\'s local machine. You have tools to run commands, read files, and write files. Use these tools to accomplish the user\'s request. When you are done or blocked, reply with a final user-facing summary.\n\nVERY IMPORTANT: DO NOT execute arbitrary interactive commands or commands that never exit (like `npm start` without backgrounding).'
    },
    { role: 'user', content: prompt }
  ];

  try {
    let response: ChatResponse = await ollama.chat({
        model: MODEL_NAME,
        messages: messages,
        tools: agentTools as any
    });

    messages.push(response.message);

    while (response.message.tool_calls && response.message.tool_calls.length > 0) {
        for (const tool of response.message.tool_calls) {
            const func = tool.function;
            const args = func.arguments as Record<string, any>;
            let result = '';

            if (say) {
                await say(`🔧 Executing tool: \`${func.name}\``);
            }

            if (func.name === 'execute_command') {
                result = await executeCommand(args.command, args.cwd);
            } else if (func.name === 'read_file') {
                result = await readFile(args.filepath);
            } else if (func.name === 'write_file') {
                result = await writeFile(args.filepath, args.content);
            }

            messages.push({
                role: 'tool',
                content: result
            });
        }

        response = await ollama.chat({
            model: MODEL_NAME,
            messages: messages,
            tools: agentTools as any
        });
        messages.push(response.message);
    }

    return response.message.content || "Task executed.";
  } catch (err: any) {
    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
       return `Error: Could not connect to Ollama. Make sure the Ollama app is running locally!`;
    }
    return `Error generating content: ${err.message}`;
  }
}
