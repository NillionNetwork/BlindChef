/**
 * @author Dimitris Mouris [dimitris@nillion.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * NilQL Secret Share Sum operation
 */
class NilQLSecretShareSum extends Operation {
    /**
     * NilQLSecretShareSum constructor
     */
    constructor() {
        super();

        this.name = "NilQL Secret Share Sum";
        this.module = "Crypto";
        this.description = "Adds secret shares together. The inputs should be provided as [1,2,3];[4,5,6] and this will add 1+4, 2+5, 3+6 and return the new list as output.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.example = "Example Input: [1,2,3];[4,5,6] -> Output: [5,7,9]";
    }

    /**
     * @param {string} input
     * @returns {string}
     */
    run(input) {
        try {
            // Split the input into two lists using the delimiter `;`
            const [list1, list2] = input.split(";").map(str => JSON.parse(str));

            // Ensure both lists are arrays of numbers (BigInts)
            if (!Array.isArray(list1) || !Array.isArray(list2)) {
                throw new Error("Both inputs must be arrays separated by ';'. E.g., [1,2]; [3,4]");
            }

            if (list1.length !== list2.length) {
                throw new Error("Both arrays must have the same length. E.g., [1,2]; [3,4]");
            }

            // Add corresponding elements of the two lists
            const result = list1.map((num1, index) => {
                const num2 = list2[index];
                const bigInt1 = BigInt(num1);
                const bigInt2 = BigInt(num2);
                return (bigInt1 + bigInt2);
            });

            // Return the result as a JSON string
            return JSON.stringify(result.map(Number));
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}

export default NilQLSecretShareSum;
