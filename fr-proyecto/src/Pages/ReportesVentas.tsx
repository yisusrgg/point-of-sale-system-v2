'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tab,
  Tabs,
  Button,
} from '@mui/material'
import Axios from 'axios'
import { styled } from '@mui/material/styles'
import FondoAnimado from '../Components/FondoAnimado.tsx'
import NavBar from '../Components/NavBar.tsx'
import CustomToolbar from '../Components/CustomToolbar.tsx'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import dayjs, { Dayjs } from 'dayjs'

const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
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

interface Sale {
  id_venta: number
  fecha_venta: string
  empleado: string
  cliente: string
  total_venta: number | string
}

interface Product {
  id_producto: number
  nombre_producto: string
  cantidad: number
  precio_unitario: string
  total: string
}

interface EmployeeSales {
  empleado: string
  total: number
  cant_ventas: number
}

interface QuarterlySales {
  producto: string
  trim1: number
  trim2: number
  trim3: number
  trim4: number
}

export default function SalesReport() {
  const [open, setOpen] = useState(true)
  const [sales, setSales] = useState<Sale[]>([])
  const [employeeSales, setEmployeeSales] = useState<EmployeeSales[]>([])
  const [quarterlySales, setQuarterlySales] = useState<QuarterlySales[]>([])
  const [venta, setVenta] = useState<Sale | null>(null)
  const [selectedSale, setSelectedSale] = useState<{ productos: Product[]; fecha_venta: string; total_venta: number; empleado: string ; cliente: string } | null>(null)
  const [timeFilter, setTimeFilter] = useState<string | null>('day')
  const [openDialog, setOpenDialog] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
  const [employeeSelectedDate, setEmployeeSelectedDate] = useState<Dayjs | null>(dayjs())
  const [quarterlySelectedYear, setQuarterlySelectedYear] = useState<Dayjs | null>(dayjs())

  useEffect(() => {

    fetch('http://localhost:3002/obtenerVentas')
      .then((response) => response.json())
      .then((data) => setSales(data))
      .catch((error) => console.error('Error al obtener las ventas:', error));
  
    if (employeeSelectedDate) {
      fetchSales(employeeSelectedDate);
    }

    if (quarterlySelectedYear) {
      fetchSalesComp(quarterlySelectedYear);
    }
  
  }, [employeeSelectedDate,quarterlySelectedYear]);

  const fetchSales = (date: Dayjs) => {
    const formattedDate = date.format('YYYY-MM'); 
  
    fetch(`http://localhost:3002/obtenerVentasEmpleados?fecha=${formattedDate}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        setEmployeeSales(data); 
      })
      .catch((error) => console.error('Error al obtener las ventas por empleado:', error));
  };
  
  const fetchSalesComp = (date: Dayjs) => {
    const formattedDate = date.format('YYYY');
  
    fetch(`http://localhost:3002/obtenerVentasTrimestrales?fecha=${formattedDate}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        setQuarterlySales(data); // Asegúrate de usar setQuarterlySales
      })
      .catch((error) => console.error('Error al obtener las ventas trimestrales:', error));
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleTimeFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) {
      setTimeFilter(newFilter)
    }
  }

  const handleRowClick = (sale: Sale) => {
    Axios.get("http://localhost:3002/obtenerDetalleDeVenta", {
      params: { id: sale.id_venta },
    })
      .then((response) => {
        setVenta(sale)
        setSelectedSale(response.data)
        setOpenDialog(true)
      })
      .catch((error) => {
        alert("Ocurrió un error al obtener los detalles de la venta.")
      })
  }

  const handleCloseDialog = () => {
    setSelectedSale(null)
    setOpenDialog(false)
  }

  const filterSales = (sales: Sale[], filter: string | null): Sale[] => {
    const currentDate = dayjs()

    return sales.filter((sale) => {
      const saleDate = dayjs(sale.fecha_venta)

      switch (filter) {
        case 'day':
          return saleDate.isSame(currentDate, 'day')
        case 'week':
          return saleDate.isAfter(currentDate.subtract(1, 'week')) && saleDate.isBefore(currentDate)
        case 'month':
          return saleDate.isSame(selectedDate, 'month') && saleDate.isSame(selectedDate, 'year')
        case 'year':
          return saleDate.isSame(selectedDate, 'year')
        default:
          return true
      }
    })
  }

  const filteredSales = filterSales(sales, timeFilter)

  const totalGenerated = filteredSales.reduce((sum, sale) => {
    const totalVenta = typeof sale.total_venta === 'number' ? sale.total_venta : parseFloat(sale.total_venta || '0') || 0
    return sum + totalVenta
  }, 0)

  const totalGeneratedFormatted = Number.isFinite(totalGenerated) ? totalGenerated.toFixed(2) : '0.00'

  const periodName = {
    day: 'Hoy',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
  }[timeFilter || 'day']


  const handleFilterByDate = () => {
    
    console.log('Filtering by date:', selectedDate?.format('YYYY-MM-DD'))
  }

  const handleFilterByEmployeeDate = () => {
    
    console.log('Filtering employee sales by date:', employeeSelectedDate?.format('YYYY-MM'))
  }

  const handleFilterByQuarterlyYear = () => {
    
    console.log('Filtering quarterly sales by year:', quarterlySelectedYear?.format('YYYY'))
  }

  return (
    <FondoAnimado>
      <NavBar toggleDrawer={() => setOpen(!open)} />
      <CustomToolbar open={open} selectedItem={'/reports'} setSelectedItem={() => {}} />
      <Main open={open}>
        <Toolbar />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4, backgroundColor: 'white', minHeight: '68vh', width: '90%' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Ventas por Fecha" />
              <Tab label="Ventas por Empleado" />
              <Tab label="Ventas Trimestrales" />
            </Tabs>

            {/* Pestaña Ventas por Fecha */}
            {tabValue === 0 && (
              <Box>
                <Box sx={{ mb: 3, mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ToggleButtonGroup value={timeFilter} exclusive onChange={handleTimeFilterChange} aria-label="filtro de tiempo">
                    <ToggleButton value="day" aria-label="día">Día</ToggleButton>
                    <ToggleButton value="week" aria-label="semana">Semana</ToggleButton>
                    <ToggleButton value="month" aria-label="mes">Mes</ToggleButton>
                    <ToggleButton value="year" aria-label="año">Año</ToggleButton>
                  </ToggleButtonGroup>
                  {(timeFilter === 'month' || timeFilter === 'year') && (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar 
                        views={timeFilter === 'month' ? ['month'] : ['year']}
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                      />
                    </LocalizationProvider>
                  )}
                  
                </Box>
                <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                  Total General ({periodName}): ${totalGeneratedFormatted}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Empleado</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.id_venta} hover onClick={() => handleRowClick(sale)} sx={{ cursor: 'pointer' }}>
                          <TableCell>{sale.id_venta}</TableCell>
                          <TableCell>{sale.fecha_venta}</TableCell>
                          <TableCell>{sale.empleado}</TableCell>
                          <TableCell>${(typeof sale.total_venta === 'number' ? sale.total_venta : parseFloat(sale.total_venta || '0') || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Pestaña Ventas por Empleado */}
            {tabValue === 1 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Reporte de Ventas por Empleado
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar 
                      views={['year', 'month']}
                      value={employeeSelectedDate}
                      onChange={(newValue) => setEmployeeSelectedDate(newValue)} 
                    />
                  </LocalizationProvider>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Empleado</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Cant. Ventas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employeeSales.map((employee) => {
                        const total = typeof employee.total === 'number'
                          ? employee.total
                          : parseFloat(employee.total as unknown as string) || 0;

                        return (
                          <TableRow key={employee.empleado}>
                            <TableCell>{employee.empleado}</TableCell>
                            <TableCell align="right">${total.toFixed(2)}</TableCell>
                            <TableCell align="right">{employee.cant_ventas}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

{tabValue === 2 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Reporte de Ventas Trimestrales por Empleado
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar 
                      views={['year']}
                      value={quarterlySelectedYear}
                      onChange={(newValue) => setQuarterlySelectedYear(newValue)}
                    />
                  </LocalizationProvider>
                  
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="right">Trim 1</TableCell>
                        <TableCell align="right">Trim 2</TableCell>
                        <TableCell align="right">Trim 3</TableCell>
                        <TableCell align="right">Trim 4</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quarterlySales.map((product) => (
                        <TableRow key={product.producto}>
                          <TableCell>{product.producto}</TableCell>
                          <TableCell align="right">{product.trim1}</TableCell>
                          <TableCell align="right">{product.trim2}</TableCell>
                          <TableCell align="right">{product.trim3}</TableCell>
                          <TableCell align="right">{product.trim4}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Box>
      </Main>
      {selectedSale && (
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>Detalles de la Venta</DialogTitle>
          <DialogContent>
            <Typography variant="h6">Empleado: {venta?.empleado}</Typography>
            <Typography variant="h6">Fecha: {venta?.fecha_venta}</Typography>
            <Typography variant="h6">Cliente: {venta?.cliente}</Typography>
            <Typography variant="h6">
              Total: ${parseFloat(venta?.total_venta?.toString() || '0').toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>Productos:</Typography>
            {selectedSale.productos && Array.isArray(selectedSale.productos) && selectedSale.productos.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Precio Unitario</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSale.productos.map((product) => (
                      <TableRow key={product.id_producto}>
                        <TableCell>{product.nombre_producto}</TableCell>
                        <TableCell>{product.cantidad}</TableCell>
                        <TableCell>${parseFloat(product.precio_unitario).toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(product.total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No se han encontrado productos para esta venta.</Typography>
            )}
          </DialogContent>
        </Dialog>
      )}
    </FondoAnimado>
  )
}
