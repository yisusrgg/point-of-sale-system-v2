drop database tienda;
create database Tienda;
use Tienda;

-- La instrucción crea una tabla llamada empleados para gestionar la información de los empleados de
-- una empresa. Incluye campos como identificador único, nombre de usuario, contraseña, datos
-- personales (nombre, apellidos, teléfono, correo), salario, y fechas de registro y modificación. Además,
-- tiene un campo para indicar si el empleado está activo o no. Esta estructura permite llevar un control
-- detallado y organizado de los empleados.

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


-- La instrucción crea una tabla llamada producto para gestionar la información de los productos de
-- un inventario. Incluye campos como un identificador único, código de producto, nombre,
-- descripción, precio, cantidad en stock, y un indicador de si el producto está descontinuado. También
-- registra automáticamente las fechas de creación y última modificación. Esta estructura facilita el
-- control y administración de los productos disponibles.

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

-- La tabla cliente almacena información personal, de contacto y fiscal de los clientes, incluyendo su estado activo. Esto facilita la gestión y organización eficiente de los datos.

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

-- La tabla ventas almacena información sobre las ventas realizadas, incluyendo el identificador de la
-- venta, el empleado que realizó la venta, el cliente que compró el producto y la fecha de la venta. Los
-- campos id_empleado e id_cliente son claves foráneas que referencian a las tablas empleados y
-- cliente respectivamente. Esta estructura permite rastrear las ventas de manera organizada y
-- asociada a empleados y clientes.

create table ventas(
	id_venta 	int 		primary key 	auto_increment,
    id_empleado int 		not null,
    id_cliente  int			not null,
    fecha_venta	timestamp 	default current_timestamp,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_cliente) references cliente(id_cliente)
);

-- La instrucción crea una tabla llamada venta_detalles que gestiona los detalles de cada venta. Incluye un identificador único para cada detalle, el ID de la venta asociada, el ID del producto
-- vendido, la cantidad del producto y su precio unitario. Las claves foráneas enlazan con las tablas ventas y producto, y se establece que si se elimina una venta, los detalles relacionados también se
-- eliminen automáticamente. Esta estructura permite llevar un registro preciso de los productos vendidos en cada transacción.

create table venta_detalles(
	id_detalle 	int 	primary key 		auto_increment,
    id_venta 	int not null,
	id_producto	int not null,
    cantidad 	int not null,
    precio_unitario	decimal(10,2) not null,
    foreign key (id_venta) references ventas (id_venta) on delete cascade,
    foreign key (id_producto) references producto (id_producto)
);

-- La instrucción crea una tabla llamada tickets para gestionar los detalles de los pagos de las ventas realizadas. Incluye campos como el identificador de ticket, la venta asociada, el empleado que
-- procesó la venta, el cliente que realizó la compra, el total y la cantidad pagada, además del método de pago utilizado. También se registran la fecha de emisión del ticket y las relaciones con las tablas
-- de ventas, empleados y clientes. Esto permite llevar un control detallado de las transacciones y facilitar la gestión de pagos.

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

-- Este procedimiento almacenado (spVentasAleatorias) genera ventas aleatorias. Recibe un parámetro iteraciones que indica cuántas ventas se deben crear. En cada iteración, selecciona
-- aleatoriamente un empleado y un cliente, luego crea una venta con una fecha aleatoria y agrega productos al detalle de la venta con cantidades aleatorias. El total de la venta se calcula y,
-- finalmente, se genera un ticket para la venta, registrando el monto total y el método de pago. El proceso se repite según el número de iteraciones especificadas.

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

-- La instrucción CREATE PROCEDURE spInsertarCliente define un procedimiento almacenado que permite insertar nuevos registros de clientes en la tabla cliente. El procedimiento toma varios
-- parámetros de entrada, como nombre, apellido, teléfono, correo, dirección, ciudad, estado, código postal, RFC, razón social y régimen fiscal. Estos parámetros se usan para insertar los valores
-- correspondientes en la tabla cliente, facilitando la creación de nuevos clientes en la base de datos de forma estructurada y reutilizable.

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

-- La instrucción CREATE PROCEDURE spActualizarCliente define un procedimiento almacenado que permite actualizar los detalles de un cliente en la tabla cliente. El procedimiento toma un
-- identificador de cliente (p_id_cliente) junto con los nuevos valores para los campos de nombre, apellido, teléfono, correo, dirección, ciudad, estado, código postal, RFC, razón social y régimen fiscal.
-- Utiliza estos parámetros para modificar el registro del cliente correspondiente en la base de datos, facilitando la actualización de la información del cliente de manera estructurada.

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

-- La instrucción CREATE PROCEDURE eliminarCliente define un procedimiento almacenado que marca a un cliente como eliminado en la tabla cliente sin borrarlo físicamente. El procedimiento recibe el
-- id_cliente como parámetro. Primero verifica si el cliente existe en la base de datos. Si no se encuentra, se lanza un error con el mensaje "Cliente no encontrado". Si el cliente existe, se actualiza
-- el campo estado_cliente a 0, lo que indica que el cliente ha sido eliminado de manera lógica.

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

-- La instrucción CREATE TABLE auditoria crea una tabla llamada auditoria que almacena registros de las operaciones realizadas en otras tablas de la base de datos. Contiene un identificador único
-- id_auditoria como clave primaria, y almacena detalles sobre la acción realizada (INSERT, UPDATE, DELETE), la tabla afectada, los datos anteriores (para UPDATE/DELETE), los datos nuevos (para
-- INSERT/UPDATE), el id_empleado que realizó la operación, y la fecha en que se efectuó la operación. Esto permite un seguimiento detallado de los cambios en la base de datos para fines de auditoría.

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

-- El CREATE TRIGGER ventas_auditoria_insert crea un disparador (trigger) que se ejecuta automáticamente después de una inserción en la tabla ventas. Este trigger genera un registro de
-- auditoría de la operación de inserción, capturando los datos nuevos de la venta recién insertada (como id_venta, id_empleado y fecha_venta). Luego, inserta esta información en la tabla
-- auditoria, registrando la tabla afectada (ventas), el tipo de acción (INSERT), los datos nuevos y el id_empleado que realizó la inserción. Esto ayuda a llevar un seguimiento detallado de las inserciones realizadas en la tabla ventas.

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

-- El CREATE TRIGGER ventas_auditoria_update crea un disparador (trigger) que se ejecuta automáticamente después de una actualización en la tabla ventas. Este trigger captura tanto los
-- datos anteriores como los nuevos de la fila actualizada, específicamente los campos id_venta, id_empleado y fecha_venta. Los datos anteriores se obtienen usando OLD, mientras que los
-- nuevos se toman con NEW. Luego, se inserta un registro en la tabla auditoria con el tipo de acción UPDATE, los datos previos y los nuevos, junto con el id_empleado que realizó la actualización. Esto permite realizar un seguimiento detallado de los cambios en la tabla ventas.

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

-- El CREATE TRIGGER ventas_auditoria_delete crea un disparador (trigger) que se ejecuta después de que una fila sea eliminada de la tabla ventas. Este trigger captura los datos de la fila eliminada
-- utilizando OLD, que contiene los valores anteriores de los campos id_venta, id_empleado y fecha_venta. Luego, se inserta un registro en la tabla auditoria con el tipo de acción DELETE, los
-- datos anteriores y el id_empleado que ejecutó la eliminación.

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

-- Este trigger valida los datos antes de insertar un producto en la tabla producto. Asegura que:
-- El precio no sea negativo.
-- El nombre del producto no esté vacío ni contenga solo espacios.
-- El código de barras, si se proporciona, tenga entre 8 y 20 caracteres.
-- Si alguna de estas condiciones no se cumple, se impide la inserción y se muestra un mensaje de error.

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

-- Este trigger valida los datos antes de actualizar un producto en la tabla producto. Verifica que:
-- El precio no sea negativo.
-- El nombre del producto no esté vacío ni contenga solo espacios.
-- El código de barras, si se proporciona, tenga entre 8 y 20 caracteres.
-- Si alguna de estas condiciones no se cumple, se impide la actualización y se muestra un mensaje de error.

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

-- Esta función llamada obtener_cantidad_productos_venta recibe un folio_venta como parámetro y calcula la cantidad total de productos en esa venta. Utiliza una consulta SELECT para sumar las
-- cantidades de productos de la tabla venta_detalles correspondientes al folio_venta y retorna el resultado como un número entero (INT).

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

insert into empleados (usuario, pass, Nombre, Apellidos, Telefono, Correo, salario, activo) values ('na',sha2('na',256),'Angel','Diosdado','4459121239','edua@gmail.com', 1233.1,1);

select * from empleados;
select * from cliente;
select * from producto;
select * from ventas;

-- Reporte de Ventas
-- Vista 1 ---------------------------------------------------------------------------------
-- La vista VistaVentas combina información de varias tablas (ventas, empleados, tickets, y cliente) para mostrar detalles sobre las ventas, como el ID de la venta, la fecha, el nombre del
-- empleado que realizó la venta, el total de la venta, el método de pago y el nombre completo del cliente. Los resultados están ordenados por fecha de venta de forma descendente, lo que permite
-- consultar de manera eficiente las ventas recientes junto con los detalles de los empleados y clientes asociados.
CREATE VIEW VistaVentas AS
SELECT 
    v.id_venta, 
    v.fecha_venta, 
    e.Nombre AS empleado, 
    t.total AS total_venta, 
    t.metodo_de_pago, 
    CONCAT(c.Nombre, " ", c.Apellido) AS cliente
FROM 
    ventas v
JOIN 
    empleados e ON v.id_empleado = e.id_empleado
JOIN 
    tickets t ON v.id_venta = t.id_venta
JOIN 
    cliente c ON v.id_cliente = c.id_cliente
ORDER BY 
    v.fecha_venta DESC;

SELECT * FROM VistaVentas;

-- Vista 2 ---------------------------------------------------------------------------------
-- La vista VistaVentaPorID se utiliza para mostrar los detalles de las ventas de productos por su identificador de venta. Incluye las siguientes columnas: el ID de la venta (id_venta), el nombre
-- completo del cliente (cliente), el ID del producto, el nombre del producto, la cantidad comprada, el precio unitario y el total de la venta por producto (calculado como la cantidad multiplicada por el
-- precio unitario). La vista obtiene esta información al hacer uniones entre las tablas ventas, cliente, venta_detalles y producto. Esta vista facilita la consulta de los productos vendidos junto con los detalles relevantes de la venta.

CREATE OR REPLACE VIEW VistaVentaPorID AS
SELECT 
    v.id_venta, -- Incluir esta columna
    CONCAT(c.nombre, " ", c.apellido) AS cliente,
    p.id_producto, 
    p.nombre_producto, 
    vd.cantidad, 
    vd.precio_unitario, 
    (vd.cantidad * vd.precio_unitario) AS total
FROM 
    ventas v
JOIN 
    cliente c ON v.id_cliente = c.id_cliente
JOIN 
    venta_detalles vd ON v.id_venta = vd.id_venta
JOIN 
    producto p ON vd.id_producto = p.id_producto;



SELECT * 
FROM VistaVentaPorID 
WHERE id_venta = 1;


-- Vista 3 ---------------------------------------------------------------------------------
-- La vista VistaVentasTrimestrales muestra el total de productos vendidos en cada uno de los cuatro trimestres del año. Para cada producto, la vista calcula la cantidad total vendida en el primer,
-- segundo, tercer y cuarto trimestre utilizando la función SUM combinada con la condición CASE WHEN para identificar las ventas de cada trimestre a partir de la fecha de venta. Los resultados incluyen el
-- nombre del producto, así como las cantidades vendidas en cada uno de los trimestres, y están agrupados por el ID y nombre del producto. Los resultados se ordenan alfabéticamente por el nombre del producto. Esta vista facilita el análisis de las ventas por trimestres.

CREATE VIEW VistaVentasTrimestrales AS
SELECT 
    p.nombre_producto AS producto,
    SUM(CASE WHEN QUARTER(v.fecha_venta) = 1 THEN vd.cantidad ELSE 0 END) AS trim1,
    SUM(CASE WHEN QUARTER(v.fecha_venta) = 2 THEN vd.cantidad ELSE 0 END) AS trim2,
    SUM(CASE WHEN QUARTER(v.fecha_venta) = 3 THEN vd.cantidad ELSE 0 END) AS trim3,
    SUM(CASE WHEN QUARTER(v.fecha_venta) = 4 THEN vd.cantidad ELSE 0 END) AS trim4
FROM 
    ventas v
JOIN 
    venta_detalles vd ON v.id_venta = vd.id_venta
JOIN 
    producto p ON vd.id_producto = p.id_producto
GROUP BY 
    p.id_producto, p.nombre_producto
ORDER BY 
    p.nombre_producto;

SELECT * FROM VistaVentasTrimestrales;

-- Vista 4 ---------------------------------------------------------------------------------
-- La vista VistaVentasPorEmpleado muestra un resumen de las ventas realizadas por cada empleado. Para cada empleado, se muestra su nombre completo, el número total de ventas realizadas (ventas
-- únicas) y el total generado por esas ventas, calculado a partir de la cantidad y el precio unitario de cada producto vendido. El total de ventas por empleado se calcula utilizando una subconsulta para
-- sumar el valor de las ventas de cada venta individual. Los resultados se agrupan por empleado y se ordenan de mayor a menor según el total de ventas. Esta vista es útil para evaluar el desempeño de los empleados en términos de ventas.

CREATE VIEW VistaVentasPorEmpleado AS
SELECT 
    CONCAT(e.Nombre, ' ', e.Apellidos) AS empleado, 
    COUNT(DISTINCT v.id_venta) AS cant_ventas, -- Contar ventas únicas
    SUM((
        SELECT SUM(vd.cantidad * vd.precio_unitario) 
        FROM venta_detalles vd 
        WHERE vd.id_venta = v.id_venta
    )) AS total
FROM 
    empleados e
JOIN 
    ventas v ON e.id_empleado = v.id_empleado
GROUP BY 
    e.id_empleado
ORDER BY 
    total DESC;

SELECT * FROM VistaVentasPorEmpleado;






