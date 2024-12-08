import { readFileSync } from 'fs';
import { join } from 'path';
import { pipe, split, trim } from 'ramda';

export const readFileStrings = (taskDir: string, filename: string): string[] => {
    return pipe(
        (path: string) => readFileSync(path, 'utf-8'),
        trim,
        split('\n')
    )(join(taskDir, filename));
};

export const readFileRaw = (taskDir: string, filename: string): string => {
    return pipe(
        (path: string) => readFileSync(path, 'utf-8'),
        trim
    )(join(taskDir, filename));
};