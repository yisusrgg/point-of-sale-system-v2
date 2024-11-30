const express = require("express");
const fs = require('fs');
const multer = require('multer');
const app = express();
const mysql = require("mysql2");
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Tienda"
});

//END POINTS ----------------------------------------------------------------------------

//============================================ Angel ======================================================

// RUTA PARA CREAR UN NUEVO EMPLEADO
app.post("/registrarEmpleado", (req, res) => {
    const { Nombre, usuario, Apellidos, Correo, Telefono, pass, salario } = req.body;
    
    const queryCheck = 'SELECT * FROM empleados WHERE usuario = ?';
    db.query(queryCheck, [usuario], (err, result) => {
        if (err) {
            console.log(err);
            console.log(req.body);
            res.status(500).send("Error en la base de datos.");
        } else {
            if (result.length > 0) {
                return res.status(409).json({ message: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
            } else {
                const queryInsert = "INSERT INTO empleados (usuario, pass, Nombre, Apellidos, Telefono, Correo, salario) VALUES (?,sha2(?,256),?,?,?,?,?);";
                db.query(queryInsert, [usuario, pass, Nombre, Apellidos, Telefono, Correo, salario ], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Error al registrar el usuario.");
                    } else {
                        res.json({ message: "Usuario registrado con éxito!" });
                    }
                });
            }
        }
    });
});
// RUTA PARA MOSTRAR A LOS EMPLEADOS
app.get("/mostrarEmpleados", (req, res) => {  // Corrige aquí agregando (req, res)
    const query = 'SELECT * FROM empleados where activo = 1;';
    
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).json({ success: false, message: "Error en la base de datos" });
        }
        res.json(result);
    });
});
//RUTA PARA MODIFICAR EL EMPLEADO
app.put("/modificarEmpleado", (req, res) => {
    const { id ,Nombre, usuario, Apellidos, Correo, Telefono, pass, salario } = req.body;
    const query = `
        UPDATE empleados 
        SET usuario = ?, Nombre = ?, Apellidos = ?, Telefono = ?, Correo = ?, salario = ? 
        WHERE id_empleado = ?`;
    //console.log(req.body);
    db.query(query, [usuario, Nombre, Apellidos, Telefono, Correo, salario, id], (err, result) => {
        if (err) {
            console.error("Error en la base de datos:", err);
            return res.status(500).json({ success: false, message: "Error en la base de datos" });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: "Empleado no encontrado" });
        } else {
            res.json({ success: true, message: "Usuario modificado con éxito" });
        }
    });
});
//RUTA PARA CAMBIAR EL ESTADO DEL EMPLEADO
app.put("/eliminarEmpleado", (req, res) =>{
    const id = req.body.id;
    console.log(id);
    const query = "UPDATE empleados SET activo = 0 where id_empleado = ?";

    db.query(query,[id],(err,result) =>{
        if(err){
            console.error("Error en la base de datos: ",err);
            return res.status(500).json({succes: false, message: "Error en la base de datos"});
        } else {
            res.json({succes: true, message: "Usuario cambio a estado inactivo"});
        }
    });
});


/*  APIS PARA EL CRUD DE PRODUCTOS */
//RUTA PARA MOSTRAR LOS PRODUCTOS
app.get("/mostrarProductos", (req, res) => {
    const query = 'SELECT * FROM producto;';

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).json({ success: false, message: "Error en la base de datos" });
        } else {
            const productosConImagenes = result.map(producto => ({
                ...producto,
                imagen: producto.fotografia ? `data:image/jpeg;base64,${producto.fotografia.toString('base64')}` : null  // Asegúrate de que la imagen esté bien formateada
            }));
            res.status(200).json(productosConImagenes);
        }
    });
});
// RUTA PARA CREAR UN PRODUCTO
app.post('/agregarProducto', (req, res) => {
    const {codigo, nombre_producto, descripcion, precio, stock, descontinuado } = req.body;

    const descontinuadoValue = descontinuado === 'true' || descontinuado === true ? 1 : 0;

    const query = `
      INSERT INTO producto (codigo, nombre_producto, descripcion, precio, stock, descontinuado) 
      VALUES (?,?, ?, ?, ?, ?)
    `;
    const values = [codigo, nombre_producto, descripcion, precio, stock, descontinuadoValue];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error("Error en la consulta SQL:", error);
            return res.status(500).json({ message: "Error al agregar el producto", error: error.message });
        }
        res.status(200).json({ message: "Producto agregado correctamente" });
    });
});
// RUTA PARA MODIFICAR UN PRODUCTO
app.put("/modificarProducto", (req, res) => {
    const { codigo, id, nombre_producto, descripcion, precio, stock, descontinuado } = req.body;
    const query = `
        UPDATE producto 
        SET codigo=?, nombre_producto = ?, descripcion = ?, precio = ?, stock = ?, descontinuado = ?
        WHERE id_producto= ?`;
    db.query(query, [codigo, nombre_producto, descripcion, precio, stock, descontinuado, id], (err, result) => {
        if (err) {
            console.error("Error en la base de datos:", err);
            return res.status(500).json({ success: false, message: "Error en la base de datos" });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: "Empleado no encontrado" });
        } else {
            res.json({ success: true, message: "Usuario modificado con éxito" });
        }
    });
});
//RUTA PARA ELIMINAR UN PRODCUCTO
app.put("/eliminarProducto", (req, res) =>{
    const id = req.body.id;
    //console.log(id);
    const query = "UPDATE producto SET descontinuado = 1 where id_producto = ?";

    db.query(query,[id],(err,result) =>{
        if(err){
            console.error("Error en la base de datos: ",err);
            return res.status(500).json({succes: false, message: "Error en la base de datos"});
        } else {
            res.json({succes: true, message: "Producto cambio a estado inactivo"});
        }
    });
});


/*APIS PARA EL REPORTE DE VENTAS*/
app.get("/obtenerVentas", (req, res) => {
    const query = `SELECT v.id_venta, v.fecha_venta, e.Nombre AS empleado, t.total AS total_venta, t.metodo_de_pago, concat(c.Nombre," ", c.Apellido) AS cliente
                    FROM ventas v
                    JOIN empleados e ON v.id_empleado = e.id_empleado
                    JOIN tickets t ON v.id_venta = t.id_venta
                    JOIN cliente c ON v.id_cliente = c.id_cliente
                    ORDER BY v.fecha_venta DESC;`
    db.query(query,(err, result) => {
        if(err){
            console.error("Error en la base de datos: ", err);
            return res.status(500).json({succes: false, message: "Error en la base de datos"});
        } else {
            console.log(result)
            res.json(result);
        }
    });
});
app.get("/obtenerDetalleDeVenta", (req, res) => {
    const id = req.query.id; // ID de la venta
    if (!id) {
        return res.status(400).json({ success: false, message: "ID de venta es necesario" });
    }

    // Consulta para obtener los detalles de la venta y el cliente asociado
    const query = `
        SELECT 
            concat(c.nombre," ",
            c.apellido) as cliente,
            p.id_producto, 
            p.nombre_producto, 
            vd.cantidad, 
            vd.precio_unitario, 
            (vd.cantidad * vd.precio_unitario) AS total
        FROM ventas v
        JOIN cliente c ON v.id_cliente = c.id_cliente
        JOIN venta_detalles vd ON v.id_venta = vd.id_venta
        JOIN producto p ON vd.id_producto = p.id_producto
        WHERE v.id_venta = ?;
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error en la base de datos: ", err);
            return res.status(500).json({ success: false, message: "Error en la base de datos" });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Detalles de la venta no encontrados" });
        }

        // Agregar información del cliente (de la primera fila)
        const cliente = {
            nombre: result[0].cliente_nombre,
            apellido: result[0].cliente_apellido,
        };

        // Responder con productos y datos del cliente
        res.json({ success: true, cliente, productos: result });
    });
});


app.get('/obtenerVentasTrimestrales', (req, res) => {
    const query = `
      SELECT 
        p.nombre_producto AS producto,
        SUM(CASE WHEN QUARTER(v.fecha_venta) = 1 THEN vd.cantidad ELSE 0 END) AS trim1,
        SUM(CASE WHEN QUARTER(v.fecha_venta) = 2 THEN vd.cantidad ELSE 0 END) AS trim2,
        SUM(CASE WHEN QUARTER(v.fecha_venta) = 3 THEN vd.cantidad ELSE 0 END) AS trim3,
        SUM(CASE WHEN QUARTER(v.fecha_venta) = 4 THEN vd.cantidad ELSE 0 END) AS trim4
      FROM ventas v
      JOIN venta_detalles vd ON v.id_venta = vd.id_venta
      JOIN producto p ON vd.id_producto = p.id_producto
      GROUP BY p.id_producto, p.nombre_producto
      ORDER BY p.nombre_producto;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ success: false, message: 'Error en la base de datos' });
      }
      res.status(200).json(results);
    });
  });


  app.get('/obtenerVentasEmpleados', (req, res) => {
    const query = `
      SELECT 
        CONCAT(e.Nombre, ' ', e.Apellidos) AS empleado, 
        COUNT(DISTINCT v.id_venta) AS cant_ventas, -- Contar ventas únicas
        SUM((
            SELECT SUM(vd.cantidad * vd.precio_unitario) 
            FROM venta_detalles vd 
            WHERE vd.id_venta = v.id_venta
        )) AS total
        FROM empleados e
        JOIN ventas v ON e.id_empleado = v.id_empleado
        GROUP BY e.id_empleado
        ORDER BY total DESC;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ success: false, message: 'Error en la base de datos' });
      }
      res.status(200).json(results);
    });
  });

  /* APIS PARA PRODUCTOS*/

// RUTA PARA MOSTRAR CLIENTES
app.get("/mostrarClientes", (req, res) => {
    const query = 'SELECT * FROM cliente WHERE estado_cliente = 1';
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ success: false, message: "Error en la base de datos" });
      } else {
        res.status(200).json(result);
      }
    });
  });
  
// RUTA PARA AGREGAR CLIENTE
app.post("/agregarCliente", (req, res) => {
    const { nombre, apellido, telefono, correo, direccion, ciudad, estado, codigo_postal, rfc, razon_social, regimen_fiscal } = req.body;
    
    db.query('CALL spInsertarCliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, telefono, correo, direccion, ciudad, estado, codigo_postal, rfc, razon_social, regimen_fiscal],
      (err, result) => {
        if (err) {
          console.error('Error en la base de datos:', err);
          return res.status(500).json({ success: false, message: "Error en la base de datos" });
        } else {
          res.status(200).json({ success: true, message: "Cliente Agregado Correctamente!!" });
        }
      }
    );
  });
  
  // RUTA PARA MODIFICAR CLIENTE
  app.put("/modificarCliente", (req, res) => {
    const { id_cliente, nombre, apellido, telefono, correo, direccion, ciudad, estado, codigo_postal, rfc, razon_social, regimen_fiscal } = req.body;
    
    db.query('CALL spActualizarCliente(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id_cliente, nombre, apellido, telefono, correo, direccion, ciudad, estado, codigo_postal, rfc, razon_social, regimen_fiscal],
      (err, result) => {
        if (err) {
          console.error('Error en la base de datos:', err);
          return res.status(500).json({ success: false, message: "Error en la base de datos" });
        } else {
          res.status(200).json({ success: true, message: "Cliente Modificado Correctamente!!" });
        }
      }
    );
  });
  
  // RUTA PARA ELIMINAR CLIENTE
  app.put("/eliminarCliente", (req, res) => {
    const { id_cliente } = req.body;
    
    db.query('CALL eliminarCliente(?)', [id_cliente], (err, result) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ success: false, message: "Error en la base de datos" });
      } else {
        res.status(200).json({ success: true, message: "Cliente eliminado correctamente" });
      }
    });
  });

//=========================================================================================================



//===================================================   Lizet  ===================================================================
//ruta para obtener informacion del usuario(empleado) eg: http://localhost:3002/empleados/usuario/pass
app.get("/empleados/:usuario/:pass", async (req, res) => {
    const usuario = req.params.usuario;
    const pass = req.params.pass;

    const query = 'SELECT * FROM empleados WHERE usuario = ? AND pass = sha2(?, 256)';
    try {
        const [result] = await db.promise().query(query, [usuario, pass]);
        if (result.length > 0) {
            res.json(result);
            console.log("result", result)
        } else {
            res.status(404).json({ success: false, message: "Usuario no encontrado o credenciales incorrectas" });
        }
    } catch (err) {
        console.error('Error en la base de datos:', err);
        res.status(500).json({ success: false, message: "Error en la base de datos" });
    }
});

//RUTAS PARA BUSCAR PRODUCTO POR CODIGO    eg: http://localhost:3002/buscarProducto/codigo
app.get("/buscarProducto/:codigo", async(req,res) =>{
    const codigo = req.params.codigo;
    const query = 'select * from producto where codigo=?';
    try {
        const [result] = await db.promise().query(query, [codigo]);
        if (result.length > 0) {
            res.json(result);
        }else {
            res.status(404).json({ success: false, message: "Producto no encontrado"});
        }
    } catch (err) {
        console.error('Error en la base de datos:', err);
        res.status(500).json({ success: false, message: "Error en la base de datos" });
    }
})
//RUTA PARA AUTOCOMPLETE DE PRODUCTO POR NOMBRE eg: http://localhost:3002/buscarProducto/nombre
app.get("/buscarProductoNombre/:nombre", async(req,res) =>{
    const nombre = req.params.nombre;
    const query = 'select * from producto where nombre_producto=?';
    try {
        const [result] = await db.promise().query(query, [nombre]);
        if (result.length > 0) {
            res.json(result);
        }else {
            res.status(404).json({ success: false, message: "Producto no encontrado"});
        }
    } catch (err) {
        console.error('Error en la base de datos:', err);
        res.status(500).json({ success: false, message: "Error en la base de datos" });
    }
})
//RUTA PARA PROCESO DE VENTA    eg: http://localhost:3002/registrarVenta
app.post("/registrarVenta", async (req, res) =>{
    let pv = { ...req.body }; 
    console.log(pv)
    const conexion = await db.promise();
    try{
        await conexion.beginTransaction(); 
        //insertar/generar una nueva venta
        const queryVentas = 'insert into ventas (id_empleado,id_cliente) values (?,?);';
        const [ventaRes] = await conexion.query(queryVentas, [pv.id_empleado, pv.id_cliente]);

        //insertar todos los detalles en venta_detalles de todos los productos que se van a vender
        let totalVenta=0;
        for (let producto of pv.productos) {
            const {id_producto, codigo, cantidad, precio, descripcion, stock} = producto;
            totalVenta+= cantidad*precio;
            //revisa el estock
            const [productoExistente] = await conexion.query('select stock from producto where id_producto = ?', [id_producto]);
            if (productoExistente[0].stock < cantidad) {
                console.error("Cantidad en el inventario insuficiente")
                throw new Error(`Stock insuficiente para el producto con codigo ${codigo}`);
            }
            //insertar los detalles de la venta
            await conexion.query('insert into venta_detalles (id_venta, id_producto, cantidad, precio_unitario) values(?, ?, ?, ?)', 
            [ventaRes.insertId, id_producto, cantidad, precio]);
            //actualizar el stock
            await conexion.query('update producto set stock=stock -? WHERE id_producto = ?', [cantidad, id_producto]);
        }
        //inserar/crear el ticket
        const queryTicket = 'insert into tickets(id_venta,id_empleado,id_cliente,total,cantidad_pagada) values (?,?,?,?,?);';
        await conexion.query(queryTicket, [ventaRes.insertId, pv.id_empleado, pv.id_cliente,  totalVenta, pv.cantidad_pagada]);
        await conexion.commit();
        res.json({ success: true, message: "Venta procesada y registrada correctamente." });
    }catch(err){
        await conexion.rollback();
        console.log(err)
        console.log('Error al procesar la venta');
        res.status(500).json({ success: false, message: `Error al procesar la venta: ${err.message}` });
    }
})

//RUTA PARA BUSCAR CLIENTE  eg: http://localhost:3002/cliente/nombre
app.get("/cliente/:nombre", async(req,res) =>{
    const nombre = req.params.nombre;
    const query = 'select id_cliente from cliente where nombre=?';
    try {
        const [result] = await db.promise().query(query, [nombre]);
        if (result.length > 0) {
            res.json(result);
        }else {
            res.status(404).json({ success: false, message: "Cliente no valido"});
        }
    } catch (err) {
        console.error('Error en la base de datos:', err);
        res.status(500).json({ success: false, message: "Error en la base de datos" });
    }
})


app.listen(3002, () => {
    console.log("Corriendo Servidor en el puerto 3002");
});


