// src/students/students.controller.ts
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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('admin/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * GET /students
   * Récupérer tous les élèves
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.studentsService.findAll();
  }

  /**
   * GET /students/:id
   * Récupérer un élève spécifique
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  /**
   * GET /students/qr/:qrCode
   * Rechercher un élève par QR code
   */
  @Get('qr/:qrCode')
  @HttpCode(HttpStatus.OK)
  findByQrCode(@Param('qrCode') qrCode: string) {
    return this.studentsService.findByQrCode(qrCode);
  }

  /**
   * GET /students/search
   * Rechercher des élèves par nom
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  searchByName(@Query('q') query: string) {
    return this.studentsService.searchByName(query);
  }

  /**
   * POST /students
   * Créer un nouvel élève
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  /**
   * PUT /students/:id
   * Modifier un élève
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  /**
   * DELETE /students/:id
   * Supprimer un élève
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}