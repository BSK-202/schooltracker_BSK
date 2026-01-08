// src/admin/drivers/drivers.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch, 
  Param, 
  Body, 
  Query, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe
} from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('admin/drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // GET /admin/drivers
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
 @Query('schoolId') schoolId?: number,
  @Query('licencePlate') licencePlate?: string,
  @Query('page') page: number = 1,
  @Query('perPage') perPage: number = 10
  ) {
    return this.driversService.findAll({ schoolId, licencePlate, page, perPage });
  }

  // GET /admin/drivers/:id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOne(id);
  }

  // POST /admin/drivers
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDriverDto: any) {
    return this.driversService.create(createDriverDto);
  }

  // PUT /admin/drivers/:id
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDriverDto: any
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  // PATCH /admin/drivers/:id/reset-password (manuel)
  @Patch(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string
  ) {
    return this.driversService.resetPassword(id, newPassword);
  }

  // PATCH /admin/drivers/:id/generate-password (auto)
  @Patch(':id/generate-password')
  @HttpCode(HttpStatus.OK)
  generateNewPassword(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.generateNewPassword(id);
  }

  // DELETE /admin/drivers/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.remove(id);
  }
}