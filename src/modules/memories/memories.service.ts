import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events, MemoryAddedEvent } from '../../common/events';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { MemoriesRepository } from './memories.repository';

@Injectable()
export class MemoriesService {
  constructor(
    private readonly memoriesRepository: MemoriesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  findByCoupleId(coupleId: string) {
    return this.memoriesRepository.findByCoupleId(coupleId);
  }

  async create(authorId: string, dto: CreateMemoryDto) {
    const memory = await this.memoriesRepository.create({ ...dto, authorId });
    this.eventEmitter.emit(
      Events.MEMORY_ADDED,
      new MemoryAddedEvent(memory.id, memory.coupleId),
    );
    return memory;
  }
}
