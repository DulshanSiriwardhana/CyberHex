/**
 * ML training job metadata — Redis with in-memory fallback.
 * Process handles stay in mlService; this store is for status/metrics persistence.
 *
 * @module services/jobStore
 */

import { cacheGet, cacheSet, cacheDel, isRedisAvailable } from './cacheService.js';
import logger from '../utils/logger.js';

const JOB_PREFIX = 'ml:job:';
const JOB_TTL_SECONDS = 60 * 60 * 24; // 24h

/** @type {Map<string, object>} */
const memoryJobs = new Map();

function jobKey(experimentId) {
  return `${JOB_PREFIX}${experimentId}`;
}

/**
 * @param {string} experimentId
 * @param {object} snapshot Serializable job state (no process reference)
 */
export async function saveJobSnapshot(experimentId, snapshot) {
  const key = jobKey(experimentId);
  const payload = { ...snapshot, updatedAt: new Date().toISOString() };
  memoryJobs.set(experimentId, payload);
  await cacheSet(key, payload, JOB_TTL_SECONDS);
}

/**
 * @param {string} experimentId
 * @returns {Promise<object|null>}
 */
export async function getJobSnapshot(experimentId) {
  if (memoryJobs.has(experimentId)) {
    return memoryJobs.get(experimentId);
  }
  return cacheGet(jobKey(experimentId));
}

/**
 * @param {string} experimentId
 */
export async function deleteJobSnapshot(experimentId) {
  memoryJobs.delete(experimentId);
  await cacheDel(jobKey(experimentId));
}

/**
 * @returns {Promise<object[]>}
 */
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
