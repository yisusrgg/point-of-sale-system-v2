'use client'

import { useState, useEffect } from 'react'
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
} from '@mui/material'
import { styled } from '@mui/material/styles'
import FondoAnimado from '../Components/FondoAnimado.tsx'
import NavBar from '../Components/NavBar.tsx'
import CustomToolbar from '../Components/CustomToolbar.tsx'
import Axios from "axios";
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

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  rfc: string;
  razon_social: string;
  regimen_fiscal: string;
}

export default function ListaClientes() {
  const [open, setOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState('/clientes')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])

  const fetchClientes = () => {
    fetch("http://localhost:3002/mostrarClientes")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setClientes(data);
      })
      .catch((error) => console.log("Error al cargar los clientes", error));
  };

  useEffect(() => {
    fetchClientes();
  }, []);
  
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleAddCliente = () => {
    setEditingCliente(null)
    setDialogOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setDialogOpen(true)
  }

  const handleDeleteCliente = (id_cliente: number) => {
    Axios.put("http://localhost:3002/eliminarCliente", {
      id_cliente: id_cliente,
    }).then((response) => {
      if (response.data.success) {
        fetchClientes(); // Refresh the client list
        alert(response.data.message);
      } else {
        alert(response.data.message);
      }
    }).catch((error) => {
      if(error.response && error.response.data.message){
        alert(error.response.data.message);
      } else {
        alert("Ocurrió un error al eliminar el cliente.")
      }
    });
  }

  const handleSaveCliente = (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
  
    const clienteData: Cliente = {
      id_cliente: editingCliente ? editingCliente.id_cliente : 0,
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
      telefono: formData.get('telefono') as string,
      correo: formData.get('correo') as string,
      direccion: formData.get('direccion') as string,
      ciudad: formData.get('ciudad') as string,
      estado: formData.get('estado') as string,
      codigo_postal: formData.get('codigo_postal') as string,
      rfc: formData.get('rfc') as string,
      razon_social: formData.get('razon_social') as string,
      regimen_fiscal: formData.get('regimen_fiscal') as string,
    }
  
    if (editingCliente) {
      Axios.put("http://localhost:3002/modificarCliente", {
        id_cliente: editingCliente.id_cliente,
        ...clienteData
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((response) => {
        alert("Cliente Modificado Correctamente")
        fetchClientes(); // Refresh the client list
      })
      .catch((error) => {
        console.error("Error en Axios:", error.response || error.message);
        alert("Ocurrió un error en la solicitud. Inténtalo de nuevo.");
      })
    } else {
      Axios.post("http://localhost:3002/agregarCliente", clienteData)
        .then((response) => {
          alert("Cliente Registrado Correctamente")
          fetchClientes(); // Refresh the client list
        }).catch((error) => {
          alert("Ocurrió un error al registrar el cliente.")
        })
    }
  
    setDialogOpen(false)
  }

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
                onClick={handleAddCliente}
                sx={{ 
                  borderRadius: 20,
                  px: 4
                }}
              >
                Agregar Cliente
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>RFC</TableCell>
                    <TableCell align="center">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id_cliente}>
                      <TableCell>{cliente.id_cliente}</TableCell>
                      <TableCell>{cliente.nombre}</TableCell>
                      <TableCell>{cliente.apellido}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>{cliente.correo}</TableCell>
                      <TableCell>{cliente.rfc}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditCliente(cliente)}
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
                          onClick={() => handleDeleteCliente(cliente.id_cliente)}
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
        <form onSubmit={handleSaveCliente}>
          <DialogTitle>
            {editingCliente ? 'Modificar Cliente' : 'Agregar Cliente'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                defaultValue={editingCliente?.nombre}
                required
              />
              <TextField
                fullWidth
                label="Apellido"
                name="apellido"
                defaultValue={editingCliente?.apellido}
                required
              />
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                defaultValue={editingCliente?.telefono}
                required
              />
              <TextField
                fullWidth
                label="Correo"
                name="correo"
                type="email"
                defaultValue={editingCliente?.correo}
                required
              />
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                defaultValue={editingCliente?.direccion}
                required
              />
              <TextField
                fullWidth
                label="Ciudad"
                name="ciudad"
                defaultValue={editingCliente?.ciudad}
                required
              />
              <TextField
                fullWidth
                label="Estado"
                name="estado"
                defaultValue={editingCliente?.estado}
                required
              />
              <TextField
                fullWidth
                label="Código Postal"
                name="codigo_postal"
                defaultValue={editingCliente?.codigo_postal}
                required
              />
              <TextField
                fullWidth
                label="RFC"
                name="rfc"
                defaultValue={editingCliente?.rfc}
                required
              />
              <TextField
                fullWidth
                label="Razón Social"
                name="razon_social"
                defaultValue={editingCliente?.razon_social}
                required
              />
              <TextField
                fullWidth
                label="Régimen Fiscal"
                name="regimen_fiscal"
                defaultValue={editingCliente?.regimen_fiscal}
                required
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

