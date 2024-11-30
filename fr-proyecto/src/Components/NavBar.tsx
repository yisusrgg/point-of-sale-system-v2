import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material'
import { Menu as MenuIcon, User } from 'lucide-react'
import { AccountCircle, Logout } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom';
import {DatosGlobalesContexto} from './ContextoDatosGlobales.js';

interface NavBarProps {
  toggleDrawer: () => void;
}

export default function NavBar({ toggleDrawer }: NavBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate();
  const {setData} = React.useContext(DatosGlobalesContexto)

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    setAnchorEl(null)
    setData(null)
    navigate('/');
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          edge="start"
          sx={{ mr: 2, color: 'black' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1, color: 'black', fontWeight: 500 }}>
          Proceso de venta
        </Typography>
        <IconButton
          onClick={handleUserMenuOpen}
          aria-label="cuenta de usuario"
          aria-controls="user-menu"
          aria-haspopup="true"
        >
          <AccountCircle sx={{ fontSize: 32, color: '#666' }} />
        </IconButton>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
