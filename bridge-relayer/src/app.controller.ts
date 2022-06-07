import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransferStatus } from './transfers/types';
import { TransferService } from './transfers/transfer.service';

import pkg from '../package.json';

@Controller('/')
export class AppController {
  @Get('/health')
  health(): any {
    return {
      name: pkg.name,
      version: pkg.version,
      env: process.env.ENVIRONMENT,
      up: process.uptime(),
      message: 'OK',
    };
  }
}
