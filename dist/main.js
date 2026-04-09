"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
        index: false,
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'JPG', 'JPEG', 'PNG', 'GIF'],
        setHeaders: (res, path) => {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Access-Control-Allow-Origin', '*');
        },
    });
    app.enableCors();
    const port = config.get('PORT') || 4000;
    const botToken = config.get('BOT_TOKEN');
    if (!botToken) {
        console.error('❌ BOT_TOKEN topilmadi! .env faylini tekshiring.');
        process.exit(1);
    }
    try {
        console.log('🔄 Webhook tozalanmoqda...');
        const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
        const data = await response.json();
        console.log('✅ Webhook tozalandi:', data);
    }
    catch (error) {
        console.error('❌ Webhook tozalashda xatolik:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    await app.listen(port);
    console.log(`\n🚀 SERVER ISHGA TUSHDI`);
    console.log(`📡 Port: ${port}`);
    console.log(`📁 Uploads papka: ${(0, path_1.join)(__dirname, '..', 'uploads')}`);
    console.log(`📸 Rasmlar URL: http://localhost:${port}/uploads/cars/...\n`);
    try {
        const fs = require('fs');
        const uploadsPath = (0, path_1.join)(__dirname, '..', 'uploads');
        const carsPath = (0, path_1.join)(uploadsPath, 'cars');
        if (fs.existsSync(carsPath)) {
            const carFolders = fs.readdirSync(carsPath);
            console.log(`📁 Avtomobillar papkalari: ${carFolders.length} ta`);
            carFolders.slice(0, 3).forEach(folder => {
                const folderPath = (0, path_1.join)(carsPath, folder);
                if (fs.statSync(folderPath).isDirectory()) {
                    const files = fs.readdirSync(folderPath);
                    console.log(`   🚗 ${folder}: ${files.length} ta rasm`);
                }
            });
        }
        else {
            console.log('📁 cars papkasi mavjud emas');
            fs.mkdirSync(carsPath, { recursive: true });
            console.log('✅ cars papkasi yaratildi');
        }
    }
    catch (error) {
        console.error('❌ Uploads papkasini o\'qishda xatolik:', error.message);
    }
    console.log('\n✅ Bot tayyor!');
}
bootstrap().catch(error => {
    console.error('❌ Fatal xatolik:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map