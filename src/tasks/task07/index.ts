import { map, reduce, repeat, split } from 'ramda';
import { readFileStrings } from '../../utils/input';

const input = readFileStrings(__dirname, 'example.txt');
// const input = readFileStrings(__dirname, 'input.txt');

type Operator = '+' | '*';
type Equation = [number, number[]];
type OperationFunctions = {
    [key in Operator]: (a: number, b: number) => number;
};

const operationFunctions: OperationFunctions = {
    '+': (a, b) => a + b,
    '*': (a, b) => a * b,
};

const getFn = (operator: Operator): OperationFunctions[Operator] => {
    return operationFunctions[operator];
};

const parseEquation = (line: string): Equation => {
    const [left, right] = split(':', line);
    return [Number(left), map(Number)(split(' ', right))];
};

const equations: Equation[] = map(parseEquation)(input);

console.log(equations);

const calcEq = (operators: Operator[], numbers: number[]) => {
    let result = numbers[0];
    for (let i = 1; i < numbers.length - 1; i++) {
        const fn = getFn(operators[i]);
        result = fn(result, numbers[i]);
    }
    return result;
}

const getAllOperations = (length: number) => {
    const operators: Operator[] = repeat('+', length - 1);
    const allOperations = [operators];


    return allOperations;
};

const findSolution = (equation: Equation) => {
    const [result, numbers] = equation;

    const operators: Operator[] = repeat('+', numbers.length - 1);

    const solution = calcEq(operators, numbers);

    return solution === result ? operators : null;
};
