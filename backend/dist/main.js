"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const dotenv_1 = require("dotenv");
const node_path_1 = require("node:path");
const app_module_1 = require("./app.module");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(process.cwd(), '../.env') });
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3001' });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map