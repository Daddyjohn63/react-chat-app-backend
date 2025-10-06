import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractEntity } from './abstract.entity';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

//the abstract class extends the abstract entity
//it is used to interact with the database
//it is also used to interact with the API
//it is also used to interact with the UI

//An abstract class is a class that cannot be instantiated on its own and is meant to be subclassed. It can contain both fully implemented methods and abstract methods (methods without implementation). Abstract methods must be implemented by any non-abstract subclass.
export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;

  //to be able to interact with the database, we need to pass in the model
  constructor(protected readonly model: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as unknown as T;
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    const document = await this.model.findOne(filterQuery).lean<T>();

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }

    return document;
  }
  async findOneAndUpdate(filterQuery: FilterQuery<T>, update: UpdateQuery<T>): Promise<T> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<T>();

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  //Find all documents that match the filter query
  async find(filterQuery: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filterQuery).lean<T[]>();
  }
  //Delete one document that matches the filter query
  async findOneAndDelete(filterQuery: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filterQuery).lean<T>();
  }
}
