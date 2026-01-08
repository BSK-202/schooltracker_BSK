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
import { BusesService } from './buses.service';

@Controller('admin/buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  // GET /admin/buses
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('schoolId') schoolId?: number,
    @Query('isActive') isActive?: boolean,
    @Query('hasDriver') hasDriver?: boolean,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10
  ) {
    return this.busesService.findAll({ 
      schoolId, 
      isActive, 
      hasDriver, 
      page, 
      perPage 
    });
  }

  // GET /admin/buses/available
  @Get('available')
  @HttpCode(HttpStatus.OK)
  findAvailable(@Query('schoolId') schoolId?: number) {
    return this.busesService.findAvailable(schoolId);
  }

  // GET /admin/buses/:id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.findOne(id);
  }

  // POST /admin/buses
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBusDto: any) {
    return this.busesService.create(createBusDto);
  }

  // PUT /admin/buses/:id
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusDto: any
  ) {
    return this.busesService.update(id, updateBusDto);
  }

  // PATCH /admin/buses/:id/assign-driver
  @Patch(':id/assign-driver')
  @HttpCode(HttpStatus.OK)
  assignDriver(
    @Param('id', ParseIntPipe) id: number,
    @Body('driverId') driverId: number
  ) {
    return this.busesService.assignDriver(id, driverId);
  }

  // PATCH /admin/buses/:id/remove-driver
  @Patch(':id/remove-driver')
  @HttpCode(HttpStatus.OK)
  removeDriver(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.removeDriver(id);
  }

  // DELETE /admin/buses/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.remove(id);
  }
}