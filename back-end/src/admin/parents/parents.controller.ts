// src/parents/parents.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param,
  Body, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Controller('admin/parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  /**
   * GET /parents
   * Récupérer tous les parents
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.parentsService.findAll();
  }

  /**
   * GET /parents/:id
   * Récupérer un parent spécifique
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.findOne(id);
  }

  /**
   * POST /parents
   * Créer un nouveau parent
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createParentDto: CreateParentDto) {
    return this.parentsService.create(createParentDto);
  }

  /**
   * PUT /parents/:id
   * Modifier un parent
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParentDto: UpdateParentDto
  ) {
    return this.parentsService.update(id, updateParentDto);
  }

  /**
   * DELETE /parents/:id
   * Supprimer un parent
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.remove(id);
  }

  /**
   * POST /parents/:id/reset-password
   * Réinitialiser le mot de passe d'un parent
   */
  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.parentsService.resetPassword(id);
  }
}