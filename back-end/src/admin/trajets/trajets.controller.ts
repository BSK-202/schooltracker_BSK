// src/admin/trajets/trajets.controller.ts
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
  ParseIntPipe,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { TrajetsService } from './trajets.service';
import { CreateTrajetDto } from './dto/create-trajet.dto';
import { UpdateTrajetDto } from './dto/update-trajet.dto';
import { TypeTrajet } from './entities/trajet.entity';

@Controller('admin/trajets')
export class TrajetsController {
  constructor(private readonly trajetsService: TrajetsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('busId') busId?: number,
    @Query('schoolId') schoolId?: number,
    @Query('type') type?: TypeTrajet,
    @Query('isActif') isActif?: boolean,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10
  ) {
    return this.trajetsService.findAll({ 
      busId,
      schoolId,
      type, 
      isActif, 
      page, 
      perPage 
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trajetsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createTrajetDto: CreateTrajetDto) {
    return this.trajetsService.create(createTrajetDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrajetDto: UpdateTrajetDto
  ) {
    return this.trajetsService.update(id, updateTrajetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trajetsService.remove(id);
  }
}