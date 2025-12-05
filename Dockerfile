# Usa uma imagem leve do Node
FROM node:20-slim

# Instala dependências do sistema necessárias para o Puppeteer/Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configura diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm install

# Gera o cliente Prisma
RUN npx prisma generate

# Copia o resto do código
COPY . .

# Compila o NestJS
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "start:prod"]