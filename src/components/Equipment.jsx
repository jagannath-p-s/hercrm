import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DownloadIcon } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [newEquipment, setNewEquipment] = useState({
    equipment_name: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    cost: '',
    depreciation_rate: '',
    maintenance_schedule: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchTerm, equipmentList]);

  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('equipment_name', { ascending: true });

    if (error) {
      console.error(`Error fetching equipment: ${error.message}`);
    } else {
      const updatedData = data.map((item) => {
        const currentValue = calculateCurrentValue(
          item.cost,
          item.depreciation_rate,
          item.purchase_date
        );
        return { ...item, current_value: currentValue };
      });
      setEquipmentList(updatedData);
      setFilteredEquipment(updatedData);
    }
  };

  const calculateCurrentValue = (cost, depreciationRate, purchaseDate) => {
    if (!cost || !depreciationRate || !purchaseDate) return null;
    const yearsElapsed = (new Date() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25);
    const depreciationAmount = cost * (depreciationRate / 100) * yearsElapsed;
    const currentValue = cost - depreciationAmount;
    return currentValue > 0 ? currentValue.toFixed(2) : '0.00';
  };

  const applySearch = () => {
    if (!searchTerm) {
      setFilteredEquipment(equipmentList);
      return;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = equipmentList.filter((item) => {
      const itemString = `
        ${item.equipment_name}
        ${item.model}
        ${item.serial_number}
        ${item.purchase_date}
        ${item.cost}
        ${item.depreciation_rate}
        ${item.current_value}
        ${item.maintenance_schedule}
        ${item.last_maintenance_date}
        ${item.next_maintenance_date}
      `.toLowerCase();

      return itemString.includes(lowercasedSearchTerm);
    });

    setFilteredEquipment(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditMode(false);
    setNewEquipment({
      equipment_name: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      cost: '',
      depreciation_rate: '',
      maintenance_schedule: '',
      last_maintenance_date: '',
      next_maintenance_date: '',
    });
  };

  const handleEditEquipment = (item) => {
    setSelectedEquipment(item);
    setNewEquipment({
      equipment_name: item.equipment_name || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date ? item.purchase_date.split('T')[0] : '',
      cost: item.cost || '',
      depreciation_rate: item.depreciation_rate || '',
      maintenance_schedule: item.maintenance_schedule || '',
      last_maintenance_date: item.last_maintenance_date ? item.last_maintenance_date.split('T')[0] : '',
      next_maintenance_date: item.next_maintenance_date ? item.next_maintenance_date.split('T')[0] : '',
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleSaveEquipment = async () => {
    const fieldsToSave = {
      equipment_name: newEquipment.equipment_name,
      model: newEquipment.model,
      serial_number: newEquipment.serial_number,
      purchase_date: newEquipment.purchase_date || null,
      cost: newEquipment.cost ? parseFloat(newEquipment.cost) : null,
      depreciation_rate: newEquipment.depreciation_rate ? parseFloat(newEquipment.depreciation_rate) : null,
      maintenance_schedule: newEquipment.maintenance_schedule,
      last_maintenance_date: newEquipment.last_maintenance_date || null,
      next_maintenance_date: newEquipment.next_maintenance_date || null,
    };

    let response;
    if (editMode) {
      response = await supabase.from('equipment').update(fieldsToSave).eq('id', selectedEquipment.id);
    } else {
      response = await supabase.from('equipment').insert([fieldsToSave]);
    }

    const { error } = response;
    if (error) {
      console.error(`Error saving equipment: ${error.message}`);
    } else {
      fetchEquipment();
      setOpenDialog(false);
    }
  };

  // **Download as CSV**
  const downloadCSV = () => {
    const headers = [
      'Serial No',
      'Equipment Name',
      'Model',
      'Serial Number',
      'Purchase Date',
      'Cost',
      'Depreciation Rate',
      'Current Value',
      'Maintenance Schedule',
      'Last Maintenance Date',
      'Next Maintenance Date',
    ];

    const rows = equipmentList.map((item, index) => [
      index + 1,
      item.equipment_name,
      item.model,
      item.serial_number,
      item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'N/A',
      item.cost !== null ? item.cost : 'N/A',
      item.depreciation_rate !== null ? item.depreciation_rate : 'N/A',
      item.current_value !== null ? item.current_value : 'N/A',
      item.maintenance_schedule,
      item.last_maintenance_date ? new Date(item.last_maintenance_date).toLocaleDateString() : 'N/A',
      item.next_maintenance_date ? new Date(item.next_maintenance_date).toLocaleDateString() : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'equipment_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // **Download as PDF**
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Equipment Data', 14, 20);
    const tableColumns = [
      'Serial No',
      'Equipment Name',
      'Model',
      'Serial Number',
      'Purchase Date',
      'Cost',
      'Depreciation Rate (%)',
      'Current Value',
      'Maintenance Schedule',
      'Last Maintenance Date',
      'Next Maintenance Date',
    ];

    const tableRows = equipmentList.map((item, index) => [
      index + 1,
      item.equipment_name,
      item.model,
      item.serial_number,
      item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : 'N/A',
      item.cost !== null ? item.cost : 'N/A',
      item.depreciation_rate !== null ? item.depreciation_rate : 'N/A',
      item.current_value !== null ? item.current_value : 'N/A',
      item.maintenance_schedule,
      item.last_maintenance_date ? new Date(item.last_maintenance_date).toLocaleDateString() : 'N/A',
      item.next_maintenance_date ? new Date(item.next_maintenance_date).toLocaleDateString() : 'N/A',
    ]);

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 30,
    });

    doc.save('equipment_data.pdf');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className='flex space-x-4'>
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-[200px]"
          />
          <Button onClick={handleOpenDialog} className="ml-4">
            Add Equipment
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-4">
              <DownloadIcon className="mr-2 h-4 w-4" /> Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Download Options</DropdownMenuLabel>
            <DropdownMenuItem onClick={downloadCSV}>Download as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={downloadPDF}>Download as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Equipment Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Depreciation Rate</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.equipment_name || 'N/A'}</TableCell>
                  <TableCell>{item.model || 'N/A'}</TableCell>
                  <TableCell>{item.serial_number || 'N/A'}</TableCell>
                  <TableCell>
                    {item.purchase_date ? format(new Date(item.purchase_date), 'yyyy-MM-dd') : 'N/A'}
                  </TableCell>
                  <TableCell>{item.cost !== null ? item.cost : 'N/A'}</TableCell>
                  <TableCell>{item.depreciation_rate !== null ? item.depreciation_rate : 'N/A'}</TableCell>
                  <TableCell>{item.current_value !== null ? item.current_value : 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => handleEditEquipment(item)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEquipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Adding/Editing Equipment */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
  <div>
    <label htmlFor="equipment_name" className="block text-sm font-medium text-gray-700">
      Equipment Name
    </label>
    <Input
      id="equipment_name"
  
      value={newEquipment.equipment_name}
      onChange={(e) => setNewEquipment({ ...newEquipment, equipment_name: e.target.value })}
    />
  </div>
  
  <div>
    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
      Model
    </label>
    <Input
      id="model"
  
      value={newEquipment.model}
      onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
      Serial Number
    </label>
    <Input
      id="serial_number"
     
      value={newEquipment.serial_number}
      onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
      Purchase Date
    </label>
    <Input
      id="purchase_date"

      type="date"
      value={newEquipment.purchase_date}
      onChange={(e) => setNewEquipment({ ...newEquipment, purchase_date: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
      Cost
    </label>
    <Input
      id="cost"
     
      type="number"
      value={newEquipment.cost}
      onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="depreciation_rate" className="block text-sm font-medium text-gray-700">
      Depreciation Rate
    </label>
    <Input
      id="depreciation_rate"
   
      type="number"
      value={newEquipment.depreciation_rate}
      onChange={(e) => setNewEquipment({ ...newEquipment, depreciation_rate: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="maintenance_schedule" className="block text-sm font-medium text-gray-700">
      Maintenance Schedule
    </label>
    <Input
      id="maintenance_schedule"
     
      value={newEquipment.maintenance_schedule}
      onChange={(e) => setNewEquipment({ ...newEquipment, maintenance_schedule: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="last_maintenance_date" className="block text-sm font-medium text-gray-700">
      Last Maintenance Date
    </label>
    <Input
      id="last_maintenance_date"
    
      type="date"
      value={newEquipment.last_maintenance_date}
      onChange={(e) => setNewEquipment({ ...newEquipment, last_maintenance_date: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="next_maintenance_date" className="block text-sm font-medium text-gray-700">
      Next Maintenance Date
    </label>
    <Input
      id="next_maintenance_date"

      type="date"
      value={newEquipment.next_maintenance_date}
      onChange={(e) => setNewEquipment({ ...newEquipment, next_maintenance_date: e.target.value })}
    />
  </div>

  <div>
    <label htmlFor="current_value" className="block text-sm font-medium text-gray-700">
      Current Value
    </label>
    <Input
      id="current_value"
     
      value={
        calculateCurrentValue(
          newEquipment.cost,
          newEquipment.depreciation_rate,
          newEquipment.purchase_date
        ) || ''
      }
      disabled
    />
  </div>
</div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button className="ml-4" onClick={handleSaveEquipment}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipment;