import React from 'react'
import {
  Drawer,
  Toolbar,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { ShoppingCart, Users, ClipboardList, BarChart3, Home, UserCheck } from 'lucide-react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 40px;
  & > svg {
    width: 24px;
    height: 24px;
    color: #666;
  }
`

const navigationItems = [
  { 
    title: 'Proceso de venta',
    icon: ShoppingCart,
    path: '/procesoventa'
  },
  { 
    title: 'Lista de empleados',
    icon: Users,
    path: '/empleados'
  },
  { 
    title: 'Lista de productos',
    icon: ClipboardList,
    path: '/productos'
  },
  { 
    title: 'Reporte de ventas',
    icon: BarChart3,
    path: '/reportes'
  },
  { 
    title: 'Lista Clientes',
    icon: UserCheck,
    path: '/clientes'
  },
]

interface CustomToolbarProps {
  open: boolean;
  selectedItem: string;
  setSelectedItem: (path: string) => void;
}

export default function CustomToolbar({ open, selectedItem, setSelectedItem }: CustomToolbarProps) {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: 'white',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {navigationItems.map((item) => (
            <ListItem 
              key={item.path} 
              disablePadding
              sx={{ 
                backgroundColor: selectedItem === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              }}
            >
              <ListItemButton
                onClick={() => {
                  setSelectedItem(item.path); 
                  navigate(item.path); 
                }}
                sx={{ 
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <StyledListItemIcon>
                  <item.icon />
                </StyledListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.95rem',
                      color: '#666',
                      fontWeight: 500
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}