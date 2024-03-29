'use strict';

const fs = require('fs');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});

process.stdin.on('end', _ => {
    inputString = inputString.replace(/\s*$/, '')
        .split('\n')
        .map(str => str.replace(/\s*$/, ''));

    main();
});

function readLine() {
    return inputString[currentLine++];
}

// Complete the lilysHomework function below.
function lilysHomework(arr) {

 const swaps = (arr, sarr) => {
        let [s, idx] = [0, []];
        arr.forEach((v,i) => idx[v] = i);
        for (let i = 0, j; i <100000 ; i++) {
            while (arr[i] === sarr[i] && i < 100000) i++;
            j = idx[sarr[i]];
            idx[arr[i]] = j;
            arr[i] = [ arr[j], arr[j] = arr[i] ][0];
            s++;
        }
        return s-1;
    }
    
    let asc = [...arr].sort((a,b) => a-b);
    let desc = [...asc].reverse();
    let s1 = swaps([...arr], asc);
    let s2 = swaps(arr, desc);

    return Math.min(s1, s2)

}

function main() {
    const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

    const n = parseInt(readLine(), 10);

    const arr = readLine().split(' ').map(arrTemp => parseInt(arrTemp, 10));

    let result = lilysHomework(arr);

    ws.write(result + "\n");

    ws.end();
}