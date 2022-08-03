import { model } from 'mongoose';
import { paginate } from '@/models/plugins/paginate.plugin';
import { PaginatedModel } from '@/models/types';
import { Model, Schema, SchemaTypes } from 'mongoose';
import setupTestDB from '@/../tests/utils/setupTestDB';

interface IProject {
  name: string;
  tasks: ITask[];
}

interface ProjectModel extends Model<IProject>, PaginatedModel<IProject> {}

const projectSchema = new Schema<IProject, ProjectModel>({
  name: {
    type: String,
    required: true,
  },
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.plugin(paginate);

const Project = model<IProject, ProjectModel>('Project', projectSchema, 'Project', true);

interface ITask {
  name: string;
  project: string;
}

interface TaskModel extends Model<ITask>, PaginatedModel<ITask> {}

const taskSchema = new Schema<ITask, TaskModel>({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: SchemaTypes.ObjectId,
    ref: 'Project',
    required: true,
  },
});

taskSchema.plugin(paginate);
const Task = model<ITask, TaskModel>('Task', taskSchema, 'Task', true);

setupTestDB();

describe('paginate plugin', () => {
  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });
      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'project' });

      expect(taskPages.results[0].project).toHaveProperty('_id', project._id);
    });
  });
});
