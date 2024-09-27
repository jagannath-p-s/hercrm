import React, { useState } from 'react';
import { Grid, Button, Typography, Paper, FormControl, MenuItem, Select, InputLabel, TextField } from '@mui/material';
import PARQForm from './PARQForm';
import BodyCompositionForm from './BodyCompositionForm';

const Forms = () => {
  const [selectedForm, setSelectedForm] = useState(null); // State to track which form is selected

  const handleFormSelection = (formName) => {
    setSelectedForm(formName); // Set the selected form
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>Forms</Typography>
      <Typography variant="body1" gutterBottom>Please choose a form to fill out:</Typography>

      {/* Form Selection */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={selectedForm === 'PARQ' ? "contained" : "outlined"}
          color="primary"
          onClick={() => handleFormSelection('PARQ')}
          style={{ marginRight: '10px' }}
        >
          PAR-Q Form
        </Button>
        <Button
          variant={selectedForm === 'BodyComposition' ? "contained" : "outlined"}
          color="primary"
          onClick={() => handleFormSelection('BodyComposition')}
        >
          Body Composition Analyzer
        </Button>
      </div>

      {/* Render selected form based on user choice */}
      <Paper elevation={3} style={{ padding: '20px', minHeight: '400px' }}>
        {selectedForm === 'PARQ' && <PARQForm />}
        {selectedForm === 'BodyComposition' && <BodyCompositionForm />}
        {!selectedForm && <Typography variant="h6">Please select a form to get started.</Typography>}
      </Paper>
    </div>
  );
};

export default Forms;
