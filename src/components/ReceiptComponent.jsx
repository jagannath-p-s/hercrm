import React from 'react';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableRow } from '@mui/material';

const ReceiptComponent = React.forwardRef(({ membership }, ref) => {
  return (
    <Box
      ref={ref}
      sx={{
        padding: 4,
        border: '2px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#f9f9f9',
        maxWidth: 500,
        margin: '50',
      }}
    >
      {/* Header */}
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#333' }}
      >
        Membership Receipt
      </Typography>

      <Divider sx={{ marginY: 2 }} />

      {/* Membership Details */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>
          Member Information
        </Typography>
        <Table sx={{ width: '100%', marginTop: 1 }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Name</TableCell>
              <TableCell>{membership.users?.name || 'Unknown User'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Plan</TableCell>
              <TableCell>{membership.membership_plans?.name || 'Unknown Plan'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Payment Mode</TableCell>
              <TableCell>{membership.payment_modes?.name || 'Unknown Mode'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Start Date</TableCell>
              <TableCell>{membership.start_date}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>End Date</TableCell>
              <TableCell>{membership.end_date}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Amount Section */}
      <Box
        sx={{
          backgroundColor: '#f0f0f0',
          padding: 2,
          borderRadius: '5px',
          marginTop: 2,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', color: '#333', marginBottom: 1 }}
        >
          Total Amount
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
          Rs {membership.total_amount}
        </Typography>
      </Box>

      {/* Footer */}
      <Divider sx={{ marginY: 2 }} />
      <Typography
        variant="body2"
        align="center"
        sx={{ color: '#888', fontStyle: 'italic' }}
      >
        Thank you for your membership!
      </Typography>
    </Box>
  );
});

export default ReceiptComponent;
