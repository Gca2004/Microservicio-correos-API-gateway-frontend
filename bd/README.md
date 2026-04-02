

para la base de datos se uso mysql - mariaDB desde xammp

adjunto un scrip de la base de datos y las indicaciones para el hash

para sacar el hash una vez creado las bases de datos con este comando : 
python -c "from seguridad import hashear_clave; print(hashear_clave('Admin2024*'))"
 se ejecuta desde la ruta donde se encuentre la api-correos,

 una vez obtenido la clave hash que es una clave muy larga con caracteres de todo tipo, se ejecuta este comando para poder ingresar al sistema con nuestro usuario creado

            ##formato sql

INSERT INTO usuarios (nombres, correo, clave_hash, fecha_nacimiento, genero, rol, verificado)
VALUES (
    'Administrador',
    'correo de usuario admin',
    '  Clave hash_copiar aqui  ',
    '2000-01-01',
    'masculino',
    'admin',
    1
);

