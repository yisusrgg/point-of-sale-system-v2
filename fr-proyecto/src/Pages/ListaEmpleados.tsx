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

interface Employee {
  id_empleado: number;
  Nombre: string;
  Apellidos: string;
  usuario: string;
  pass: string;
  Telefono: string;
  Correo: string;
  salario: number;
}

export default function EmployeeList() {
  const [open, setOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState('/employees')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    fetch("http://localhost:3002/mostrarEmpleados")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setEmployees(data);
      })
      .catch((error) => console.log("Error al cargar los productos", error));
  }, []);
  
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setDialogOpen(true)
  }

  const handleDeleteEmployee = (id_empleado: number) => {

    Axios.put("http://localhost:3002/eliminarEmpleado", {
      id: id_empleado,
    }).then((response) => {
      setEmployees(employees.filter(emp => emp.id_empleado !== id_empleado))
    }).catch((error) => {
      if(error.response && error.response.data.message){
        alert(error.response.data.message);
      } else {
        alert("Ocurrió un error al eliminar el empleado.")
      }
    });
  }

  const handleSaveEmployee = (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
  
    const employeeData: Employee = {
      id_empleado: editingEmployee ? editingEmployee.id_empleado : Math.max(...employees.map(e => e.id_empleado), 0) + 1,
      Nombre: formData.get('nombre') as string,
      Apellidos: formData.get('apellidos') as string,
      usuario: formData.get('usuario') as string,
      pass: formData.get('contraseña') as string,
      Telefono: formData.get('telefono') as string,
      Correo: formData.get('correo') as string,
      salario: Number(formData.get('salario')),
    }
  
    if (editingEmployee) {
      // Realiza la solicitud PUT al backend con el ID del empleado a modificar
      Axios.put("http://localhost:3002/modificarEmpleado", {
        id: editingEmployee.id_empleado,  // Usa el id_empleado del estado editingEmployee
        Nombre: employeeData.Nombre,
        usuario: employeeData.usuario,
        pass: employeeData.pass,
        Apellidos: employeeData.Apellidos,
        Correo: employeeData.Correo,
        Telefono: employeeData.Telefono,
        salario: employeeData.salario
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((response) => {
        alert("Empleado Modificado Correctamente")
        // Actualiza el estado de los empleados con la información modificada
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => 
            emp.id_empleado === employeeData.id_empleado ? employeeData : emp
          )
        )
      })
      .catch((error) => {
        console.error("Error en Axios:", error.response || error.message);
        alert("Ocurrió un error en la solicitud. Inténtalo de nuevo.");
      })
    } else {
      // Lógica para agregar un nuevo empleado si no estás editando uno existente
      Axios.post("http://localhost:3002/registrarEmpleado", {
        Nombre: employeeData.Nombre,
        usuario: employeeData.usuario,
        pass: employeeData.pass,
        Apellidos: employeeData.Apellidos,
        Correo: employeeData.Correo,
        Telefono: employeeData.Telefono,
        salario: employeeData.salario
      }).then((response) => {
        alert("Empleado Registrado Correctamente")
        setEmployees(prevEmployees => [...prevEmployees, employeeData])
      }).catch((error) => {
        alert("Ocurrió un error al registrar el empleado.")
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
                onClick={handleAddEmployee}
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
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellidos</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Salario</TableCell>
                    <TableCell align="center">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id_empleado}>
                      <TableCell>{employee.id_empleado}</TableCell>
                      <TableCell>{employee.Nombre}</TableCell>
                      <TableCell>{employee.Apellidos}</TableCell>
                      <TableCell>{employee.usuario}</TableCell>
                      <TableCell>{employee.Telefono}</TableCell>
                      <TableCell>{employee.Correo}</TableCell>
                      <TableCell>${employee.salario}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditEmployee(employee)}
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
                          onClick={() => handleDeleteEmployee(employee.id_empleado)}
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
        <form onSubmit={handleSaveEmployee}>
          <DialogTitle>
            {editingEmployee ? 'Modificar Empleado' : 'Agregar Empleado'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                defaultValue={editingEmployee?.Nombre}
                required
              />
              <TextField
                fullWidth
                label="Apellidos"
                name="apellidos"
                defaultValue={editingEmployee?.Apellidos}
                required
              />
              <TextField
                fullWidth
                label="Usuario"
                name="usuario"
                defaultValue={editingEmployee?.usuario}
                required
              />
              <TextField
                fullWidth
                label="Contraseña"
                name="contraseña"
                type="password"
                defaultValue={editingEmployee?.pass}
                required
              />
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                defaultValue={editingEmployee?.Telefono}
                required
              />
              <TextField
                fullWidth
                label="Correo"
                name="correo"
                type="email"
                defaultValue={editingEmployee?.Correo}
                required
              />
              <TextField
                fullWidth
                label="Salario"
                name="salario"
                type="number"
                defaultValue={editingEmployee?.salario}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button  type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </FondoAnimado>
  )
}