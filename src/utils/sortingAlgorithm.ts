import { WorkerService } from '../types';

/**
 * Smart Sorting Algorithm for Gram Seva Business Directory
 * 
 * Hierarchy:
 * - Priority 1: Paid PRO members (isPaid === true) sorted by Highest Rating (descending), then jobsDone / reviewsCount
 * - Priority 2: Free verified / standard members (isPaid === false or undefined) sorted by Highest Rating (descending)
 * - Priority 3: All other listings
 */
export function sortWorkersBySmartPriority(workers: WorkerService[]): WorkerService[] {
  if (!workers || !Array.isArray(workers)) return [];

  // Group 1: Paid PRO Members
  const paidProWorkers = workers.filter((w) => Boolean(w.isPaid));
  
  // Group 2: Free Registered Members with rating / verification
  const freeWorkers = workers.filter((w) => !w.isPaid);

  // Sorter function: Higher rating first, then more jobs / reviews
  const ratingComparator = (a: WorkerService, b: WorkerService): number => {
    // 1. Highest Rating
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (Math.abs(ratingDiff) > 0.001) {
      return ratingDiff;
    }
    // 2. Reviews / Jobs done
    const jobsDiff = (b.jobsDone || b.reviewsCount || 0) - (a.jobsDone || a.reviewsCount || 0);
    if (jobsDiff !== 0) {
      return jobsDiff;
    }
    // 3. Experience years
    const expDiff = (b.experienceYears || 0) - (a.experienceYears || 0);
    if (expDiff !== 0) {
      return expDiff;
    }
    // 4. Verification priority
    if (a.isVerified !== b.isVerified) {
      return a.isVerified ? -1 : 1;
    }
    return 0;
  };

  paidProWorkers.sort(ratingComparator);
  freeWorkers.sort(ratingComparator);

  return [...paidProWorkers, ...freeWorkers];
}

/**
 * Normalized string matching helper for multilingual search (Hindi, English, Hinglish)
 */
export function normalizeText(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}
