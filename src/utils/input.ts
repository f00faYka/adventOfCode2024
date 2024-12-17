import { pipe, split, trim } from "ramda";
import { dirname, fromFileUrl, join } from "std/path/mod.ts";

function getCallerDir(): string {
    // Получаем стек вызовов
    const error = new Error();
    const stack = error.stack?.split('\n') || [];
    
    // Находим строку, содержащую путь к файлу, который вызвал нашу функцию
    const callerLine = stack.find(line => line.includes('file://') && !line.includes('input.ts'));
    if (!callerLine) {
        throw new Error('Could not determine caller file path');
    }
    
    // Извлекаем URL файла
    const match = callerLine.match(/file:\/\/[^)]+/);
    if (!match) {
        throw new Error('Could not extract file URL from stack trace');
    }
    
    return dirname(fromFileUrl(match[0]));
}

export const readFileStrings = async (filename: string): Promise<string[]> => {
    const dirPath = getCallerDir();
    const filePath = join(dirPath, filename);
    const text = await Deno.readTextFile(filePath);
    return pipe(
        trim,
        split('\n')
    )(text);
};

export const readFileRaw = async (filename: string): Promise<string> => {
    const dirPath = getCallerDir();
    const filePath = join(dirPath, filename);
    const text = await Deno.readTextFile(filePath);
    return trim(text);
};