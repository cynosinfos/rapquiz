# Wybór obrazu bazowego Node.js
FROM node:20

# Folder roboczy wewnątrz kontenera
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie reszty plików projektu
COPY . .

# Hugging Face wymaga nasłuchiwania na porcie 7860
ENV PORT=7860
EXPOSE 7860

# Komenda startowa
CMD ["npm", "start"]
