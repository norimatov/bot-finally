import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // 🔥 STATIC FAYLLARNI SERVE QILISH - TO'G'RI SOZLANGAN
  const uploadsPath = join(__dirname, '..', 'uploads');

  // Uploads papkasini yaratish (agar mavjud bo'lmasa)
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('📁 Uploads papkasi yaratildi:', uploadsPath);
  }

  const carsPath = join(uploadsPath, 'cars');
  if (!fs.existsSync(carsPath)) {
    fs.mkdirSync(carsPath, { recursive: true });
    console.log('📁 Cars papkasi yaratildi:', carsPath);
  }

  // Static fayllarni serve qilish
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    index: false,
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'],
    setHeaders: (res, path) => {
      // Cache kontrol
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      // CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      // Content-Type
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      }
    },
  });

  // CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = config.get<number>('PORT') || 4000;
  const botToken = config.get<string>('BOT_TOKEN');

  if (!botToken) {
    console.error('❌ BOT_TOKEN topilmadi! .env faylini tekshiring.');
    process.exit(1);
  }

  // 🔥 Kuchaytirilgan webhook tozalash (409 Conflict xatosi uchun)
  try {
    console.log('🔄 Webhook tozalanmoqda va kutilayotgan xabarlar tozalanmoqda...');

    // 1. Webhook tozalash (drop_pending_updates bilan)
    const deleteResponse = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=true`);
    const deleteData = await deleteResponse.json();

    if (deleteData.ok) {
      console.log('✅ Webhook tozalandi');
    } else {
      console.log('⚠️ Webhook tozalash javobi:', deleteData);
    }

    // 2. Kutilayotgan xabarlarni tozalash (getUpdates orqali)
    const getUpdatesResponse = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=-1&timeout=1`);
    const getUpdatesData = await getUpdatesResponse.json();

    if (getUpdatesData.ok) {
      console.log('📋 Kutilayotgan xabarlar tozalandi');
    }

    // 3. Bot to'liq to'xtashi uchun biroz kutish
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
    console.error('❌ Webhook tozalashda xatolik:', errorMessage);
  }

  // HTTP serverni ishga tushirish (Render port binding uchun MUHIM)
  await app.listen(port, '0.0.0.0');

  console.log(`\n🚀 SERVER ISHGA TUSHDI`);
  console.log(`📡 Port: ${port}`);
  console.log(`📁 Uploads papka: ${uploadsPath}`);
  console.log(`📸 Rasmlar URL: http://localhost:${port}/uploads/cars/...`);
  console.log(`🌐 Render URL: ${process.env.APP_URL || 'http://localhost:' + port}\n`);

  // 🔥 Uploads papkasidagi fayllarni ro'yxatini ko'rsatish (debug uchun)
  try {
    if (fs.existsSync(carsPath)) {
      const carFolders = fs.readdirSync(carsPath);
      console.log(`📁 Avtomobillar papkalari: ${carFolders.length} ta`);

      // Birinchi 5 ta avtomobil papkasidagi rasmlarni ko'rsatish
      const displayFolders = carFolders.slice(0, 5);
      for (const folder of displayFolders) {
        const folderPath = join(carsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath);
          const techFiles = files.filter(f => f.includes('tech_front') || f.includes('tech'));
          const techBackFiles = files.filter(f => f.includes('tech_back') || f.includes('back'));
          const carFiles = files.filter(f => f.includes('car') || f.includes('mashina'));

          console.log(`   🚗 ${folder}: ${files.length} ta rasm`);
          if (techFiles.length > 0) {
            console.log(`      📸 Tex old: /uploads/cars/${folder}/${techFiles[0]}`);
          }
          if (techBackFiles.length > 0) {
            console.log(`      📸 Tex orqa: /uploads/cars/${folder}/${techBackFiles[0]}`);
          }
          if (carFiles.length > 0) {
            console.log(`      📸 Mashina: /uploads/cars/${folder}/${carFiles[0]}`);
          }
        }
      }

      if (carFolders.length > 5) {
        console.log(`   ... va yana ${carFolders.length - 5} ta avtomobil`);
      }
    } else {
      console.log('📁 cars papkasi mavjud emas, yangi papka yaratildi');
      fs.mkdirSync(carsPath, { recursive: true });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
    console.error('❌ Uploads papkasini o\'qishda xatolik:', errorMessage);
  }

  console.log('\n✅ Bot tayyor!');
  console.log('💡 Bot Telegram orqali ishlaydi, HTTP server esa Render uchun port binding qiladi\n');
  console.log('⚠️ Eslatma: Agar 409 Conflict xatosi chiqsa:');
  console.log('   1. Lokal botni to\'xtating (Ctrl + C)');
  console.log('   2. Render\'da Restart Service tugmasini bosing');
  console.log('   3. Yoki BotFather dan /revoke qilib yangi token oling\n');
}

bootstrap().catch(error => {
  const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
  console.error('❌ Fatal xatolik:', errorMessage);
  process.exit(1);
});