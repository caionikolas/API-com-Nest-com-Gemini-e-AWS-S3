# Desafio API de leitura de imagens com NestJs utilizando Gemini

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=nest&logoColor=white)
![Nest](https://img.shields.io/badge/nestJS-%23DD0031.svg?style=for-the-badge&logo=nest&logoColor=white)
![AWS S3](https://img.shields.io/badge/Amazon-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

## Descrição do Desafio:
Desenvolver o back-end de um serviço que gerencia a leitura individualizada de
consumo de água e gás. Para facilitar a coleta da informação, o serviço utilizará IA para
obter a medição através da foto de um medidor

## Tecnologias Utilizadas

- [Nest](https://nestjs.com/) - Framework Node.js destinado ao desenvolvimento de aplicativos do lado do servidor.
- [Docker](https://www.docker.com/) - Serviço que usa virtualização para entregar software em pacotes chamados contêineres.
- [AWS Amazon](https://aws.amazon.com/pt/) - Uma plataforma de serviços de computação em nuvem oferecida pela Amazon. 

## Como Executar

1. Clone o repositório e acesse a pasta do projeto
   ```shell
   git clone https://github.com/caionikolas/desafio-shopper.git
   cd nome-do-repositorio
    ```
2. Instale os pacotes utilizando o comando `npm install`
3. Crie um arquivo `.env` na raiz do projeto e insira suas credencias. Utilize o arquivo `.env.example` como base.
4. Execute o comando `npm rum prisma`
5. Execute o projeto com o comando `npm start`

## API Endpoints
A API fornece os seguintes endpoints:

```markdown
POST /upload - Responsável por receber uma imagem em base 64, consultar o Gemini e retornar a
medida lida pela API.

{
 "image": "base64",
 "customer_code": "string",
 "measure_datetime": "datetime",
 "measure_type": "WATER" ou "GAS"
}


PATCH /confirm - Responsável por confirmar ou corrigir o valor lido pelo LLM,

{
 "measure_uuid": "string",
 "confirmed_value": integer
}


GET /:customerCode/list - Responsável por listar as medidas realizadas por um determinado cliente

```

## Docker

Você pode rodar esse projeto com Docker seguindo os seguintes comandos:

```bash
$ docker-compose up
```
