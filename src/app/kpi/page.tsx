'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import { useCustomerProfits } from '@/hooks/useCustomerProfits'
import { formatCurrency } from '@/lib/profitCalculation'
import { useTheme as useCustomTheme } from '@/theme/ThemeProvider'
import { getThemePrimaryGradient, getThemeTextGradient } from '@/lib/themeUtils'

// KPI weights
const KPI_WEIGHTS = {
  lending: 0.4,      // 40%
  mobilization: 0.4, // 40%
  fees: 0.2          // 20%
}

export default function KPIPage() {
  const { darkMode, themeSettings } = useCustomTheme()
  const { allCustomerProfits, loading, error, totalProfitAcrossAllCustomers } = useCustomerProfits()

  // Calculate aggregate KPIs
  const kpiSummary = useMemo(() => {
    const totalLending = allCustomerProfits.reduce((sum, c) => sum + c.totalLendingProfit, 0)
    const totalMobilization = allCustomerProfits.reduce((sum, c) => sum + c.totalCapitalMobilizationProfit, 0)
    const totalFees = allCustomerProfits.reduce((sum, c) => sum + c.totalFeeProfit, 0)

    // Calculate weighted KPI score
    const kpiScore = (
      totalLending * KPI_WEIGHTS.lending +
      totalMobilization * KPI_WEIGHTS.mobilization +
      totalFees * KPI_WEIGHTS.fees
    )

    return {
      totalLending,
      totalMobilization,
      totalFees,
      totalProfit: totalProfitAcrossAllCustomers,
      kpiScore,
      // Individual contributions to KPI
      lendingContribution: totalLending * KPI_WEIGHTS.lending,
      mobilizationContribution: totalMobilization * KPI_WEIGHTS.mobilization,
      feesContribution: totalFees * KPI_WEIGHTS.fees
    }
  }, [allCustomerProfits, totalProfitAcrossAllCustomers])

  // Calculate customer KPIs with weighted scores
  const customerKPIs = useMemo(() => {
    return allCustomerProfits.map(customer => {
      const kpiScore = (
        customer.totalLendingProfit * KPI_WEIGHTS.lending +
        customer.totalCapitalMobilizationProfit * KPI_WEIGHTS.mobilization +
        customer.totalFeeProfit * KPI_WEIGHTS.fees
      )

      return {
        ...customer,
        kpiScore,
        lendingContribution: customer.totalLendingProfit * KPI_WEIGHTS.lending,
        mobilizationContribution: customer.totalCapitalMobilizationProfit * KPI_WEIGHTS.mobilization,
        feesContribution: customer.totalFeeProfit * KPI_WEIGHTS.fees
      }
    }).sort((a, b) => b.kpiScore - a.kpiScore)
  }, [allCustomerProfits])

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Lỗi khi tải dữ liệu KPI: {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />

      {/* Header */}
      <Paper elevation={0} sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" fontWeight="700" sx={{ 
              mb: 1,
              color: 'text.primary',
              background: getThemeTextGradient(themeSettings, darkMode),
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <AssessmentIcon sx={{ fontSize: 36, mr: 1, verticalAlign: 'middle' }} />
              Báo Cáo KPI & Lợi Nhuận
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Phân tích hiệu suất kinh doanh theo khách hàng với trọng số KPI
            </Typography>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* KPI Weights Info */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Trọng Số KPI
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mt: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MonetizationOnIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Lợi nhuận cho vay
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {(KPI_WEIGHTS.lending * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountBalanceIcon color="info" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Lợi nhuận huy động vốn
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {(KPI_WEIGHTS.mobilization * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoneyIcon color="warning" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Lợi nhuận phí
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {(KPI_WEIGHTS.fees * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Aggregate KPI Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
            Tổng Quan KPI
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: 3
          }}>
            {/* Total KPI Score */}
            <Card elevation={2} sx={{ 
              bgcolor: 'background.paper',
              background: getThemePrimaryGradient(themeSettings, darkMode),
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon fontSize="large" />
                  <Typography variant="h6" fontWeight="bold">
                    KPI Score
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="700">
                  {formatCurrency(kpiSummary.kpiScore)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Điểm KPI tổng hợp
                </Typography>
              </CardContent>
            </Card>

            {/* Lending Profit */}
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MonetizationOnIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Cho vay (40%)
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="700" color="primary">
                  {formatCurrency(kpiSummary.totalLending)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đóng góp: {formatCurrency(kpiSummary.lendingContribution)}
                </Typography>
              </CardContent>
            </Card>

            {/* Mobilization Profit */}
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccountBalanceIcon color="info" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Huy động vốn (40%)
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="700" color="info.main">
                  {formatCurrency(kpiSummary.totalMobilization)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đóng góp: {formatCurrency(kpiSummary.mobilizationContribution)}
                </Typography>
              </CardContent>
            </Card>

            {/* Fees Profit */}
            <Card elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AttachMoneyIcon color="warning" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Phí (20%)
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="700" color="warning.main">
                  {formatCurrency(kpiSummary.totalFees)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đóng góp: {formatCurrency(kpiSummary.feesContribution)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Customer KPI Table */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
            KPI & Lợi Nhuận Theo Khách Hàng
          </Typography>

          {loading ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Đang tải dữ liệu...
              </Typography>
            </Box>
          ) : customerKPIs.length === 0 ? (
            <Alert severity="info">
              Chưa có dữ liệu khách hàng để tính KPI
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Khách Hàng</strong></TableCell>
                    <TableCell align="right"><strong>KPI Score</strong></TableCell>
                    <TableCell align="right"><strong>Cho Vay (40%)</strong></TableCell>
                    <TableCell align="right"><strong>Huy Động (40%)</strong></TableCell>
                    <TableCell align="right"><strong>Phí (20%)</strong></TableCell>
                    <TableCell align="right"><strong>Tổng Lợi Nhuận</strong></TableCell>
                    <TableCell align="right"><strong>Hợp Đồng</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerKPIs.map((customer, index) => (
                    <TableRow 
                      key={customer.customerId}
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        ...(index < 3 && { 
                          bgcolor: 'action.selected',
                          '&:hover': { bgcolor: 'action.focus' }
                        })
                      }}
                    >
                      <TableCell>
                        {index < 3 ? (
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color={index === 0 ? 'warning' : index === 1 ? 'default' : 'default'}
                            sx={{ 
                              fontWeight: 'bold',
                              ...(index === 0 && { bgcolor: 'gold', color: 'black' }),
                              ...(index === 1 && { bgcolor: 'silver', color: 'black' }),
                              ...(index === 2 && { bgcolor: '#CD7F32', color: 'white' })
                            }}
                          />
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {customer.customerName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(customer.kpiScore)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({((customer.kpiScore / kpiSummary.kpiScore) * 100).toFixed(1)}%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(customer.totalLendingProfit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          → {formatCurrency(customer.lendingContribution)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(customer.totalCapitalMobilizationProfit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          → {formatCurrency(customer.mobilizationContribution)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(customer.totalFeeProfit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          → {formatCurrency(customer.feesContribution)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="500">
                          {formatCurrency(customer.totalProfit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={customer.contractCount} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Summary Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Tổng Cộng
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  KPI Score
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(kpiSummary.kpiScore)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Tổng Lợi Nhuận
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(kpiSummary.totalProfit)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
