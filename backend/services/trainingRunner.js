import { spawn } from 'child_process';

export function spawnTraining(command, args, options) {
  return spawn(command, args, options);
}

export default { spawnTraining };
