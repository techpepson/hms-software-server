/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { EmailService, EjsService } from './index';

@Module({
  imports: [],
  controllers: [],
  providers: [EmailService, EjsService],
  exports: [EmailService, EjsService],
})
export class EmailModule {}
