# Travel REP

O **Travel REP** é uma plataforma para gestão de viagens corporativas.  
Nela, o usuário pode solicitar viagens informando o destino, o motivo, as datas 
Essas solicitações aparecem em um painel administrativo, onde o administrador pode **aprovar, negar ou cancelar** o pedido.  
O solicitante é **notificado automaticamente** sobre qualquer atualização no status da viagem.  

---

## Como iniciar o projeto

O projeto é composto pelo Front-end e Back-end juntos no mesmo repositório.  
Tudo é executado através do **Docker**, para deixar mais automatico o clone do repositorio e a inicialização facil do mesmo 

###  Pré-requisitos
Antes de tudo, é preciso ter o **Docker** instalado na sua máquina.  
Se ainda não tiver, você pode baixar aqui: [https://www.docker.com/](https://www.docker.com/)

---

##  Instalação passo a passo

1. **Clone o repositório**
   ```bash
   git clone [https://github.com/thithirs/travel-rep.git](https://github.com/thithirss/app.git)
   cd travel-rep
   ```

2. **Crie o arquivo `.env`**
   Antes de iniciar os containers, é essencial ter o arquivo `.env` configurado.  
   Copie o conteúdo abaixo e salve como `.env` na raiz do projeto:

   ```env
    APP_NAME=Laravel
    APP_ENV=local
    APP_KEY=base64:L1NtWjRtSbQ63N7URvi6CED0r4aM6ps0wU5I8iZwgsM=
    APP_DEBUG=true
    APP_URL=http://localhost
    
    APP_LOCALE=en
    APP_FALLBACK_LOCALE=en
    APP_FAKER_LOCALE=en_US
    
    APP_MAINTENANCE_DRIVER=file
    
    
    PHP_CLI_SERVER_WORKERS=4
    
    BCRYPT_ROUNDS=12
    
    LOG_CHANNEL=stack
    LOG_STACK=single
    LOG_DEPRECATIONS_CHANNEL=null
    LOG_LEVEL=debug
    
    DB_CONNECTION=sqlite
    
    
    SESSION_DRIVER=database
    SESSION_LIFETIME=120
    SESSION_ENCRYPT=false
    SESSION_PATH=/
    SESSION_DOMAIN=null
    
    BROADCAST_CONNECTION=log
    FILESYSTEM_DISK=local
    QUEUE_CONNECTION=database
    
    CACHE_STORE=database
    
    
    MEMCACHED_HOST=127.0.0.1
    
    REDIS_CLIENT=phpredis
    REDIS_HOST=127.0.0.1
    REDIS_PASSWORD=null
    REDIS_PORT=6379
    
    MAIL_MAILER=log
    MAIL_SCHEME=null
    MAIL_HOST=127.0.0.1
    MAIL_PORT=2525
    MAIL_USERNAME=null
    MAIL_PASSWORD=null
    MAIL_FROM_ADDRESS="hello@example.com"
    MAIL_FROM_NAME="${APP_NAME}"
    
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_DEFAULT_REGION=us-east-1
    AWS_BUCKET=
    AWS_USE_PATH_STYLE_ENDPOINT=false
    
    VITE_APP_NAME="${APP_NAME}"



   ```

3. **Inicie os containers com o Docker**

   É nescessario que o docker esteja aberto na maquina antes de rodar o comando.
   
   ```bash
   docker compose up -d --build
   ```

   Esse comando vai iniciar tudo automaticamente sem nescessidade de configurar nada a parte, o front end pode demorar um pouco a iniciar
   pela instalação dos pacotes e iniciar o server, é possivel monitorar pelo log do docker.
     O front end vai ser servido na porta : http://localhost:8080 
     O backend vai ser servido na porta : http://localhost:8000
     O banco de dados esta contido no docker.
     Todas as migrations são aplicadas automaticamente durante o build.

---

##  Usuários criados automatico com o docker

Assim que tudo estiver iniciado, dois usuários padrão serão criados automaticamente:

| Tipo de Usuário | E-mail | Senha |
|------------------|-------------------------|----------|
| Admin | admin@travelrep.local | password |
| Usuário comum | user@travelrep.local | password |

---

4. **Estrutura**

  A estrutura do projeto é composta por :

 ┣  app/ -> front-end 
 ┣  backend/ -> backend ( php 8.2 + laravel 12)
 ┣  frontend/ -> controler das notificacoes
 ┗  docker-compose.yml  -> Configuracao global do docker para inicializar o projeto
