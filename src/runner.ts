import { spawn } from 'child_process';
import { join } from 'path';

const taskName = process.argv[2];

if (!taskName) {
    console.error('Please provide a task name (e.g., task01)');
    process.exit(1);
}

const runnerPath = join(__dirname, 'tasks', taskName, 'runner.ts');

spawn('ts-node', [runnerPath], { stdio: 'inherit' });