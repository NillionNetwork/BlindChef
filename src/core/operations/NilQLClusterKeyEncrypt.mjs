/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { nilql } from "@nillion/nilql";

/**
 * NilQL Cluster Key Encrypt operation
 */
class NilQLClusterKeyEncrypt extends Operation {
    /**
     * NilQLClusterKeyEncrypt constructor
     */
    constructor() {
        super();

        this.name = "NilQL Cluster Key Encrypt";
        this.module = "Crypto";
        this.description = "Encrypts data using nilql-ts library with multi-party computation capabilities. Supports:\n\n- SUM mode: encrypts numbers for secure summation (numbers only)\n- STORE mode: encrypts strings for secure storage";
        this.infoURL = "https://github.com/NillionNetwork/nilql-ts";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Number of Nodes",
                type: "number",
                value: 3
            },
            // {"material":[4226881370,1356085281,2329232282],"cluster":{"nodes":[{},{},{}]},"operations":{"sum":true}}
            {
                name: "Mode",
                type: "option",
                value: ["sum", "store"]
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
        const [numNodes, mode] = args;

        try {
            // Create cluster configuration
            const cluster = { nodes: Array(numNodes).fill({}) };

            // Generate secret key if not already generated
            if (!this.secretKey) {
                this.secretKey = await nilql["ClusterKey"].generate(cluster, { [mode]: true });
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

            // Return the ciphertext as JSON string
            return JSON.stringify(ciphertext);
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}

export default NilQLClusterKeyEncrypt;
