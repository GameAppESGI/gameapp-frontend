# Utilisez une image de base Node.js pour construire l'application
FROM node:16 as build

# Créez un répertoire de travail dans le conteneur
WORKDIR /app

# Copiez le fichier package.json et le fichier package-lock.json (s'il existe) dans le conteneur
COPY package*.json ./

# Installez les dépendances en utilisant npm
RUN npm install

# Copiez tout le contenu du répertoire local dans le conteneur
COPY . .

# Exécutez la construction de l'application
RUN npm run build

# Utilisez une image Nginx pour servir l'application construite
FROM nginx:1.21

# Copiez les fichiers de build de l'application React dans le répertoire de travail de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exposez le port 80
EXPOSE 80

# La commande CMD pour démarrer Nginx est déjà définie dans l'image de base Nginx
