// src/admin/stops/stops.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param,
  Query, 
  Body, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { StopsService } from './stops.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { UpdateStopDto } from './dto/update-stop.dto';

@Controller('admin/stops')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  /**
   * GET /admin/stops
   * Récupérer tous les arrêts
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.stopsService.findAll();
  }

  /**
   * GET /admin/stops/search
   * Rechercher des arrêts par adresse
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  search(@Query('q') query: string) {
    return this.stopsService.search(query);
  }

  /**
   * GET /admin/stops/available
   * Récupérer les arrêts disponibles (non utilisés)
   */
  @Get('available')
  @HttpCode(HttpStatus.OK)
  findAvailable() {
    return this.stopsService.findAvailableStops();
  }

  /**
   * GET /admin/stops/:id
   * Récupérer un arrêt spécifique
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stopsService.findOne(id);
  }

  /**
   * POST /admin/stops
   * Créer un nouvel arrêt
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createStopDto: CreateStopDto) {
    return this.stopsService.create(createStopDto);
  }

  /**
   * PUT /admin/stops/:id
   * Modifier un arrêt
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStopDto: UpdateStopDto
  ) {
    return this.stopsService.update(id, updateStopDto);
  }

  /**
   * DELETE /admin/stops/:id
   * Supprimer un arrêt
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stopsService.remove(id);
  }
}