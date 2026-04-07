import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

// Let the user configure the exact directory via env var
export const BASE_DIR = process.env.AGENT_WORKSPACE || '/absolute/path/to/your/slack-workspace';

// Helper to ensure paths cannot escape the base directory
function resolveSafePath(userPath?: string): string {
    const targetPath = userPath ? path.resolve(BASE_DIR, userPath) : BASE_DIR;
    
    // Prevent directory traversal attacks checking if the resolved path starts with the BASE_DIR
    if (!targetPath.startsWith(path.resolve(BASE_DIR))) {
        throw new Error(`Access Denied: Path '${targetPath}' attempts to escape the allowed workspace bounding box.`);
    }
    return targetPath;
}

export async function executeCommand(command: string, cwd?: string): Promise<string> {
    try {
        const targetDir = resolveSafePath(cwd);
        const { stdout, stderr } = await execAsync(command, { cwd: targetDir });
        return stdout || stderr || "Command executed successfully with no output.";
    } catch (error: any) {
        return `Error: ${error.message}\n${error.stderr || ''}`;
    }
}

export async function readFile(filepath: string): Promise<string> {
    try {
        const fullPath = resolveSafePath(filepath);
        return await fs.readFile(fullPath, 'utf8');
    } catch (error: any) {
        return `Error reading file: ${error.message}`;
    }
}

export async function writeFile(filepath: string, content: string): Promise<string> {
    try {
        const fullPath = resolveSafePath(filepath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf8');
        return `File successfully written to ${fullPath}`;
    } catch (error: any) {
        return `Error writing file: ${error.message}`;
    }
}
