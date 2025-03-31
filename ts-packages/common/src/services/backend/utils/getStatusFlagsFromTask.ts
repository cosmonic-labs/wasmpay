import {PartialTask} from '#services/backend/types.ts';

export function getStatusFlagsFromTask(task?: PartialTask) {
  return {
    isUploaded: typeof task !== 'undefined',
    isResized: task?.resize?.done,
    isAnalyzed: task?.analyze?.done,
    isComplete: task?.resize?.done && task?.analyze?.done,
    isMatch: task?.analyze?.match,
  };
}
