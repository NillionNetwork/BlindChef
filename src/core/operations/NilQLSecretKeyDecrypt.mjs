/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { nilql } from "@nillion/nilql";

/**
 * NilQL Secret Key Decrypt operation
 */
class NilQLSecretKeyDecrypt extends Operation {
    /**
     * NilQLSecretKeyDecrypt constructor
     */
    constructor() {
        super();

        this.name = "NilQL Secret Key Decrypt";
        this.module = "Crypto";
        this.description = "Decrypts data using nilql-ts library with multi-party computation capabilities. Supports:\n\n- SUM mode: decrypts numbers from secure summation (returns single number)\n- STORE mode: decrypts strings from secure storage (returns list of strings)";
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
                value: ["sum", "store"]
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

            // Parse input as JSON
            const ciphertext = JSON.parse(input);

            // Decrypt the value
            const decrypted = await nilql.decrypt(this.secretKey, ciphertext);

            return decrypted.toString();
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}

export default NilQLSecretKeyDecrypt;
