# Imagen base: Node LTS en Alpine (ligera)
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los manifiestos para instalar dependencias con cache eficiente
COPY package*.json ./

# Instala dependencias (usa npm ci si hay package-lock.json, si no, npm install)
RUN npm ci || npm install

# Copiamos el resto del código
COPY . .

# Puerto típico de dev (ajústalo si tu app usa otro)
ENV PORT=3000

# Exponer el puerto para poder acceder desde el host
EXPOSE 3000

# Arrancar servidor de desarrollo y escuchar en todas las interfaces del contenedor
# El "--" pasa argumentos al script "dev" (útil con Vite: --host 0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
