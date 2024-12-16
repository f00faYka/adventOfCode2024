import { filter, map, repeat, split, sum, trim } from 'ramda';
import { readFileStrings } from '../../utils/input.ts';

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
    return [Number(left), map(Number)(
        split(' ', trim(right))
    )];
};

const calcEq = (operators: Operator[], numbers: number[]) => {
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        const fn = getFn(operators[i - 1]);
        result = fn(result, numbers[i]);
    }
    return result;
}

const getNextOperators = (operators: Operator[]) => {
    for (let i = operators.length - 1; i >= 0; i--) {
        if (operators[i] === "+") {
            const left = operators.slice(0, i);
            const right = repeat("+", operators.length - i - 1);
            return [...left, "*", ...right] as Operator[];
        }
    }
    return [];
}

const getAllOperations = (length: number) => {
    let operators: Operator[] = repeat('+', length - 1);
    const allOperations: Operator[][] = [];

    while (operators.length) {
        allOperations.push(operators);
        operators = getNextOperators(operators);
    }

    return allOperations;
};

const hasSolution = (equation: Equation) => {
    const [result, numbers] = equation;

    const operations = getAllOperations(numbers.length);

    for (const operation of operations) {
        if (calcEq(operation, numbers) === result) {
            return true;
        }
    }

    return false;
};

const input = await readFileStrings('example.txt');
// const input = await readFileStrings('input.txt');

const equations: Equation[] = map(parseEquation)(input);

const solvableEquations = filter(hasSolution)(equations);

console.log(equations);
console.log(solvableEquations)

const sumOfSolvableResults = sum(map(([result, _]) => result)(solvableEquations));

console.log(sumOfSolvableResults);