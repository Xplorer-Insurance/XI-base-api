import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { promisify } from 'util';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const writeFileAsync = promisify(fs.writeFile);
const unlinkFileAsync = promisify(fs.unlink);

@Injectable()
export class ScraperService {
  constructor(
    private usersService: UsersService
  ) {}


  async getClearbitData(email: string) {
    const apiKey = '8978d3561ff963766b90a7af1e89678fff676f0c';  // Requiere suscripción a Clearbit
    const url = `https://api.hunter.io/v2/people/find?email=${email}&api_key=${apiKey}`;
  
    const response = await axios.get(url);
    return response.data;
  }

  async scrapeAndExtractData(url: string) {
    try {
      // Realizamos el scraping con un GET simple
      const response = await axios.get(url);
      // Cargamos el HTML en Cheerio para extraer información
      const $ = cheerio.load(response.data);

      // Aquí puedes ajustar el selector para extraer la información que necesitas
      // Ejemplo: Extraer todos los títulos de los artículos
      const titles: string[] = [];
      $('h2.article-title').each((index, element) => {
        titles.push($(element).text().trim());
      });

      const images = [];
      $('img').each((index, element) => {
        images.push($(element).attr('src'));  // Extrae la URL de cada imagen
      });

      return await this.scrapeSocialMedia(url);
      if (titles.length > 0 || images.length > 0) {
        return { titles, images };
      } else {
        // Si no encontramos los datos, usamos Puppeteer
        console.log('No se encontraron datos estáticos, intentando con Puppeteer...');
      }

      // Puedes devolver el array de títulos o cualquier otra información que necesites
      return {titles, images};
    } catch (error) {
      console.error('Error extracting data with Cheerio:', error);
      throw new Error('Error extracting data with Cheerio');
    }
  }

  async scrapeSocialMedia(url: string) {
    if (url.includes('instagram.com')) {
      return await this.scrapeInstagram(url);
    } else if (url.includes('facebook.com')) {
      return await this.scrapeFacebook(url);
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return await this.scrapeTwitter(url);
    } else {
      throw new Error('Plataforma no soportada');
    }
  }
  
  // ✅ Instagram Scraper
  private async scrapeInstagram(url: string) {
    console.log(`Scraping Instagram: ${url}`);
  
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
  
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
  
    await page.waitForSelector('header');
  
    const profileData = await page.evaluate(() => {
      const getMetaContent = (property: string) => 
        document.querySelector(`meta[property="${property}"]`)?.getAttribute('content') || null;
  
      const bioText = (document.querySelector('header section div span') as HTMLElement)?.innerText || 'No encontrado';
      const emailMatch = bioText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      return {
        platform: 'Instagram',
        username: (document.querySelector('header h2, header h1') as HTMLElement)?.innerText || 'No encontrado',
        bio: bioText,
        email: emailMatch ? emailMatch[0] : 'No encontrado',
        profileImage: getMetaContent('og:image') || 'No encontrado',
        images: Array.from(document.querySelectorAll('article img'))
                    .map(img => (img as HTMLImageElement).src)
                    .slice(0, 10)  
      };
    });
  
    await browser.close();
    return profileData;
  }
  
  // ✅ Facebook Scraper
  private async scrapeFacebook(url: string) {
    console.log(`Scraping Facebook: ${url}`);
  
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
  
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
  
    await page.waitForSelector('meta[property="og:title"]');
  
    const profileData = await page.evaluate(() => {
      const getMetaContent = (property: string) => 
        document.querySelector(`meta[property="${property}"]`)?.getAttribute('content') || 'No encontrado';
  
      return {
        platform: 'Facebook',
        username: getMetaContent('og:title'),
        profileImage: getMetaContent('og:image'),
        bio: 'No disponible en Facebook',
        email: 'No disponible',
        images: Array.from(document.querySelectorAll('img'))
                    .map(img => (img as HTMLImageElement).src)
                    .slice(0, 10)  
      };
    });
  
    await browser.close();
    return profileData;
  }
  
  // Scrape twitter, No funciona
  private async scrapeTwitter(url: string) {
    console.log(`Scraping Twitter/X: ${url}`);
  
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  
    const page = await browser.newPage();
  
    // Establecer un User-Agent realista para emular un navegador común
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    );
  
    // Asegurarse de que los recursos de la página no sean bloqueados
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.resourceType() === 'image' || request.resourceType() === 'script') {
        request.continue();
      } else {
        request.continue();
      }
    });
  
    await page.goto(url, { waitUntil: 'networkidle2' });
  
    // Esperar a que se cargue el selector relevante
    await page.waitForSelector('meta[property="og:title"]');
  
    const profileData = await page.evaluate(() => {
      const getMetaContent = (property: string) => 
        document.querySelector(`meta[property="${property}"]`)?.getAttribute('content') || 'No encontrado';
  
      // Obtener el nombre de perfil, imagen, biografía, email y fotos
      const profileName = document.querySelector('h1')?.innerText || 'No encontrado'; // Ajustar el selector si es necesario
      const profileImage = getMetaContent('og:image');
      const bio = getMetaContent('og:description');
      
      // Como no es sencillo obtener el email directamente en la mayoría de los perfiles públicos, se coloca como 'No disponible'
      const email = 'No disponible'; // Si puedes acceder a un email en el HTML, cámbialo según el selector.
  
      // Obtener las imágenes (las primeras 10 por ejemplo)
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => (img as HTMLImageElement).src)
        .slice(0, 10);  // Limitando a las primeras 10 imágenes
  
      return {
        platform: 'Twitter/X',
        username: getMetaContent('og:title'),
        profileName,
        profileImage,
        bio,
        email,
        images,
      };
    });
  
    await browser.close();
    return profileData;
  }

  private async getImageUrl(imageUrl: string): Promise<string> {
    console.log('Procesando imagen:', imageUrl);
    try {
      if (!imageUrl) return '';
  
      // 1. Descargar la imagen
      const response = await axios({
        url: imageUrl,
        responseType: 'arraybuffer',
      }).catch((error) => {
        console.error(`Error al descargar la imagen ${imageUrl}:`, error.message);
        return null;
      });
      
      if (!response) return '';
  
      // 2. Guardarla en un archivo temporal
      const tempFilePath = path.join(__dirname, `temp-image-${Date.now()}.jpg`);
      await writeFileAsync(tempFilePath, response.data);
      // 3. Subirla a Cloudinary
      const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'scraped_images', // Carpeta en Cloudinary
      });
      console.log('UploadResult:', uploadResult);
  
      // 4. Eliminar el archivo temporal
      if (fs.existsSync(tempFilePath)) {
        await unlinkFileAsync(tempFilePath);
      }
  
      // 5. Devolver la URL pública de Cloudinary
      return uploadResult.secure_url;
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      return ''; // Retornar string vacío si falla
    }
  }

  private async analyzeImage(imageUrl: string) {
    if (!imageUrl) return { message: 'No image to analyze' };

    // Llamar a la API de IA para analizar la imagen
    const url = `${process.env.AI_API_URL}/analyze`;

    try {
      const response = await axios.post(url, { image_url: imageUrl });
      return response.data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return { message: 'Error analyzing image' };
    }

  }

  async processCsv(file: Express.Multer.File) {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (row) => {
          if (row.LINK) {
            results.push({
              name: row.NOMBRE,
              lastname: row.APELLIDO,
              email: row.EMAIL,
              link: row.LINK
            });
          }
        })
        .on('end', async () => {
          const scrapeResults = await Promise.all(
            results.map(async (record) => {
              const extractedData: any = await this.scrapeAndExtractData(record.link);
              console.log('extractedData =================================', extractedData);
              // DESCARGAR ARCHIVO Y SUBIRLO A cloudinary, obtener url publica y actualizar extracted data
              extractedData.profileImage = await this.getImageUrl(extractedData.profileImage || extractedData.images[0]);
              if (extractedData.images && extractedData.images.length > 0) {
                // Procesar todas las imágenes y obtener las URLs de Cloudinary
                const uploadedImages = await Promise.allSettled(
                  extractedData.images.map(async (imageUrl: string) => this.getImageUrl(imageUrl))
                );
                
                extractedData.images = uploadedImages.map((result) =>
                  result.status === "fulfilled" ? result.value : ""
                );
  
                extractedData.images = uploadedImages;
              }
              return { ...record, extractedData };
            })
          );

          // ANALIZAR CON IA la imagen
          const aiResults = await Promise.all(
            scrapeResults.map(async (record) => {
              const aiData = await this.analyzeImage(record.extractedData.profileImage);
              return { ...record, aiData };
            }
          ));

          const users: CreateUserDto[] = aiResults.map((record) => {
            return {
              name: record.name,
              lastname: record.lastname,
              email: record.email,
              link: record.link,
              extractedData: record.extractedData,
              detectedActivity: record.aiData.detected_activity,
              riskLevel: record.aiData.risk_level,
              labels: record.aiData.detected_labels
            }
          });
          // guardar datos del usuario en la base de datos
          const response = await this.usersService.createMultiple(users);

          resolve(response);
        })
        .on('error', (error) => {
          reject({ message: 'Error processing CSV', error });
        });
    });
  }
}
