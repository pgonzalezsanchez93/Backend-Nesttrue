import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateGlobalEventDto } from './dto/create-global-event.dto';
import { UpdateGlobalEventDto } from './dto/update-global-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { GlobalEvent } from './entities/global-event.entity';
import { Model } from 'mongoose';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../cozyApp/src/environments/environments';

@Injectable()
export class GlobalEventService {
    
  constructor(
    @InjectModel(GlobalEvent.name)
    private readonly globalEventModel: Model<GlobalEvent>
  ) {}

  async create(createGlobalEventDto: CreateGlobalEventDto) {
    try {
      
      if (new Date(createGlobalEventDto.startDate) > new Date(createGlobalEventDto.endDate)) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      const globalEvent = new this.globalEventModel(createGlobalEventDto);
      await globalEvent.save();
      return globalEvent;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(showInactive: boolean = false) {
    const query = showInactive ? {} : { isActive: true };
    return this.globalEventModel.find(query).sort({ startDate: 1 });
  }

  async findActive() {
    const now = new Date();
    return this.globalEventModel.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: 1 });
  }

  async findUpcoming(days: number = 30) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    return this.globalEventModel.find({
      isActive: true,
      startDate: { $gte: now, $lte: future }
    }).sort({ startDate: 1 });
  }

  async findOne(id: string) {
    const globalEvent = await this.globalEventModel.findById(id);
    if (!globalEvent) {
      throw new NotFoundException(`Global event with id ${id} not found`);
    }
    return globalEvent;
  }

  async update(id: string, updateGlobalEventDto: UpdateGlobalEventDto) {
    try {
      
      if (updateGlobalEventDto.startDate && updateGlobalEventDto.endDate) {
        if (new Date(updateGlobalEventDto.startDate) > new Date(updateGlobalEventDto.endDate)) {
          throw new BadRequestException('Start date must be before or equal to end date');
        }
      } else if (updateGlobalEventDto.startDate) {
        
        const event = await this.findOne(id);
        if (new Date(updateGlobalEventDto.startDate) > new Date(event.endDate)) {
          throw new BadRequestException('Start date must be before or equal to end date');
        }
      } else if (updateGlobalEventDto.endDate) {
        
        const event = await this.findOne(id);
        if (new Date(event.startDate) > new Date(updateGlobalEventDto.endDate)) {
          throw new BadRequestException('Start date must be before or equal to end date');
        }
      }

      const globalEvent = await this.globalEventModel.findByIdAndUpdate(
        id,
        updateGlobalEventDto,
        { new: true }
      );

      if (!globalEvent) {
        throw new NotFoundException(`Global event with id ${id} not found`);
      }

      return globalEvent;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const globalEvent = await this.globalEventModel.findByIdAndDelete(id);
    if (!globalEvent) {
      throw new NotFoundException(`Global event with id ${id} not found`);
    }
    return { message: 'Global event deleted successfully' };
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Global event already exists in the database ${JSON.stringify(error.keyValue)}`);
    }
    if (error.status === 400 || error.status === 404) {
      throw error;
    }
    console.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}