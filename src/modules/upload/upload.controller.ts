import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CreateMediaDto } from './dto';
import { MediaType } from './enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { RoleType } from '../auth/enum';
import { ResTransformInterceptor } from 'src/shared/interceptor';

@UseInterceptors(ResTransformInterceptor)
@Roles(RoleType.ADMIN)
@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const typeFileArr = file.mimetype.split("/")
    const data: CreateMediaDto = {
      url: file.path.replace("public", ""),
      type: typeFileArr[0] == "image" ? MediaType.PHOTO : MediaType.VIDEO,
    };
    return this.uploadService.create(data);
  }
}
