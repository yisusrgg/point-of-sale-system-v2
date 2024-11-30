drop database tienda;
create database Tienda;
use Tienda;

create table empleados(
	id_empleado 	int 	primary key 	auto_increment unique,
    usuario 		varchar(20) not null unique,
    pass 			char(64) 	not null,
    Nombre 			Varchar(25)			not null,
    Apellidos 		varchar(25) 		not null,
    Telefono		char(10) 			not null,
    Correo 			Varchar(30)			not null,
    salario 		decimal(10,2)		not null,
    fecha_registro     timestamp default current_timestamp,
	fecha_modificacion timestamp default current_timestamp on update current_timestamp,
	activo             tinyint(1) default 1
);

create table producto(
	id_producto 		int	primary key 	auto_increment,
    codigo				varchar(100)		not null unique,
	nombre_producto		varchar(50) 		not null,
    descripcion 		text				not null,
    precio 				decimal(10,2)		not null,
    stock				int					default 0,
    descontinuado 		tinyint(1)			not null default 0, 
    fecha_registro     timestamp default current_timestamp,
	fecha_modificacion timestamp default current_timestamp on update current_timestamp
);

create table cliente(
	id_cliente 			int primary key 	auto_increment,
    nombre				varchar(50)			not null,
    apellido			varchar(50)			not null,
    telefono 			char(10)			not null,
    correo 				varchar(25)			not null,
    direccion			varchar(70)			not null,
    ciudad 				varchar(25)			not null,
	estado				varchar(25)			not null,
    codigo_postal		varchar(10)			not null,
    rfc					char(13)			not null,
    razon_social		varchar(70) 		not null,
    regimen_fiscal		varchar(50)			not null,
    estado_cliente 		tinyint(1) 			default 1
);

create table ventas(
	id_venta 	int 		primary key 	auto_increment,
    id_empleado int 		not null,
    id_cliente  int			not null,
    fecha_venta	timestamp 	default current_timestamp,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_cliente) references cliente(id_cliente)
);

create table venta_detalles(
	id_detalle 	int 	primary key 		auto_increment,
    id_venta 	int not null,
	id_producto	int not null,
    cantidad 	int not null,
    precio_unitario	decimal(10,2) not null,
    foreign key (id_venta) references ventas (id_venta) on delete cascade,
    foreign key (id_producto) references producto (id_producto)
);
create table tickets(
	id_ticket			int 				primary key 	auto_increment,
    id_venta 			int 				not null,
    id_empleado 		int 				not null,
    id_cliente  		int					not null,
    total 				decimal(10,2) 		not null,
    cantidad_pagada		decimal(10,2)		not null,
    metodo_de_pago		varchar(50)			null,
    fecha_de_emision 	timestamp 			default current_timestamp,
    foreign key (id_venta) references ventas(id_venta) on delete cascade,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_cliente) references cliente(id_cliente)
);

delimiter //

create procedure spVentasAleatorias(iteraciones int)
begin
    declare j int default 0;
    declare i int default 0;
    declare spId_prod int;
    declare spFecha_venta date;
    declare spCantidad int;
    declare spTotal decimal(10, 2) default 0;
    declare spFecha_random date;
    declare splimite int;
    declare spPrecio decimal(10,2);
    declare spEmpleado int;
    declare spId_venta int;
    declare spCliente int;

    while j < iteraciones do
        set spTotal = 0; -- Reiniciar total de la venta
        set spLimite = greatest(1, floor(1 + (rand() * 5)));
        set spFecha_random = date_add(curdate(), interval floor(rand() * 365) day);

        select id_empleado into spEmpleado from empleados order by rand() limit 1;
        select id_cliente into spCliente from cliente order by rand() limit 1;

        -- Crear la venta
        insert into ventas (id_empleado, id_cliente, fecha_venta) 
        values (spEmpleado, spCliente, spFecha_random);

        set spId_venta = LAST_INSERT_ID();

        set i = 0;
        REPEAT
            -- Seleccionar un producto aleatorio
            select id_producto into spId_prod from producto order by rand() limit 1;

            -- Cantidad aleatoria
            set spCantidad = floor(1 + (rand() * 5));

            -- Obtener precio del producto
            select precio into spPrecio from producto where id_producto = spId_prod;

            -- Total de la venta
            set spTotal = spTotal + spCantidad * spPrecio;

            -- Insertar en detalle de ventas
            insert into venta_detalles (id_venta, id_producto, cantidad, precio_unitario)
            values (spId_venta, spId_prod, spCantidad, spPrecio);

            set i = i + 1;
        UNTIL i >= spLimite
        END REPEAT;

        -- Crear ticket
        insert into tickets (id_venta, id_empleado, id_cliente, total, cantidad_pagada, fecha_de_emision)
        values (spId_venta, spEmpleado, spCliente, spTotal, spTotal + 100, spFecha_random);

        set j = j + 1;
    end while;
end //

delimiter ;


DELIMITER $$

CREATE PROCEDURE spInsertarCliente(
    p_nombre VARCHAR(50),
    p_apellido VARCHAR(50),
    p_telefono CHAR(10),
    p_correo VARCHAR(25),
    p_direccion VARCHAR(70),
    p_ciudad VARCHAR(25),
    p_estado VARCHAR(25),
    p_codigo_postal VARCHAR(10),
    p_rfc CHAR(13),
    p_razon_social VARCHAR(70),
    p_regimen_fiscal VARCHAR(50)
)
BEGIN
    INSERT INTO cliente (
        nombre, apellido, telefono, correo, direccion, ciudad, estado,
        codigo_postal, rfc, razon_social, regimen_fiscal
    ) VALUES (
        p_nombre, p_apellido, p_telefono, p_correo, p_direccion, p_ciudad,
        p_estado, p_codigo_postal, p_rfc, p_razon_social, p_regimen_fiscal
    );
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE spActualizarCliente(
    p_id_cliente INT,
    p_nombre VARCHAR(50),
    p_apellido VARCHAR(50),
    p_telefono CHAR(10),
    p_correo VARCHAR(25),
    p_direccion VARCHAR(70),
    p_ciudad VARCHAR(25),
    p_estado VARCHAR(25),
    p_codigo_postal VARCHAR(10),
    p_rfc CHAR(13),
	p_razon_social VARCHAR(70),
    p_regimen_fiscal VARCHAR(50)
)
BEGIN
    UPDATE cliente
    SET nombre = p_nombre,
        apellido = p_apellido,
        telefono = p_telefono,
        correo = p_correo,
        direccion = p_direccion,
        ciudad = p_ciudad,
        estado = p_estado,
        codigo_postal = p_codigo_postal,
        rfc = p_rfc,
        razon_social = p_razon_social,
        regimen_fiscal = p_regimen_fiscal
    WHERE id_cliente = p_id_cliente;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE eliminarCliente(IN p_id_cliente INT)
BEGIN
    -- Verificar si el cliente existe
    DECLARE cliente_existe INT;

    SELECT COUNT(*) INTO cliente_existe
    FROM cliente
    WHERE id_cliente = p_id_cliente;

    -- Si el cliente no existe, termina el procedimiento
    IF cliente_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cliente no encontrado.';
    ELSE
        -- Marcar el cliente como eliminado
        UPDATE cliente
        SET estado_cliente = 0
        WHERE id_cliente = p_id_cliente;
    END IF;
END$$

DELIMITER ;




 -- ========================================================================================================
 
-- crear cliente default
insert into  cliente values(1,'Mostrador',' ','NA','NA','NA','NA','NA','NA','NA','NA','NA', 1);

-- crear algunos empleados y productos
INSERT INTO empleados (usuario, pass, Nombre, Apellidos, Telefono, Correo, salario)VALUES 
('jdoe', SHA2('123', 256), 'John', 'Doe', '1234567890', 'johndoe@example.com', 3000.00);
INSERT INTO empleados (usuario, pass, Nombre, Apellidos, Telefono, Correo, salario)VALUES 
('liz', SHA2('123', 256), 'Liz', 'Lopez', '1234537890', 'liz@example.com', 3400.00);
INSERT INTO empleados (usuario, pass, Nombre, Apellidos, Telefono, Correo, salario)VALUES 
('msmith', SHA2('securepass456', 256), 'Mary', 'Smith', '0987654321', 'marysmith@example.com', 3200.00),
('arodriguez', SHA2('mypassword789', 256), 'Ana', 'Rodriguez', '1122334455', 'anarodriguez@example.com', 2900.00);

INSERT INTO producto (codigo,nombre_producto, descripcion, precio, stock) VALUES 
('10100000','Smartphone Samsung Galaxy', 'Smartphone con pantalla de 6.5 pulgadas y cámara de 64 MP', 850.00, 100),
('10200000','Auriculares Sony', 'Auriculares inalámbricos con cancelación de ruido', 150.00, 75),
('10300000','Teclado Mecánico Logitech', 'Teclado mecánico retroiluminado para gamers', 120.00, 30),
('10400000','Monitor Dell', 'Monitor de 24 pulgadas con resolución Full HD', 180.00, 40),
('10500000','Tablet Apple iPad', 'Tablet de 10.2 pulgadas con 64 GB de almacenamiento', 350.00, 60),
('10600000','Mouse Razer', 'Mouse ergonómico con iluminación RGB', 50.00, 90),
('10700000','Impresora HP', 'Impresora láser color con conectividad Wi-Fi', 200.00, 20),
('10800000','Cámara Canon EOS', 'Cámara réflex digital con lente de 18-55mm', 600.00, 25),
('10900000','Pendrive Kingston', 'Pendrive USB 3.0 de 64 GB', 20.00, 150);

INSERT INTO cliente (nombre, apellido, telefono, correo, direccion, ciudad, estado, codigo_postal, rfc, razon_social, regimen_fiscal) VALUES
('Carlos', 'González', '5541234567', 'carlos.g@gmail.com', 'Calle Reforma 123', 'Ciudad de México', 'CDMX', '01000', 'GONC920101HDF', 'Carlos González S.A. de C.V.', 'Persona Moral'),
('María', 'López', '5587654321', 'maria.lopez@hotmail.com', 'Avenida Juárez 45', 'Guadalajara', 'Jalisco', '44100', 'LOPM910202JAL', 'María López y Asociados', 'Régimen Simplificado de Confianza'),
('José', 'Pérez', '5534567890', 'joseperez@yahoo.com', 'Calle Hidalgo 78', 'Monterrey', 'Nuevo León', '64000', 'PERJ850303MTY', 'JP Servicios Profesionales', 'Persona Física con Actividad Empresarial'),
('Ana', 'Hernández', '5567890123', 'ana.h@gmail.com', 'Boulevard Independencia 321', 'Toluca', 'Estado de México', '50000', 'HERA930404EDM', 'Ana Hernández Consultoría', 'Régimen de Incorporación Fiscal'),
('Luis', 'Martínez', '5554321987', 'luis.martinez@outlook.com', 'Calle Morelos 56', 'Puebla', 'Puebla', '72000', 'MART850505PUE', 'LM Distribuciones', 'Régimen General de Ley Personas Morales');

-- /// /// /// /// /// /// /// 

-- 		TRIGGERS

-- /// /// /// /// /// /// /// 


--

-- // // // // // ACTIVIDAD NUMERO 7 // // // // // //

--
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(50) NOT NULL, -- Nombre de la tabla afectada
    accion VARCHAR(10) NOT NULL,         -- Tipo de operación: INSERT, UPDATE, DELETE
    datos_anteriores TEXT,               -- Estado anterior (para UPDATE/DELETE)
    datos_nuevos TEXT,                   -- Estado nuevo (para INSERT/UPDATE)
    empleado int,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha de la operación
);

DELIMITER $$

CREATE TRIGGER ventas_auditoria_insert
AFTER INSERT
ON ventas
FOR EACH ROW
BEGIN
    DECLARE datos_nuevos TEXT;

    -- Datos nuevos
    SET datos_nuevos = CONCAT(
        'id_venta: ', NEW.id_venta, 
        ', id_empleado: ', NEW.id_empleado, 
        ', fecha_venta: ', NEW.fecha_venta
    );

    -- Inserta el registro en la tabla de auditoría
    INSERT INTO auditoria (tabla_afectada, accion, datos_nuevos, empleado)
    VALUES ('ventas', 'INSERT', datos_nuevos, new.id_empleado);
END$$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER ventas_auditoria_update
AFTER UPDATE
ON ventas
FOR EACH ROW
BEGIN
    DECLARE datos_anteriores TEXT;
    DECLARE datos_nuevos TEXT;

    -- Datos anteriores y nuevos
    SET datos_anteriores = CONCAT(
        'id_venta: ', OLD.id_venta, 
        ', id_empleado: ', OLD.id_empleado, 
        ', fecha_venta: ', OLD.fecha_venta
    );
    SET datos_nuevos = CONCAT(
        'id_venta: ', NEW.id_venta, 
        ', id_empleado: ', NEW.id_empleado, 
        ', fecha_venta: ', NEW.fecha_venta
    );

    -- Inserta el registro en la tabla de auditoría
    INSERT INTO auditoria (tabla_afectada, accion, datos_anteriores, datos_nuevos, empleado)
    VALUES ('ventas', 'UPDATE', datos_anteriores, datos_nuevos, new.id_empleado);
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER ventas_auditoria_delete
AFTER DELETE
ON ventas
FOR EACH ROW
BEGIN
    DECLARE datos_anteriores TEXT;

    -- Datos anteriores
    SET datos_anteriores = CONCAT(
        'id_venta: ', OLD.id_venta, 
        ', id_empleado: ', OLD.id_empleado, 
        ', fecha_venta: ', OLD.fecha_venta
    );

    -- Inserta el registro en la tabla de auditoría
    INSERT INTO auditoria (tabla_afectada, accion, datos_anteriores, empleado)
    VALUES ('ventas', 'DELETE', datos_anteriores, new.id_empleado());
END$$

--

-- // // // // // ACTIVIDAD NUMERO 8 // // // // // //

--
DELIMITER $$

CREATE TRIGGER validar_producto_insert
BEFORE INSERT
ON producto
FOR EACH ROW
BEGIN
    -- Validar que el precio no sea negativo
    IF NEW.precio < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El precio no puede ser negativo.';
    END IF;

    -- Validar que el nombre del producto no esté vacío ni sea solo espacios en blanco
    IF TRIM(NEW.nombre_producto) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El nombre del producto no puede estar vacío o contener solo espacios.';
    END IF;

    -- Validar el código de barras: permitir NULL, pero si no es NULL debe tener entre 8 y 20 caracteres
    IF NEW.codigo IS NOT NULL THEN
        IF CHAR_LENGTH(NEW.codigo) < 8 OR CHAR_LENGTH(NEW.codigo) > 20 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El código de barras debe tener entre 8 y 20 caracteres.';
        END IF;
    END IF;
END$$

DELIMITER $$

CREATE TRIGGER validar_producto_update
BEFORE UPDATE
ON producto
FOR EACH ROW
BEGIN
    -- Validar que el precio no sea negativo
    IF NEW.precio < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El precio no puede ser negativo.';
    END IF;

    -- Validar que el nombre del producto no esté vacío ni sea solo espacios en blanco
    IF TRIM(NEW.nombre_producto) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El nombre del producto no puede estar vacío o contener solo espacios.';
    END IF;

    -- Validar el código de barras: permitir NULL, pero si no es NULL debe tener entre 8 y 20 caracteres
    IF NEW.codigo IS NOT NULL THEN
        IF CHAR_LENGTH(NEW.codigo) < 8 OR CHAR_LENGTH(NEW.codigo) > 20 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El código de barras debe tener entre 8 y 20 caracteres.';
        END IF;
    END IF;
END$$

--

-- // // // // // ACTIVIDAD NUMERO 9 // // // // // //

--
DELIMITER //

CREATE FUNCTION obtener_cantidad_productos_venta(folio_venta INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE cantidad_total INT;

    -- Calcular la cantidad total de productos en la venta especificada
    SELECT SUM(cantidad) INTO cantidad_total
    FROM venta_detalles
    WHERE id_venta = folio_venta;

    -- Retornar la cantidad total
    RETURN cantidad_total;
END //

DELIMITER ;

-- crear algunas ventas
call spVentasAleatorias(1000);
call EliminarCliente(11);


insert into empleados (usuario, pass, Nombre, Apellidos, Telefono, Correo, salario, activo) values ('na',sha2('na',256),'Angel','Diosdado','4459121239','edua@gmail.com', 1233.1,1);

select * from empleados;
select * from cliente;
select * from producto;
select * from ventas;
