'use client'

import React from 'react'
import { useState } from 'react'
import { Box,Button,Container,TextField,Typography,Paper,InputAdornment,IconButton } from '@mui/material'
import FondoAnimado from '../Components/FondoAnimado.tsx'
import { AccountCircle, Visibility, VisibilityOff, Key as KeyIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom';
import {DatosGlobalesContexto} from '../Components/ContextoDatosGlobales.js';


export default function Login() {
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [mostrarContraseña, setMostrarContraseña] = useState(false)
  const [errores, setErrores] = useState({ nombreUsuario: false, contraseña: false })
  const navigate = useNavigate();
  const {setData} = React.useContext(DatosGlobalesContexto)

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevosErrores = { 
      nombreUsuario: nombreUsuario.trim() === '', 
      contraseña: contraseña.trim() === '' 
    }
    setErrores(nuevosErrores)

    if (!nuevosErrores.nombreUsuario && !nuevosErrores.contraseña) {
      console.log('Formulario enviado')
    }
  }

  const manejarMostrarContraseña = () => {
    setMostrarContraseña(!mostrarContraseña)
  }

  const manejarMouseDownContraseña = (evento: React.MouseEvent<HTMLButtonElement>) => {
    evento.preventDefault()
  }
  const onBotonEntrarClick = (event) => {
    event.preventDefault(); //Prevenir el comportamiento por defecto del formulario
    fetch(`http://localhost:3002/empleados/${nombreUsuario}/${contraseña}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.success === false) {
          alert("Acceso denegado");
        } else {
          alert("Acceso concedido");
          console.log(json[0])
          setData(json[0]);
          navigate('/procesoventa', { state: json });
        }
      })
      .catch(() => {
        alert("Error en el servidor")
      });
  };

  return (
    <FondoAnimado>
      <Container maxWidth="xs">
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxWidth: '350px',
            margin: '0 auto',
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Iniciar sesión
          </Typography>
          <form onSubmit={manejarEnvio}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="usuario"
              label="Usuario"
              name="usuario"
              autoComplete="username"
              autoFocus
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              error={errores.nombreUsuario}
              helperText={errores.nombreUsuario ? 'Este campo es requerido' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color={errores.nombreUsuario ? 'error' : 'inherit'} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errores.nombreUsuario ? 'red' : 'inherit',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: errores.nombreUsuario ? 'red' : 'inherit',
                },
                '& .MuiFormHelperText-root': {
                  color: 'red',
                },
                my: 1.5
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="contraseña"
              label="Contraseña"
              type={mostrarContraseña ? 'text' : 'password'}
              id="contraseña"
              autoComplete="current-password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              error={errores.contraseña}
              helperText={errores.contraseña ? 'Este campo es requerido' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon color={errores.contraseña ? 'error' : 'inherit'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={manejarMostrarContraseña}
                      onMouseDown={manejarMouseDownContraseña}
                      edge="end"
                    >
                      {mostrarContraseña ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: errores.contraseña ? 'red' : 'inherit',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: errores.contraseña ? 'red' : 'inherit',
                },
                '& .MuiFormHelperText-root': {
                  color: 'red',
                },
                my: 1.5
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="medium"
                sx={{ 
                  borderRadius: '20px',
                  width: '60%',
                }}
                onClick={onBotonEntrarClick}
              >
                Ingresar
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </FondoAnimado>
  )
}
