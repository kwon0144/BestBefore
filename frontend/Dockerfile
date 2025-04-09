# Stage 1: Build
FROM node:20-alpine AS build

# Accept build-time variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_KEY

# Make them available during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY

WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies (dev + prod)
RUN npm install

COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only necessary runtime files
COPY package*.json ./
RUN npm install --production

COPY --from=build /usr/src/app/.next /usr/src/app/.next
COPY --from=build /usr/src/app/next.config.ts /usr/src/app/next.config.ts

EXPOSE 3000

CMD ["npm", "start"]