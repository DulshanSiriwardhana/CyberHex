/** Runs before test modules load — disable Redis blocking in unit tests. */
process.env.REDIS_DISABLED = '1';
