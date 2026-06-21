import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes } from 'crypto';
import { CoupleLinkedEvent, Events } from '../../common/events';
import { NotFoundException } from '../../common/exceptions';
import { CreateCoupleDto, JoinCoupleDto } from './dto/create-couple.dto';
import { CouplesRepository } from './couples.repository';

@Injectable()
export class CouplesService {
  constructor(
    private readonly couplesRepository: CouplesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  findById(id: string) {
    return this.couplesRepository.findById(id);
  }

  async create(userId: string, dto: CreateCoupleDto) {
    const inviteCode = randomBytes(4).toString('hex').toUpperCase();
    return this.couplesRepository.create(dto, inviteCode, userId);
  }

  async join(userId: string, dto: JoinCoupleDto) {
    const couple = await this.couplesRepository.findByInviteCode(dto.inviteCode);
    if (!couple) {
      throw new NotFoundException('Invalid invite code');
    }

    const updated = await this.couplesRepository.linkPartner(couple.id, userId);
    this.eventEmitter.emit(
      Events.COUPLE_LINKED,
      new CoupleLinkedEvent(
        updated.id,
        updated.members.map((m: { userId: string }) => m.userId),
      ),
    );
    return updated;
  }
}
