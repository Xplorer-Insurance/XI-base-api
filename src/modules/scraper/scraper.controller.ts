import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('scrape')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // Endpoint 3: Usando GET simple para obtener datos de la URL
  // @Get('simple-get/:url')
  // async scrapeSimpleGet(@Param('url') url: string) {
  //   const decodedUrl = decodeURIComponent(url);  // Decodifica la URL
  //   return this.scraperService.scrapeSimpleGet(decodedUrl);
  // }
  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Sube y procesa un archivo CSV' })
  @ApiResponse({ status: 200, description: 'Archivo procesado con éxito' })
  @ApiResponse({ status: 400, description: 'No se subió ningún archivo' })
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    console.log('Archivo recibido:', file);
    
    if (!file) {
      return { message: 'No file uploaded' };
    }

    return this.scraperService.processCsv(file);
  }

  @Get('scrape-and-extract/:url')
  async scrapeData(@Param('url') url: string) {
    const decodedUrl = decodeURIComponent(url);
    console.log(decodedUrl);
    const extractedData = await this.scraperService.scrapeAndExtractData(decodedUrl);
    return extractedData;
  }

  // buscar en google un email
  // @Get('search-email/:email')
  // async searchGoogleByEmail(@Param('email') email: string) {
  //   return await this.scraperService.searchGoogle(email);
  // }

  // buscar data publica
  // @Get('search-public-data/:email')
  // async searchPublicData(@Param('email') email: string) {
  //   return await this.scraperService.searchPublicData(email);
  // }

  // @Get('search-clearbit/:email')
  // async getClearbitData(@Param('email') email: string) {
  //   return await this.scraperService.getClearbitData(email);
  // }

  // @Get('search-google-by-email/:email')
  // async searchByEmail(@Param('email') email: string) {
  //   return await this.scraperService.searchByEmail(email);
  // }
}
