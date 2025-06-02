import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { GlobalEventService } from './global-event.service';
import { CreateGlobalEventDto } from './dto/create-global-event.dto';
import { UpdateGlobalEventDto } from './dto/update-global-event.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { AdminGuard } from '../auth/guards/admin/admin.guard';


@Controller('global-events')
export class GlobalEventController {
   constructor(private readonly globalEventService: GlobalEventService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() createGlobalEventDto: CreateGlobalEventDto) {
    return this.globalEventService.create(createGlobalEventDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query('showInactive') showInactive: boolean) {
    return this.globalEventService.findAll(showInactive);
  }

  @Get('active')
  @UseGuards(AuthGuard)
  findActive() {
    return this.globalEventService.findActive();
  }

  @Get('upcoming')
  @UseGuards(AuthGuard)
  findUpcoming(@Query('days') days: number) {
    return this.globalEventService.findUpcoming(days);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.globalEventService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateGlobalEventDto: UpdateGlobalEventDto) {
    return this.globalEventService.update(id, updateGlobalEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.globalEventService.remove(id);
  }
}