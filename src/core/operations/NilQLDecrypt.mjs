/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { nilql } from "@nillion/nilql";

/**
 * NilQL Decrypt operation
 */
class NilQLDecrypt extends Operation {
    /**
     * NilQLDecrypt constructor
     */
    constructor() {
        super();

        this.name = "NilQL Decrypt";
        this.module = "Crypto";
        this.description = "Decrypts data using nilql-ts library with multi-party computation capabilities. Supports:\n\n- SUM mode: decrypts numbers from secure summation (returns single number)\n- STORE mode: decrypts strings from secure storage (returns list of strings)\n- MATCH mode: decrypts strings from secure matching (returns list of strings)";
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
                name: "Output Type",
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
        const [numNodes, keyType, outputType, mode] = args;

        try {
            // Validate mode and output type combination
            if (mode === "sum" && outputType !== "Number") {
                throw new Error("SUM mode can only output as Number");
            }

            // Create cluster configuration
            const cluster = { nodes: Array(numNodes).fill({}) };

            // Generate secret key if not already generated
            if (!this.secretKey) {
                this.secretKey = await nilql[keyType].generate(cluster, { [mode]: true });
            }

            // Parse input as JSON
            const ciphertext = JSON.parse(input);

            // Decrypt the value
            const decrypted = await nilql.decrypt(this.secretKey, ciphertext);

            // Process output based on mode
            if (mode === "sum") {
                // For sum mode, always return as number string
                return decrypted.toString();
            } else if (mode === "store" || mode === "match") {
                // For store and match modes, handle the output type
                if (outputType === "Number") {
                    return decrypted.toString();
                } else {
                    // Convert array of ASCII codes to string
                    if (Array.isArray(decrypted)) {
                        return decrypted.map(code => String.fromCharCode(code)).join("");
                    }
                    return decrypted;
                }
            } else {
                throw new Error("Invalid mode");
            }
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}

export default NilQLDecrypt;
