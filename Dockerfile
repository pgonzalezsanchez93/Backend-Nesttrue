FROM node:20.18.2-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Instalar solo dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production

# Comando para iniciar
CMD ["node", "dist/main.js"]