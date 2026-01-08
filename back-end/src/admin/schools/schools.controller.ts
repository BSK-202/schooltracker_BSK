import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe
} from '@nestjs/common';
import { SchoolsService } from './schools.service';

@Controller('admin/schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  // GET /admin/schools
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10
  ) {
    return this.schoolsService.findAll(page, perPage);
  }

  // GET /admin/schools/:id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schoolsService.findOne(id);
  }

  // GET /admin/schools/:id/buses - Récupérer les bus d'une école
  @Get(':id/buses')
  @HttpCode(HttpStatus.OK)
  getSchoolBuses(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10
  ) {
    return this.schoolsService.getSchoolBuses(id, page, perPage);
  }

  // GET /admin/schools/:id/drivers - Récupérer les chauffeurs d'une école
  @Get(':id/drivers')
  @HttpCode(HttpStatus.OK)
  getSchoolDrivers(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10
  ) {
    return this.schoolsService.getSchoolDrivers(id, page, perPage);
  }

  // POST /admin/schools
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSchoolDto: any) {
    return this.schoolsService.create(createSchoolDto);
  }

  // PUT /admin/schools/:id
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSchoolDto: any) {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  // DELETE /admin/schools/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schoolsService.remove(id);
  }
}