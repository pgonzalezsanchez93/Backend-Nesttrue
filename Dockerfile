FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo dev) para el build
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Limpiar dev dependencies después del build
RUN npm ci --only=production && npm cache clean --force

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Cambiar propiedad de archivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]