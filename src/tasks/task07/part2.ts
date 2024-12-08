import { filter, map, reduce, repeat, split, sum, trim } from 'ramda';
import { readFileStrings } from '../../utils/input';

type Operator = '+' | '*' | "||";
type Equation = [number, number[]];
type OperationFunctions = {
    [key in Operator]: (a: number, b: number) => number;
};

const operationFunctions: OperationFunctions = {
    '+': (a, b) => a + b,
    '*': (a, b) => a * b,
    '||': (a, b) => Number(`${a}${b}`),
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
    const operatorOrder: Operator[] = ['+', '*', '||'];

    for (let i = operators.length - 1; i >= 0; i--) {
        const currentOp = operators[i];
        const currentIndex = operatorOrder.indexOf(currentOp);

        if (currentIndex >= operatorOrder.length - 1) {
            continue;
        }

        const left = operators.slice(0, i);
        const nextOperator = operatorOrder[currentIndex + 1];
        const right = repeat('+', operators.length - i - 1);
        return [...left, nextOperator, ...right] as Operator[];
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

// const input = readFileStrings(__dirname, 'example.txt');
const input = readFileStrings(__dirname, 'input.txt');

const equations: Equation[] = map(parseEquation)(input);

const solvableEquations = filter(hasSolution)(equations);

console.log(equations);
console.log(solvableEquations)

const sumOfSolvableResults = sum(map(([result, _]) => result)(solvableEquations));

console.log(sumOfSolvableResults);


// part 2

const newSolvableEquations = filter(hasSolution)(equations);