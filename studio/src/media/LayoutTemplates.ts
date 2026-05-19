/**
 * CyberHex Studio — Layout Templates
 */
import { LayoutTemplateType, type LayoutTemplate } from '@/types';

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'zoom_grid',
    name: 'Zoom Grid',
    type: LayoutTemplateType.ZOOM_GRID,
    thumbnail: '',
    gridCols: 3,
    gridRows: 3,
    defaultPositions: {},
  },
  {
    id: 'zoom_speaker',
    name: 'Speaker Focus',
    type: LayoutTemplateType.ZOOM_SPEAKER,
    thumbnail: '',
    gridCols: 1,
    gridRows: 2,
    defaultPositions: {},
  },
  {
    id: 'streamer',
    name: 'Streamer',
    type: LayoutTemplateType.STREAMER,
    thumbnail: '',
    gridCols: 2,
    gridRows: 1,
    defaultPositions: {},
  },
  {
    id: 'presenter',
    name: 'Presenter',
    type: LayoutTemplateType.PRESENTER,
    thumbnail: '',
    gridCols: 2,
    gridRows: 2,
    defaultPositions: {},
  },
  {
    id: 'interview',
    name: 'Interview',
    type: LayoutTemplateType.INTERVIEW,
    thumbnail: '',
    gridCols: 2,
    gridRows: 1,
    defaultPositions: {},
  },
  {
    id: 'classroom',
    name: 'Classroom',
    type: LayoutTemplateType.CLASSROOM,
    thumbnail: '',
    gridCols: 4,
    gridRows: 3,
    defaultPositions: {},
  },
  {
    id: 'podcast',
    name: 'Podcast',
    type: LayoutTemplateType.PODCAST,
    thumbnail: '',
    gridCols: 3,
    gridRows: 1,
    defaultPositions: {},
  },
  {
    id: 'cinematic',
    name: 'AI Cinematic',
    type: LayoutTemplateType.CINEMATIC,
    thumbnail: '',
    gridCols: 1,
    gridRows: 1,
    defaultPositions: {},
  },
];
