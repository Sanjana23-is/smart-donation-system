const dotenv = require('dotenv');
const path = require('path');

// Try loading default
const result = dotenv.config();

console.log("--- DEBUGGING ENV VARIABLES ---");
console.log("Current Working Directory:", process.cwd());
console.log("Dotenv Config Result Error:", result.error ? result.error.message : "None");

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_PASS;

console.log("GMAIL_USER exists:", !!user);
if (user) console.log("GMAIL_USER length:", user.length);

console.log("GMAIL_PASS exists:", !!pass);
if (pass) console.log("GMAIL_PASS length:", pass.length);

// Try explicit path if default failed or variables missing
if (!user || !pass) {
    console.log("\n--- TRYING EXPLICIT PATH ---");
    const envPath = path.join(__dirname, '../.env');
    console.log("Targeting .env at:", envPath);
    const result2 = dotenv.config({ path: envPath });

    console.log("Dotenv (Explicit) Error:", result2.error ? result2.error.message : "None");
    console.log("GMAIL_USER (Explicit) exists:", !!process.env.GMAIL_USER);
    console.log("GMAIL_PASS (Explicit) exists:", !!process.env.GMAIL_PASS);
}
