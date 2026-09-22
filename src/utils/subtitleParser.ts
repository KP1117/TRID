import { SubtitleCue } from '../types';

/**
 * Parses time string in SRT (00:01:23,456) or VTT (00:01:23.456) format to seconds.
 */
function parseTimestamp(timestamp: string): number {
  const parts = timestamp.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Parses SRT or WebVTT string into an array of SubtitleCue objects.
 */
export function parseSubtitleText(text: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  // Normalize newlines
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);

  let cueIdCounter = 1;

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    let timeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timeLineIndex = i;
        break;
      }
    }

    if (timeLineIndex === -1) continue;

    const timeLine = lines[timeLineIndex];
    const [startStr, endStr] = timeLine.split('-->');
    if (!startStr || !endStr) continue;

    const startTime = parseTimestamp(startStr.trim().split(' ')[0]);
    const endTime = parseTimestamp(endStr.trim().split(' ')[0]);

    // Subtitle text lines
    const textLines = lines.slice(timeLineIndex + 1);
    const cueText = textLines
      .join('\n')
      .replace(/<[^>]*>/g, '') // remove HTML formatting tags
      .trim();

    if (cueText && endTime > startTime) {
      cues.push({
        id: cueIdCounter++,
        startTime,
        endTime,
        text: cueText,
      });
    }
  }

  return cues;
}

/**
 * Finds the currently active subtitle cue for a given playback time and delay offset.
 */
export function getActiveCue(
  cues: SubtitleCue[],
  currentTime: number,
  delayOffset: number
): SubtitleCue | null {
  // delayOffset: positive means subtitle displayed later, negative means earlier
  const adjustedTime = currentTime - delayOffset;
  for (const cue of cues) {
    if (adjustedTime >= cue.startTime && adjustedTime <= cue.endTime) {
      return cue;
    }
  }
  return null;
}
