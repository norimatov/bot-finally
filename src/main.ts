import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // 🔥 STATIC FAYLLARNI SERVE QILISH - TO'G'RI SOZLANGAN
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    index: false,
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'],
    setHeaders: (res, path) => {
      // Cache kontrol
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      // CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  });

  // CORS
  app.enableCors();

  const port = config.get<number>('PORT') || 4000;
  const botToken = config.get<string>('BOT_TOKEN');

  if (!botToken) {
    console.error('❌ BOT_TOKEN topilmadi! .env faylini tekshiring.');
    process.exit(1);
  }

  // Webhook tozalash
  try {
    console.log('🔄 Webhook tozalanmoqda...');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
    const data = await response.json();
    console.log('✅ Webhook tozalandi:', data);
  } catch (error) {
    console.error('❌ Webhook tozalashda xatolik:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  await app.listen(port);
  
  console.log(`\n🚀 SERVER ISHGA TUSHDI`);
  console.log(`📡 Port: ${port}`);
  console.log(`📁 Uploads papka: ${join(__dirname, '..', 'uploads')}`);
  console.log(`📸 Rasmlar URL: http://localhost:${port}/uploads/cars/...\n`);
  
  // 🔥 Uploads papkasidagi fayllarni ro'yxatini ko'rsatish (debug uchun)
  try {
    const fs = require('fs');
    const uploadsPath = join(__dirname, '..', 'uploads');
    const carsPath = join(uploadsPath, 'cars');
    
    if (fs.existsSync(carsPath)) {
      const carFolders = fs.readdirSync(carsPath);
      console.log(`📁 Avtomobillar papkalari: ${carFolders.length} ta`);
      
      // Birinchi 3 ta avtomobil papkasidagi rasmlarni ko'rsatish
      carFolders.slice(0, 3).forEach(folder => {
        const folderPath = join(carsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath);
          console.log(`   🚗 ${folder}: ${files.length} ta rasm`);
          // console.log(`      🔗 Tex: http://localhost:${port}/uploads/cars/${folder}/${files.find(f => f.includes('tech')) || 'topilmadi'}`);
          // console.log(`      🔗 Car: http://localhost:${port}/uploads/cars/${folder}/${files.find(f => f.includes('car')) || 'topilmadi'}`);
        }
      });
    } else {
      console.log('📁 cars papkasi mavjud emas');
      fs.mkdirSync(carsPath, { recursive: true });
      console.log('✅ cars papkasi yaratildi');
    }
  } catch (error) {
    console.error('❌ Uploads papkasini o\'qishda xatolik:', error.message);
  }
 
  console.log('\n✅ Bot tayyor!');
}

bootstrap().catch(error => {
  console.error('❌ Fatal xatolik:', error);
  process.exit(1);
});