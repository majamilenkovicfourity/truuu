export interface VideoConfig {
  id: string;
  startThreshold: number;
  endThreshold: number;
  vimeoId: string;
  wasClosed: boolean;
  isPlaying: boolean;
}

export const videos: VideoConfig[] = [
  {
    id: 'video1',
    startThreshold: 0.11795894797627172,
    endThreshold: 0.12221113969237231,
    vimeoId: '358401068',
    wasClosed: false,
    isPlaying: false
  },
  {
    id: 'video2',
    startThreshold: 0.24005486968449932,
    endThreshold: 0.26376399261630173,
    vimeoId: '358401068',
    wasClosed: false,
    isPlaying: false
  },
  {
    id: 'video3',
    startThreshold: 0.7203170248437738,
    endThreshold: 0.727091059967146,
    vimeoId: '358401068',
    wasClosed: false,
    isPlaying: false
  },
  {
    id: 'video4',
    startThreshold: 0.90829649951735,
    endThreshold: 0.9269250961066233,
    vimeoId: '358401068',
    wasClosed: false,
    isPlaying: false
  }
];