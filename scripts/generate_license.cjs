const crypto = require('crypto');

// Configuration (must match client-side logic)
const SALT = "GEAR-TRACE-SECRET-SALT-2026";

function generateLicense() {
    // 1. Generate 12 random alphanumeric characters (Payload)
    // Using uppercase formatting to match client expectations
    const payload = crypto.randomBytes(6).toString('hex').toUpperCase();

    // 2. Create Signature
    const data = payload + SALT;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    const signature = hash.substring(0, 4).toUpperCase(); // First 4 chars

    // 3. Combine
    const key = payload + signature;

    // 4. Format as XXXX-XXXX-XXXX-XXXX
    const formatted = key.match(/.{1,4}/g).join('-');

    return formatted;
}

// Generate and output
const license = generateLicense();
console.log("\n========================================");
console.log("  GearTrace Pro License Generator");
console.log("========================================");
console.log(`\nGenerated Key: \x1b[32m${license}\x1b[0m\n`);
console.log("========================================\n");
