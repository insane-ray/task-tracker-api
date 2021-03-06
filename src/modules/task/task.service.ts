import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository, UpdateResult } from 'typeorm';
import { Task, TaskStatusType } from './task.entity';
import { DateHelper } from '../../shared/helpers/date.helper';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TaskFlowService } from './task-flow.service';

@Injectable()
export class TaskService {

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private taskFlowService: TaskFlowService
  ) {}

  async get(uuid: string): Promise<Task> {
    return await this.taskRepository.findOne({
      where: {id: uuid},
      relations: ['project', 'executor', 'checker', 'author',
        'taskComments', 'taskComments.author',
        'taskTrackedTime', 'taskTrackedTime.author'],
    });
  }

  async getAll(): Promise<Task[]> {
    return await this.taskRepository.find(
      { relations: ['project', 'executor', 'checker', 'author'], });
  }

  // TODO
  // async getUserTasks(projectUuid: string, userUuid: string): Promise<Project[]> {
  //   return await this.projectRepository
  //     .createQueryBuilder('project')
  //     .leftJoinAndSelect("project.tasks", "task")
  //     .leftJoinAndSelect("task.executor", "executor")
  //     .leftJoinAndSelect("task.checker", "checker")
  //     .where("project.id = :id", { id: projectUuid })
  //     .orWhere("executor.id = :executorId", { executorId: userUuid })
  //     .orWhere("checker.id = :checkerId", { checkerId: userUuid })
  //     .getMany();
  // }

  async getUserTrackedTime(userUuid: string): Promise<Task[]> {
    return await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect("task.taskTrackedTime", "taskTrackedTime")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("taskTrackedTime.author", "author")
      .where("author.id = :id", { id: userUuid })
      .getMany();
  }

  async create(task: CreateTaskDto): Promise<InsertResult> {
    return await this.taskRepository.insert(task)
  }

  async update(task: UpdateTaskDto, projectUuid: string): Promise<UpdateResult> {
    return await this.taskRepository.update(projectUuid, task)
  }

  async updateStatus(status: UpdateTaskStatusDto, taskUuid: string): Promise<UpdateResult | boolean> {
    const task = await this.taskRepository.findOne(taskUuid);
    const newStatus = status.newStatus;

    if(task && this.taskFlowService.isAvailableNextStatus(task.status, newStatus)) {
      return await this.taskRepository.update(taskUuid, {
        status: newStatus,
        startedAt: (newStatus === TaskStatusType.inWork) ? DateHelper.formatToDbDateTime(new Date()) : task.startedAt,
        executedAt: (newStatus === TaskStatusType.completed) ? DateHelper.formatToDbDateTime(new Date()) : task.executedAt
      })
    }

    return false;
  }
}
