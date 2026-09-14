/**
 * Centralized JWT secret configuration.
 * The server will refuse to start if JWT_SECRET is not set in the environment.
 * This prevents the silent security failure of falling back to a hardcoded string.
 */

if (!process.env.JWT_SECRET) {
  throw new Error(
    "[FATAL] JWT_SECRET environment variable is not set. " +
    "Set it in your .env file before starting the server."
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = { JWT_SECRET };
