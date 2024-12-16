import { pipe, split, trim } from 'ramda';

export const readFileStrings = async (filename: string): Promise<string[]> => {
    const text = await Deno.readTextFile(filename);
    return pipe(
        trim,
        split('\n')
    )(text);
};

export const readFileRaw = async (filename: string): Promise<string> => {
    const text = await Deno.readTextFile(filename);
    return trim(text);
};