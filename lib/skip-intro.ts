/**
 * IITM lectures open with a branded bumper. Aceon has no per-video intro
 * timestamps, so skip-intro uses a user-chosen duration from settings.
 */

export function isInIntro(currentTime: number, introSeconds: number, duration: number): boolean {
  if (!Number.isFinite(currentTime) || currentTime < 0) return false;
  if (!Number.isFinite(introSeconds) || introSeconds <= 0) return false;
  // Never treat the whole clip as an intro.
  if (Number.isFinite(duration) && duration > 0 && duration <= introSeconds + 1) return false;
  return currentTime < introSeconds;
}

export function introSkipTarget(introSeconds: number, duration: number): number {
  if (Number.isFinite(duration) && duration > 0) {
    return Math.min(introSeconds, Math.max(0, duration - 1));
  }
  return Math.max(0, introSeconds);
}

export function shouldAutoSkipIntro({
  autoSkip,
  alreadyAutoSkipped,
  currentTime,
  introSeconds,
  duration,
}: {
  autoSkip: boolean;
  alreadyAutoSkipped: boolean;
  currentTime: number;
  introSeconds: number;
  duration: number;
}): boolean {
  return autoSkip && !alreadyAutoSkipped && isInIntro(currentTime, introSeconds, duration);
}
