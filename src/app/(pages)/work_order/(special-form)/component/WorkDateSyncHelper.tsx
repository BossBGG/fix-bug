import { Assignee, WorkOrderObj } from '@/types';

export const syncExecutionToWorkers = (
  date: Date | undefined,
  workers: Assignee[],
  data: WorkOrderObj,
  setData: (data: WorkOrderObj) => void,
  dateType: 'start' | 'end'
) => {
  if (workers.length === 0) return;

  const updatedWorkers = workers.map(worker => ({
    ...worker,
    ...(dateType === 'start' && { startDatetime: date }),
    ...(dateType === 'end' && { endDatetime: date })
  }));

  setData({
    ...data,
    startWorkDate: dateType === 'start' ? date : data.startWorkDate,
    endWorkDate: dateType === 'end' ? date : data.endWorkDate,
    assignees: updatedWorkers
  });
};

export const syncWorkersToExecution = (
  workers: Assignee[],
  data: WorkOrderObj,
  setData: (data: WorkOrderObj) => void
) => {

  const resMinMax = workerMinMaxWorkDate(workers)

  setData({
    ...data,
    startWorkDate: resMinMax?.minStartDate,
    endWorkDate: resMinMax?.maxEndDate
  });
};

export const workerMinMaxWorkDate = (workers: Assignee[]) => {
  const validStartDates = workers
    .map(w => w.startDatetime)
    .filter(d => d)
    .map(d => new Date(d as Date | string))
    .filter(d => !isNaN(d.getTime()));

  const validEndDates = workers
    .map(w => w.endDatetime)
    .filter(d => d)
    .map(d => new Date(d as Date | string))
    .filter(d => !isNaN(d.getTime()));

  const minStartDate = validStartDates.length > 0
    ? new Date(Math.min(...validStartDates.map(d => d.getTime())))
    : undefined;

  const maxEndDate = validEndDates.length > 0
    ? new Date(Math.max(...validEndDates.map(d => d.getTime())))
    : undefined;

  return {
    minStartDate,
    maxEndDate
  }
}
