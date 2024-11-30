'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  AddAPhoto
} from '@mui/icons-material'
import FondoAnimado from '../Components/FondoAnimado.tsx'
import NavBar from '../Components/NavBar.tsx'
import CustomToolbar from '../Components/CustomToolbar.tsx'
import Axios from 'axios'
import { Podcast } from 'lucide-react'
import React from 'react'
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

interface Product {
  id_producto: number;
  nombre_producto: string;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  descontinuado: boolean;
}

export default function ProductList() {
  const [open, setOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState('/products')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("http://localhost:3002/mostrarProductos")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setProducts(data);
      })
      .catch((error) => console.log("Error al cargar los productos", error));
  }, []);

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleAddProduct = () => {
    setEditingProduct({
      id_producto: 0,
      codigo: '',
      nombre_producto: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      descontinuado: false
    })
    setDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      ...product,
      precio: Number(product.precio),
    });
    setDialogOpen(true);
  }

  const handleDeleteProduct = (id_producto: number) => {
    Axios.put("http://localhost:3002/eliminarProducto", {
      id: id_producto,
    }).then((response) => {
      alert(id_producto);
      alert("Producto Cambiado a estado DESCONTINUADO");
      setProducts(products.map(prod => 
        prod.id_producto === id_producto ? { ...prod, descontinuado: true } : prod
      ));
    }).catch((error) => {
      console.error("Error en la eliminación:", error);
      alert("Ocurrió un error al cambiar el estado del producto.");
    });
  };
  
  

  const handleSaveProduct = (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingProduct) return

    const productData: Product = {
      ...editingProduct,
      id_producto: editingProduct.id_producto || Math.max(...products.map(p => p.id_producto), 0) + 1,
    }
    console.log("productoData",productData)

    if (editingProduct.id_producto) { 
      Axios.put("http://localhost:3002/modificarProducto", {
        id: productData.id_producto,
        codigo: productData.codigo,
        nombre_producto: productData.nombre_producto, 
        descripcion: productData.descripcion, 
        precio: productData.precio, 
        stock: productData.stock, 
        descontinuado: productData.descontinuado
      }).then((response) => {
        alert("Producto Modificado Correctamente");
        setProducts(products.map(prod => prod.id_producto === editingProduct.id_producto ? productData : prod))
      }).catch((error) => {
        alert(error.message);
        //alert("Ocurrió un error en la modificacion del producto. Inténtalo de nuevo.");
      });
    } else {
      Axios.post("http://localhost:3002/agregarProducto", {
        nombre_producto: productData.nombre_producto,
        codigo: productData.codigo, 
        descripcion: productData.descripcion, 
        precio: productData.precio, 
        stock: productData.stock, 
        descontinuado: productData.descontinuado
      }).then((response) => {
        alert("Producto Agreagado Correctamente");
        setProducts([...products, productData]);
      }).catch((error) => {
        alert("Ocurrió un error en la agregar el producto. Inténtalo de nuevo.");
      });
    }
    setDialogOpen(false)
  }


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log( event.target)
    if (!editingProduct) return;
    const { name, value, type, checked } = event.target;
    setEditingProduct({
      ...editingProduct,
      [name]: name === 'precio' ? Number(value) : type === 'checkbox' ? checked : value,
    });
  };
  

  return (
    <FondoAnimado>
      <NavBar toggleDrawer={toggleDrawer} />
      <CustomToolbar open={open} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <Main open={open}>
        <Toolbar />
        <Box sx={{ p: 3 , display: 'flex', justifyContent: 'center' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              backgroundColor: 'white',
              minHeight: '68vh',
              width: '90%',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                onClick={handleAddProduct}
                sx={{ 
                  borderRadius: 20,
                  px: 4
                }}
              >
                Agregar
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Codigo</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Descontinuado</TableCell>
                    <TableCell align="center">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id_producto}>
                      <TableCell>{product.codigo}</TableCell>
                      <TableCell>{product.nombre_producto}</TableCell>
                      <TableCell>{product.descripcion}</TableCell>
                      <TableCell>${product.precio}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.descontinuado ? 'SÍ' : 'NO'}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditProduct(product)}
                          sx={{ 
                            borderRadius: 20,
                            mr: 1
                          }}
                        >
                          Modificar
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProduct(product.id_producto)}
                          sx={{ 
                            borderRadius: 20
                          }}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Main>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <form onSubmit={handleSaveProduct}>
          <DialogTitle>
            {editingProduct?.id_producto ? 'Modificar Producto' : 'Agregar Producto'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del producto"
                name="nombre_producto"
                value={editingProduct?.nombre_producto || ''}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Codigo del producto"
                name="codigo"
                value={editingProduct?.codigo || ''}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                multiline
                rows={3}
                value={editingProduct?.descripcion || ''}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Precio"
                name="precio"
                type="number"
                inputProps={{ step: "0.01" }}
                value={editingProduct?.precio || ''}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={editingProduct?.stock || ''}
                onChange={handleInputChange}
                required
              />
              <FormControlLabel
                control={
                  <Switch
                    name="descontinuado"
                    checked={editingProduct?.descontinuado || false}
                    onChange={handleInputChange}
                  />
                }
                label={editingProduct?.descontinuado ? "SÍ" : "NO"}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </FondoAnimado>
  )
}