'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material'
import FondoAnimado from '../Components/FondoAnimado.tsx'
import NavBar from '../Components/NavBar.tsx'
import CustomToolbar from '../Components/CustomToolbar.tsx'
import { styled } from '@mui/material/styles'
import { TableVirtuoso, TableComponents } from 'react-virtuoso'
import {DatosGlobalesContexto} from '../Components/ContextoDatosGlobales.js'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSymbologyScanner } from '@use-symbology-scanner/react'
import axios from 'axios'

const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

interface Data {
  id_producto: number;
  cantidad: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
}

interface ColumnData {
  dataKey: keyof Data| 'action';
  label: string;
  numeric?: boolean;
  width: number;
}

interface Cliente {
  id_cliente: number;
  nombre: string;
}

const columns: ColumnData[] = [
  {
    width: 60,
    label: 'Cantidad',
    dataKey: 'cantidad',
    numeric: true,
  },
  {
    width: 80,
    label: 'Código',
    dataKey: 'codigo',
  },
  {
    width: 160,
    label: 'Descripción',
    dataKey: 'descripcion',
  },
  {
    width: 80,
    label: 'Precio',
    dataKey: 'precio',
    numeric: true,
  },
  {
    width: 80,
    label: 'Existencia',
    dataKey: 'stock',
    numeric: true,
  },
  {
    width: 80,
    label: 'Acción',
    dataKey: 'action',
  },
]

const VirtuosoTableComponents: TableComponents<Data> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead,
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
}

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width }}
          sx={{ backgroundColor: 'background.paper', fontSize: '0.8rem' }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  )
}

export default function Component() {
  const [open, setOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState('/sales')
  const datosGlobales = React.useContext(DatosGlobalesContexto)
  const [codigo, setCodigo] = useState('')
  const [rows, setColumnas] = useState<Data[]>([])
  const [nuevaCantidad, setNuevaCantidad] = useState<number|null>(1)
  const [productos, setProductos] = useState<{id_producto: number; codigo: string; cantidad: number; precio: number; descripcion: string; stock: number}[]>([])
  const [totalVenta, setTotalVenta] = useState(0)
  const [valueNombre, setNombre] = useState('')
  const cantidadRef = React.useRef(null)
  const codigoRef = React.useRef(null)
  const pagoRef = React.useRef(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [valueCliente, setValueCliente] = useState(1)
  const [cliente, setCliente] = useState('Mostrador')
  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    const total = productos.reduce((acc, prod) => acc + prod.cantidad * prod.precio, 0)
    setTotalVenta(total)
    codigoRef.current.focus()

    // Fetch clients
    axios.get('http://localhost:3002/clientes')
      .then(response => {
        if (response.data.success) {
          setClientes(response.data.data.map(client => ({ id_cliente: client.id_cliente, nombre: client.nombre })))
        } else {
          console.error('Error fetching clients:', response.data.message)
        }
      })
      .catch(error => {
        console.error('Error fetching clients:', error)
      })
  }, [productos])
  
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const onCodigoChange = (e) => {
    setCodigo(e.target.value)
    if(e.target.value === "") {
      setCodigo('')
    } else {
      buscarProducto(e.target.value)
    }
  }

  const onCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let nvCantidad = parseInt(e.target.value, 10); 
    setNuevaCantidad(nvCantidad);
  }

  const onNombreChange = (e) => {
    setNombre(e.target.value)
    if(e.target.value === '') {
      setCodigo('')
    } else {
      buscarProductoNombre(e.target.value)
    }
  }

  const handleClienteChange = (event, newValue) => {
    if (newValue) {
      setCliente(newValue.nombre)
      setValueCliente(newValue.id_cliente)
    } else {
      setCliente('Mostrador')
      setValueCliente(1)
    }
  }

  const limpiar = () => {
    setNombre('')
    setCodigo('')
    setNuevaCantidad(1)
    setPaymentAmount('')
    codigoRef.current.focus()
  }
  
  const buscarProducto = (eCod) => {
    console.log(eCod)
    if (eCod !== null) {
      fetch(`http://localhost:3002/buscarProducto/${eCod}`)
        .then((response) => response.json())
        .then((json) => {
          if (json.success === false) {
            console.log("Producto no encontrado")
            setNombre("")
          } else {
            setNombre(json[0].nombre_producto)
          }
        }).catch(() => {
          alert("Error en el servidor")
        })
    }
  }

  const buscarProductoNombre = (eCod) => {
    console.log(eCod)
    if (eCod !== null) {
      fetch(`http://localhost:3002/buscarProductoNombre/${eCod}`)
        .then((response) => response.json())
        .then((json) => {
          if (json.success === false) {
            setCodigo("")
          } else {
            console.log(json[0])
            setCodigo(json[0].codigo)
          }
        }).catch(() => {
          alert("Error en el servidor")
        })
    }
  }

  const agregaProducto=()=>{
    if (codigo !== null && codigo!=='' && valueNombre!=='' && nuevaCantidad!==null && nuevaCantidad>0 ){
      fetch(`http://localhost:3002/buscarProducto/${codigo}`)
        .then((response) => response.json())  
        .then((json) => {
          if (json.success === false) {
            alert("Producto no encontrado");
          } else {
            const nuevoProducto = {
              id_producto: json[0].id_producto,
              codigo: json[0].codigo,
              nombre: valueNombre,
              cantidad: nuevaCantidad || 0,
              precio: json[0].precio,
              descripcion: json[0].descripcion,
              stock: json[0].stock
            }
            actualizarProducto(nuevoProducto)
            limpiar()
          }
        }).catch(() => {
          alert("Error en el servidor");
        });
    }else if(codigo === null || codigo===''){
      alert("Debe ingesar un codigo")
      codigoRef.current.focus();
    }else if( valueNombre===''){
      alert("Debe ingesar un nombre")
    }else if(nuevaCantidad===null || Number.isNaN(nuevaCantidad) || nuevaCantidad<=0){
      console.log(nuevaCantidad)
      alert("Debe ingesar una cantidad mayor a cero")
      cantidadRef.current.focus();
    }
  }

  const ventaData = {
    productos: productos,
    id_empleado: datosGlobales.data.id_empleado,
    id_cliente: valueCliente,
    metodo_de_pago: 'Tarjeta de crédito',
    cantidad_pagada: paymentAmount
  }

  const onGuardar = () => {
    if(productos.length > 0) {
      setPaymentDialogOpen(true)
    }
  }

  const onCancelar = () => {
    limpiar()
    setProductos([])
    setColumnas([])
    setValueCliente(1)
    setCliente('Mostrador')
  }

  const actualizarProducto = (nuevoProducto) => {
    setProductos((prevProductos) => {
      const productoExistente = prevProductos.find(
        (producto) => producto.id_producto === nuevoProducto.id_producto
      );
      if (productoExistente) {
        return prevProductos.map((producto) =>
          producto.id_producto === nuevoProducto.id_producto
            ? { ...producto, cantidad: producto.cantidad + nuevoProducto.cantidad }
            : producto
        );
      } else {
        return [...prevProductos, nuevoProducto];
      }
    });
    setColumnas((prevColumnas) => {
      const columnaExistente = prevColumnas.find(
        (columna) => columna.id_producto === nuevoProducto.id_producto
      );
  
      if (columnaExistente) {
        return prevColumnas.map((columna) =>
          columna.id_producto === nuevoProducto.id_producto
            ? { ...columna, cantidad: columna.cantidad + nuevoProducto.cantidad }
            : columna
        );
      } else {
        return [...prevColumnas, nuevoProducto];
      }
    });
  };

  const eliminarProducto = (id_producto: number) => {
    setProductos((prev) => {
      const productosActualizados = prev.filter((prod) => prod.id_producto !== id_producto);
      setColumnas(productosActualizados); //colunas con nuevo estado
      return productosActualizados; //nuevo estado de productos
    });
  };

  const handlePaymentConfirm = () => {
    if(paymentAmount !== '') {
      setPaymentDialogOpen(false)
      setConfirmationDialogOpen(true)
    } else {
      alert("Debe ingresar una cantidad")
      pagoRef.current.focus()
    }
  }

  const handleSaleConfirm = () => {
    if(productos.length > 0) {
      fetch('http://localhost:3002/registrarVenta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ventaData)
      })
      .then(response => response.json())
      .then(data => {
          if(data.success === true) {
            setConfirmationDialogOpen(false)
            setTicketDialogOpen(true)
          } else {
            alert(data.message)
          }
      })
      .catch(error => {
          alert(error)
          console.error('Error:', error)
      })
    }
  }
  
  const rowContent = (index: number, row: Data) => {
    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nuevaCantidad = parseInt(e.target.value, 10) || 0; // Asegúrate de manejar valores no numéricos como 0
      setColumnas((prevColumnas) =>
        prevColumnas.map((columna) =>
          columna.id_producto === row.id_producto
            ? { ...columna, cantidad: nuevaCantidad }
            : columna
        )
      );
      setProductos((prevProductos) =>
        prevProductos.map((producto) =>
          producto.id_producto === row.id_producto
            ? { ...producto, cantidad: nuevaCantidad }
            : producto
        )
      );
    };
  
    return (
      <React.Fragment>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            align={column.numeric ? 'right' : 'left'}
            style={{ width: column.width }}
          >
            {column.dataKey === 'cantidad' ? (
              <TextField
                type="number"
                value={row.cantidad}
                onChange={handleCantidadChange}
                inputProps={{ min: 0, style: { textAlign: 'right' } }}
                size="small"
                fullWidth
              />
            ) : column.dataKey === 'action' ? (
              <IconButton
                onClick={() => eliminarProducto(row.id_producto)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            ) : (
              row[column.dataKey as keyof Data]
            )}
          </TableCell>
        ))}
      </React.Fragment>
    );
  };
  

  return (
    <FondoAnimado>
      <NavBar toggleDrawer={toggleDrawer} />
      <CustomToolbar open={open} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <Main open={open}>
        <Toolbar />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              backgroundColor: 'white',
              minHeight: '70vh',
              width: '90%', 
              maxWidth: '1500px', 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography>Empleado: {`${datosGlobales.data.Nombre} ${datosGlobales.data.Apellidos}`}</Typography>
              <Typography>Fecha: {new Date().toLocaleDateString()}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="caption">Cód. Producto:</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      onChange={onCodigoChange}
                      value={codigo}
                      inputRef={codigoRef}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption">Nombre:</Typography>
                    <TextField
                      onChange={onNombreChange}
                      value={valueNombre}
                      fullWidth
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 2, mb: 2}}>
                  <Box>
                    <Typography variant="caption">Cant:</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      onChange={onCantidadChange}
                      value={nuevaCantidad}
                      inputRef={cantidadRef}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption">Cliente:</Typography>
                    <Autocomplete
                      options={clientes}
                      getOptionLabel={(option) => option.nombre}
                      renderInput={(params) => <TextField {...params} size="small" />}
                      value={clientes.find(c => c.id_cliente === valueCliente) || null}
                      onChange={handleClienteChange}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, mt: 3, width: '100%'}}>
                    <Button 
                      variant="outlined"
                      sx={{ borderRadius: 20, width: '80%' }}
                      onClick={agregaProducto}
                    >
                      Agregar Producto
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Paper style={{ height: 240, width: '100%', maxWidth: 1300, margin: '0 auto' }}>
              <TableVirtuoso
                data={rows}
                components={VirtuosoTableComponents}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
              />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 7 }}>
              <Button 
                variant="outlined"
                size="small" 
                sx={{ 
                  borderRadius: 20,
                  px: 3,         
                  py: 1.5,       
                  fontSize: '1rem'
                }}
                onClick={onCancelar}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained"
                size="small" 
                sx={{ 
                  borderRadius: 20,
                  bgcolor: '#ffa726',
                  '&:hover': {
                    bgcolor: '#fb8c00'
                  },
                  px: 3,         
                  py: 1.5,       
                  fontSize: '1rem'
                }}
                onClick={onGuardar}
              >
                Guardar
              </Button>
              <Box sx={{ border: 1, borderColor: 'divider', px: 2, py: 1 }}>
                <Typography variant="body2">Total Venta: $ ${totalVenta.toFixed(2)}</Typography> 
              </Box>
            </Box>
          </Paper>
        </Box>
      </Main>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Confirmar Pago</DialogTitle>
        <DialogContent>
          <Typography>Total a pagar: ${totalVenta.toFixed(2)}</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Cantidad pagada"
            type="number"
            fullWidth
            value={paymentAmount}
            onChange={(event) => setPaymentAmount(event.target.value)} 
            inputRef={pagoRef}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setPaymentDialogOpen(false);}}
            sx={{
              borderRadius: 20,
              bgcolor: '#f44336',
              color: 'white',
              '&:hover': {
                bgcolor: '#d32f2f'
              },
              px: 3,
              py: 1
            }}>
            Cancelar
          </Button>
          <Button onClick={handlePaymentConfirm} 
          variant="contained" color="primary"
            sx={{
              borderRadius: 20,
              bgcolor: '#ffa726',
              color: 'white',
              '&:hover': {
                bgcolor: '#fb8c00'
              },
              px: 3,
              py: 1
            }}>
            Confirmar Pago
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)}>
        <DialogTitle>
          Confirmar Venta
        </DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro de que desea confirmar esta venta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setConfirmationDialogOpen(false); setPaymentDialogOpen(true)}}
            sx={{
              borderRadius: 20,
              bgcolor: '#f44336',
              color: 'white',
              '&:hover': {
                bgcolor: '#d32f2f'
              },
              px: 3,
              py: 1
            }}>
              Cancelar
          </Button>
          <Button 
            variant="contained" color="primary"
            onClick={handleSaleConfirm}
            sx={{
              borderRadius: 20,
              bgcolor: '#ffa726',
              color: 'white',
              '&:hover': {
                bgcolor: '#fb8c00'
              },
              px: 3,
              py: 1
            }}>
            Confirmar Venta
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={ticketDialogOpen} 
        onClose={() => {setTicketDialogOpen(false); limpiar(); setCliente('Mostrador'); setValueCliente(1); setProductos([]); setColumnas([])}}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ticket de Venta || Resumen de la venta</DialogTitle>
        <DialogContent>
          <Typography>Fecha: {new Date().toLocaleDateString()}</Typography>
          <Typography>Empleado que realizó la venta: {`${datosGlobales.data.Nombre} ${datosGlobales.data.Apellidos}`}</Typography>
          <Typography>Cliente: {cliente}</Typography>
          <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio U.</TableCell>
                  <TableCell align="right">Precio Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id_producto}>
                    <TableCell>{row.descripcion}</TableCell>
                    <TableCell align="right">{row.cantidad}</TableCell>
                    <TableCell align="right">${row.precio}</TableCell>
                    <TableCell align="right">${(row.cantidad * row.precio).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6">Total: ${totalVenta.toFixed(2)}</Typography>
          <Typography>Cantidad pagada: ${paymentAmount}</Typography>
          <Typography>Cambio: ${(parseFloat(paymentAmount) - totalVenta).toFixed(2)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setTicketDialogOpen(false); limpiar(); setCliente('Mostrador');setValueCliente(1); setProductos([]); setColumnas([])}} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </FondoAnimado>
  )
}