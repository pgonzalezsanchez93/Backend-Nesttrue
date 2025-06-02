# Usar Node.js 20 LTS
FROM node:20-alpine

# Instalar herramientas necesarias
RUN apk add --no-cache bash

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación usando npx
RUN npx nest build

# Limpiar devDependencies después del build
RUN npm ci --only=production && npm cache clean --force

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]