/**
 * Spawns ML training child processes (testable seam).
 * @module services/trainingRunner
 */

import { spawn } from 'child_process';

/**
 * @param {string} command
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions} options
 * @returns {import('child_process').ChildProcess}
 */
export function spawnTraining(command, args, options) {
  return spawn(command, args, options);
}

export default { spawnTraining };
