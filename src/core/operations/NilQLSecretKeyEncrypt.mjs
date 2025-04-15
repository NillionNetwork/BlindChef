/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { nilql } from "@nillion/nilql";

/**
 * NilQL Secret Key Encrypt operation
 */
class NilQLSecretKeyEncrypt extends Operation {
    /**
     * NilQLSecretKeyEncrypt constructor
     */
    constructor() {
        super();

        this.name = "NilQL Secret Key Encrypt";
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
                name: "Mode",
                type: "option",
                value: ["sum", "store", "match"]
            },
            {
                name: "Seed",
                type: "string",
                value: ""
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
        const [numNodes, mode, seed] = args;

        try {
            // Create cluster configuration
            const cluster = { nodes: Array(numNodes).fill({}) };

            // Generate secret key if not already generated
            if (!this.secretKey) {
                if (seed) {
                    // Generate secret key using the provided seed
                    this.secretKey = await nilql.SecretKey.generate(cluster, { [mode]: true }, null, seed);
                } else {
                    // Generate a new secret key if not already generated
                    this.secretKey = await nilql.SecretKey.generate(cluster, { [mode]: true }, null, 42);
                }
            }

            let value;
            // Attempt to parse input as BigInt, fallback to string if it fails
            try {
                value = BigInt(input);
            } catch {
                value = input;
            }

            // Validate mode and input type combination
            if (typeof value === "string" && mode === "sum") {
                throw new Error("SUM mode can only be used with numeric input");
            }

            // Encrypt the value
            const ciphertext = await nilql.encrypt(this.secretKey, value);

            // Return the ciphertext and secret key as JSON string
            return JSON.stringify(ciphertext);
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}

export default NilQLSecretKeyEncrypt;
