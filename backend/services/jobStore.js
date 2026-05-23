import { cacheGet, cacheSet, cacheDel, isRedisAvailable } from './cacheService.js';
import logger from '../utils/logger.js';

const JOB_PREFIX = 'ml:job:';
const JOB_TTL_SECONDS = 60 * 60 * 24;

const memoryJobs = new Map();

function jobKey(experimentId) {
  return `${JOB_PREFIX}${experimentId}`;
}

export async function saveJobSnapshot(experimentId, snapshot) {
  const key = jobKey(experimentId);
  const payload = { ...snapshot, updatedAt: new Date().toISOString() };
  memoryJobs.set(experimentId, payload);
  await cacheSet(key, payload, JOB_TTL_SECONDS);
}

export async function getJobSnapshot(experimentId) {
  if (isRedisAvailable()) {
    const cached = await cacheGet(jobKey(experimentId));
    if (cached) return cached;
  }
  return memoryJobs.get(experimentId) || null;
}

export async function deleteJobSnapshot(experimentId) {
  memoryJobs.delete(experimentId);
  await cacheDel(jobKey(experimentId));
}

export async function listJobSnapshots() {
  const local = Array.from(memoryJobs.entries()).map(([experimentId, job]) => ({
    experimentId,
    ...job,
  }));
  return local;
}

export function isJobStoreRedisBacked() {
  return isRedisAvailable();
}

export async function clearAllJobSnapshots() {
  memoryJobs.clear();
  logger.debug('In-memory ML job snapshots cleared');
}

export default {
  saveJobSnapshot,
  getJobSnapshot,
  deleteJobSnapshot,
  listJobSnapshots,
  isJobStoreRedisBacked,
  clearAllJobSnapshots,
};
