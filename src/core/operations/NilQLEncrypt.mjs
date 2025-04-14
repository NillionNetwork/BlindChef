/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { nilql } from "@nillion/nilql";

/**
 * NilQL Encrypt operation
 */
class NilQLEncrypt extends Operation {
    /**
     * NilQLEncrypt constructor
     */
    constructor() {
        super();

        this.name = "NilQL Encrypt";
        this.module = "Crypto";
        this.description = "Encrypts data using nilql-ts library with multi-party computation capabilities. Supports:\n\n- SUM mode: encrypts numbers for secure summation (numbers only)\n- STORE mode: encrypts strings for secure storage\n- MATCH mode: encrypts strings for secure matching";
        this.infoURL = "https://github.com/NillionNetwork/nilql-ts";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Number of Nodes",
                type: "number",
                value: 3
            },
            {
                name: "Key Type",
                type: "option",
                value: ["SecretKey", "ClusterKey"]
            },
            {
                name: "Input Type",
                type: "option",
                value: ["String", "Number"]
            },
            {
                name: "Mode",
                type: "option",
                value: ["sum", "store", "match"]
            }
        ];
        this.secretKey = null;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {Promise<string>}
     */
    async run(input, args) {
        const [numNodes, keyType, inputType, mode] = args;

        try {
            // Validate mode and input type combination
            if (inputType === "String" && mode === "sum") {
                throw new Error("SUM mode can only be used with Number input type");
            }

            // Create cluster configuration
            const cluster = { nodes: Array(numNodes).fill({}) };

            // Generate secret key if not already generated
            if (!this.secretKey) {
                this.secretKey = await nilql[keyType].generate(cluster, { [mode]: true });
            }

            let value;
            // Process input based on input type
            if (inputType === "Number") {
                value = BigInt(input);
            } else if (inputType === "String") {
                // For string input, use the string directly
                value = input;
            } else {
                throw new Error("Invalid input type");
            }

            // Encrypt the value
            const ciphertext = await nilql.encrypt(this.secretKey, value);

            // Return the ciphertext as JSON string
            return JSON.stringify(ciphertext);
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}

export default NilQLEncrypt;
