import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateCreatedEvent, Events } from '../../common/events';
import { CreateDatePlanDto } from './dto/create-date-plan.dto';
import { DatesRepository } from './dates.repository';

@Injectable()
export class DatesService {
  constructor(
    private readonly datesRepository: DatesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  findByCoupleId(coupleId: string) {
    return this.datesRepository.findByCoupleId(coupleId);
  }

  findById(id: string) {
    return this.datesRepository.findById(id);
  }

  async create(createdById: string, dto: CreateDatePlanDto) {
    const datePlan = await this.datesRepository.create({ ...dto, createdById });
    this.eventEmitter.emit(
      Events.DATE_CREATED,
      new DateCreatedEvent(datePlan.id, datePlan.coupleId),
    );
    return datePlan;
  }
}
