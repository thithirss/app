#!/bin/sh
set -e

cd /var/www/html

# Instalar dependências se autoload não existir
if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

# Garantir APP_KEY
php artisan key:generate --force || true

# Rodar migrações (schema do banco)
php artisan migrate --force

# Executa seeders (removido AdminUserSeeder que não existe)
php artisan db:seed --force || true

# Garantir diretórios de cache e storage do Laravel
mkdir -p storage/framework/cache \
  storage/framework/sessions \
  storage/framework/testing \
  storage/framework/views

# Permissões de cache e storage
chown -R www-data:www-data storage bootstrap/cache

exec "$@"