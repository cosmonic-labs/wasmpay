import {PartialTask, Task} from '#services/backend/types.ts';

const expandTaskFromPartial = (task: PartialTask): Task => {
  return {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: undefined,
    location: '',
    ...task,
    analyze: {
      done: false,
      error: false,
      match: false,
      ...task.analyze,
    },
    resize: {
      done: false,
      error: false,
      original: '',
      resized: '',
      ...task.resize,
    },
  };
};

export {expandTaskFromPartial};
