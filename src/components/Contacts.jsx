// Contacts.js

import React, { useState, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import EditIcon from '@mui/icons-material/Edit';

const Contacts = () => {
  const initialExpandedColumns = ['Lead', 'Follow-up', 'Customer Won', 'Customer Lost'];
  const [expanded, setExpanded] = useState(initialExpandedColumns);
  const [columns, setColumns] = useState([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    mobile_number: '',
    lead_source: '',
    first_enquiry_date: '',
    next_follow_up_date: '',
    remarks: '',
    status: 'Lead',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDays, setFilterDays] = useState(7); // Default to 7 days
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState(null);

  useEffect(() => {
    fetchLeads();
    fetchLeadSources();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [columns, filterDays]);

  const fetchLeads = async () => {
    try {
      const { data: leadsData, error } = await supabase.from('leads').select('*');

      if (error) throw error;

      const columnsData = [
        { name: 'Lead', color: 'yellow', bgColor: 'bg-yellow-50', leads: [] },
        { name: 'Follow-up', color: 'blue', bgColor: 'bg-blue-50', leads: [] },
        { name: 'Customer Won', color: 'green', bgColor: 'bg-green-50', leads: [] },
        { name: 'Customer Lost', color: 'red', bgColor: 'bg-red-50', leads: [] },
      ];

      leadsData.forEach((lead) => {
        const column = columnsData.find((col) => col.name === lead.status);
        if (column) {
          column.leads.push(lead);
        } else {
          // Handle unexpected statuses by adding to 'Lead' column
          columnsData[0].leads.push(lead);
        }
      });

      setColumns(columnsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchLeadSources = async () => {
    try {
      const { data: leadSourcesData, error } = await supabase.from('lead_sources').select('*');
      if (error) throw error;
      setLeadSources(leadSourcesData);
    } catch (error) {
      console.error('Error fetching lead sources:', error);
    }
  };

  const applyFilter = () => {
    if (filterDays === null || filterDays === '') {
      setFilteredColumns(columns);
      return;
    }

    const filteredData = columns.map((column) => {
      const filteredLeads = column.leads.filter((lead) => {
        if (lead.next_follow_up_date) {
          const daysDifference = dayjs(lead.next_follow_up_date).diff(dayjs(), 'day');
          return daysDifference >= 0 && daysDifference <= filterDays;
        }
        return false;
      });
      return { ...column, leads: filteredLeads };
    });

    setFilteredColumns(filteredData);
  };

  const toggleExpand = (columnName) => {
    if (expanded.includes(columnName)) {
      setExpanded(expanded.filter((c) => c !== columnName));
    } else {
      setExpanded([...expanded, columnName]);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const sourceColumnIndex = columns.findIndex((col) => col.name === source.droppableId);
    const destinationColumnIndex = columns.findIndex((col) => col.name === destination.droppableId);

    if (sourceColumnIndex === -1 || destinationColumnIndex === -1) return;

    const sourceColumn = columns[sourceColumnIndex];
    const destinationColumn = columns[destinationColumnIndex];

    const sourceLeads = Array.from(sourceColumn.leads);
    const [movedLead] = sourceLeads.splice(source.index, 1);

    const destinationLeads = Array.from(destinationColumn.leads);
    destinationLeads.splice(destination.index, 0, movedLead);

    const updatedColumns = [...columns];
    updatedColumns[sourceColumnIndex] = {
      ...sourceColumn,
      leads: sourceLeads,
    };
    updatedColumns[destinationColumnIndex] = {
      ...destinationColumn,
      leads: destinationLeads,
    };

    // Update the status in the database
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: destination.droppableId })
        .eq('id', movedLead.id);

      if (error) {
        console.error('Error updating lead status:', error);
      } else {
        setColumns(updatedColumns);
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleContactOpen = (contact) => {
    setSelectedContact(contact);
    setContactOpen(true);
    setIsEditing(false);
    setEditedContact(null);
  };

  const handleContactClose = () => {
    setContactOpen(false);
  };

  const handleAddContactOpen = () => {
    setAddContactOpen(true);
  };

  const handleAddContactClose = () => {
    setAddContactOpen(false);
    setNewContact({
      name: '',
      mobile_number: '',
      lead_source: '',
      first_enquiry_date: '',
      next_follow_up_date: '',
      remarks: '',
      status: 'Lead',
    });
  };

  const handleNewContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddContactSubmit = async () => {
    try {
      const { error } = await supabase.from('leads').insert([newContact]);

      if (error) {
        console.error('Error adding new contact:', error);
      } else {
        fetchLeads();
        handleAddContactClose();
      }
    } catch (error) {
      console.error('Error adding new contact:', error);
    }
  };

  const handleFilterOpen = () => {
    setFilterOpen(true);
  };

  const handleFilterClose = () => {
    setFilterOpen(false);
  };

  const handleFilterDaysChange = (e) => {
    const value = e.target.value;
    setFilterDays(value);
  };

  const handleEdit = () => {
    setEditedContact(selectedContact);
    setIsEditing(true);
  };

  const handleEditedContactChange = (e) => {
    const { name, value } = e.target;
    setEditedContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContact(null);
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('leads')
        .update(editedContact)
        .eq('id', editedContact.id);

      if (error) {
        console.error('Error updating contact:', error);
      } else {
        fetchLeads();
        setSelectedContact(editedContact);
        setIsEditing(false);
        setEditedContact(null);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const getTextColorClass = (color) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'red':
        return 'text-red-600';
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'purple':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold ml-2 mr-2">Contacts</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add Contact Button */}
              <Tooltip title="Add new contact">
                <IconButton
                  className="p-2"
                  onClick={handleAddContactOpen}
                  style={{ backgroundColor: '#e3f2fd', color: '#1e88e5', borderRadius: '12px' }}
                >
                  <AddIcon style={{ fontSize: '1.75rem' }} />
                </IconButton>
              </Tooltip>
              {/* Filter Button */}
              <Tooltip title="Filter nearing follow-ups">
                <IconButton
                  className="p-2"
                  onClick={handleFilterOpen}
                  style={{ backgroundColor: '#e3f2fd', color: '#1e88e5', borderRadius: '12px' }}
                >
                  <FilterListIcon style={{ fontSize: '1.75rem' }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onClose={handleAddContactClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={newContact.name}
            onChange={handleNewContactChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Mobile Number"
            name="mobile_number"
            value={newContact.mobile_number}
            onChange={handleNewContactChange}
            fullWidth
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="lead-source-label">Lead Source</InputLabel>
            <Select
              labelId="lead-source-label"
              id="lead-source-select"
              name="lead_source"
              value={newContact.lead_source}
              onChange={handleNewContactChange}
              label="Lead Source"
            >
              {leadSources.map((source) => (
                <MenuItem key={source.id} value={source.name}>
                  {source.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="First Enquiry Date"
            name="first_enquiry_date"
            type="date"
            value={newContact.first_enquiry_date}
            onChange={handleNewContactChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Next Follow Up Date"
            name="next_follow_up_date"
            type="date"
            value={newContact.next_follow_up_date}
            onChange={handleNewContactChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Remarks"
            name="remarks"
            value={newContact.remarks}
            onChange={handleNewContactChange}
            fullWidth
            multiline
            rows={3}
          />
          {/* You can add other fields if needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddContactClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddContactSubmit} color="primary">
            Add Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={handleFilterClose} fullWidth maxWidth="sm">
        <DialogTitle>Filter Nearing Follow-ups</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Show contacts with follow-up in next N days"
            type="number"
            value={filterDays}
            onChange={handleFilterDaysChange}
            fullWidth
            InputProps={{ inputProps: { min: 0 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFilterDays(''); handleFilterClose(); }} color="primary">
            Clear Filter
          </Button>
          <Button onClick={handleFilterClose} color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Content */}
      <div className="flex flex-grow p-4 space-x-4 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          {(filterDays === '' || filterDays === null ? columns : filteredColumns).map((column) => (
            <Droppable key={column.name} droppableId={column.name}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  onClick={() => !expanded.includes(column.name) && toggleExpand(column.name)}
                  className={`flex flex-col transition-all duration-300 ease-in-out
                    ${expanded.includes(column.name) ? 'w-64' : 'w-16'}
                    ${expanded.includes(column.name) ? column.bgColor : 'bg-white'}
                    border ${expanded.includes(column.name) ? `border-${column.color}-300` : 'border-gray-300'}
                    p-4 rounded-lg shadow-md relative cursor-pointer`}
                  style={{ maxHeight: '100vh', overflowY: 'auto', paddingRight: '8px' }}
                >
                  {expanded.includes(column.name) ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <h2
                          className={`text-lg font-semibold truncate ${getTextColorClass(
                            column.color
                          )}`}
                        >
                          {column.name}
                        </h2>
                        <Tooltip title="Collapse">
                          <button
                            className="text-gray-500 transform rotate-90"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(column.name);
                            }}
                          >
                            <KeyboardDoubleArrowRightIcon />
                          </button>
                        </Tooltip>
                      </div>
                      <div className="flex-grow overflow-y-auto pr-2">
                        {column.leads.length > 0 ? (
                          column.leads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleContactOpen(lead)}
                                  className="bg-white p-2 rounded-md shadow-md mb-2 cursor-pointer"
                                >
                                  <h3 className="text-md font-semibold">{lead.name}</h3>
                                  <p className="text-sm text-gray-600">
                                    Mobile: {lead.mobile_number}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Next Follow Up:{' '}
                                    {lead.next_follow_up_date
                                      ? new Date(lead.next_follow_up_date).toLocaleDateString()
                                      : 'N/A'}
                                  </p>
                                  {/* Display other important fields as needed */}
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <p className="mb-2">No contacts</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="transform -rotate-90 whitespace-nowrap">
                        <p
                          className={`text-sm font-semibold text-center ${getTextColorClass(
                            column.color
                          )}`}
                        >
                          {column.name}
                        </p>
                      </div>
                      <Tooltip title="Expand">
                        <button
                          className="absolute top-2 right-2 text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(column.name);
                          }}
                        >
                          <KeyboardDoubleArrowRightIcon />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>

      {/* Contact Details Dialog */}
      {selectedContact && (
        <Dialog
          open={contactOpen}
          onClose={handleContactClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Contact Details
            {!isEditing && (
              <IconButton
                aria-label="edit"
                onClick={handleEdit}
                style={{ position: 'absolute', right: 8, top: 8 }}
              >
                <EditIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent>
            {isEditing ? (
              <div className="p-4">
                <TextField
                  margin="dense"
                  label="Name"
                  name="name"
                  value={editedContact.name}
                  onChange={handleEditedContactChange}
                  fullWidth
                  required
                />
                <TextField
                  margin="dense"
                  label="Mobile Number"
                  name="mobile_number"
                  value={editedContact.mobile_number}
                  onChange={handleEditedContactChange}
                  fullWidth
                  required
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel id="lead-source-label">Lead Source</InputLabel>
                  <Select
                    labelId="lead-source-label"
                    id="lead-source-select"
                    name="lead_source"
                    value={editedContact.lead_source}
                    onChange={handleEditedContactChange}
                    label="Lead Source"
                  >
                    {leadSources.map((source) => (
                      <MenuItem key={source.id} value={source.name}>
                        {source.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  margin="dense"
                  label="First Enquiry Date"
                  name="first_enquiry_date"
                  type="date"
                  value={
                    editedContact.first_enquiry_date
                      ? dayjs(editedContact.first_enquiry_date).format('YYYY-MM-DD')
                      : ''
                  }
                  onChange={handleEditedContactChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  margin="dense"
                  label="Next Follow Up Date"
                  name="next_follow_up_date"
                  type="date"
                  value={
                    editedContact.next_follow_up_date
                      ? dayjs(editedContact.next_follow_up_date).format('YYYY-MM-DD')
                      : ''
                  }
                  onChange={handleEditedContactChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  margin="dense"
                  label="Remarks"
                  name="remarks"
                  value={editedContact.remarks}
                  onChange={handleEditedContactChange}
                  fullWidth
                  multiline
                  rows={3}
                />
                {/* Include other fields as needed */}
              </div>
            ) : (
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{selectedContact.name}</h2>
                <p className="mb-1">
                  <strong>Mobile:</strong> {selectedContact.mobile_number}
                </p>
                <p className="mb-1">
                  <strong>Lead Source:</strong> {selectedContact.lead_source}
                </p>
                <p className="mb-1">
                  <strong>First Enquiry Date:</strong>{' '}
                  {selectedContact.first_enquiry_date
                    ? new Date(selectedContact.first_enquiry_date).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p className="mb-1">
                  <strong>Next Follow Up Date:</strong>{' '}
                  {selectedContact.next_follow_up_date
                    ? new Date(selectedContact.next_follow_up_date).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p className="mb-1">
                  <strong>Remarks:</strong> {selectedContact.remarks}
                </p>
                {/* Include other fields as needed */}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            {isEditing ? (
              <>
                <Button onClick={handleCancelEdit} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} color="primary">
                  Save
                </Button>
              </>
            ) : (
              <Button onClick={handleContactClose} color="primary">
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Contacts;
