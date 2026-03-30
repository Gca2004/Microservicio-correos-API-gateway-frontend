CREATE DATABASE IF NOT EXISTS bd_correos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bd_correos;

CREATE TABLE usuarios (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombres             VARCHAR(120)  NOT NULL,
    correo              VARCHAR(150)  NOT NULL UNIQUE,
    clave_hash          VARCHAR(255)  NOT NULL,
    fecha_nacimiento    DATE          NOT NULL,
    genero              ENUM('masculino','femenino','otro') NOT NULL,
    rol                 ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
    activo              TINYINT(1)    NOT NULL DEFAULT 1,
    fecha_registro      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verificado          TINYINT(1)    NOT NULL DEFAULT 0,
    codigo_verificacion VARCHAR(4)    NULL,
    codigo_expira       DATETIME      NULL
) ENGINE=InnoDB;

CREATE TABLE registro_correos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    correo_destino  VARCHAR(150) NOT NULL,
    nombre_destino  VARCHAR(120) NOT NULL,
    asunto          VARCHAR(255) NOT NULL,
    mensaje         TEXT         NOT NULL,
    enviado_por     VARCHAR(150) NOT NULL,
    fecha_envio     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          ENUM('enviado','fallido') NOT NULL DEFAULT 'enviado'
) ENGINE=InnoDB;

