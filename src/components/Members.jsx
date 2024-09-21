// Members.jsx

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '../supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical } from 'lucide-react';

const Members = () => {
  const [membersData, setMembersData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    mobile_number_1: '',
  });
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembersData();
  }, []);

  const fetchMembersData = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      setMembersData(data);
    } catch (error) {
      console.error('Error fetching members data:', error);
    }
  };

  const handleAddMember = async () => {
    if (newMember.name.trim() && newMember.email.trim()) {
      try {
        const newUserId = `USR${Math.floor(Math.random() * 1000000)}`;
        const { error } = await supabase.from('users').insert([
          {
            user_id: newUserId,
            active: true,
            name: newMember.name.trim(),
            email: newMember.email.trim(),
            mobile_number_1: newMember.mobile_number_1.trim(),
            role: 'Member',
          },
        ]);
        if (error) throw error;
        setNewMember({ name: '', email: '', mobile_number_1: '' });
        setIsDialogOpen(false);
        fetchMembersData();
      } catch (error) {
        console.error('Error adding new member:', error);
      }
    }
  };

  const handleEditMember = async () => {
    if (selectedMember) {
      try {
        const { error } = await supabase
          .from('users')
          .update({
            name: selectedMember.name.trim(),
            email: selectedMember.email.trim(),
            mobile_number_1: selectedMember.mobile_number_1.trim(),
          })
          .eq('user_id', selectedMember.user_id);
        if (error) throw error;
        setIsEditDialogOpen(false);
        fetchMembersData();
      } catch (error) {
        console.error('Error updating member:', error);
      }
    }
  };

  const handleDeleteMember = async () => {
    if (selectedMember) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('user_id', selectedMember.user_id);
        if (error) throw error;
        setIsAlertDialogOpen(false);
        fetchMembersData();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const openEditDialog = (member) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member) => {
    setSelectedMember(member);
    setIsAlertDialogOpen(true);
  };

  const filteredMembersData = membersData.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold ml-2 md:-ml-0">Members</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search members"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Add Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Fill in the details of the new member.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Name"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                className="mb-2"
              />
              <Input
                placeholder="Email"
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                className="mb-2"
              />
              <Input
                placeholder="Mobile Number"
                value={newMember.mobile_number_1}
                onChange={(e) =>
                  setNewMember({
                    ...newMember,
                    mobile_number_1: e.target.value,
                  })
                }
                className="mb-4"
              />
              <Button onClick={handleAddMember}>Add Member</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembersData.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.mobile_number_1}</TableCell>
                  <TableCell>
                    {member.active ? 'Active' : 'Inactive'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical className="h-5 w-5 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          className="cursor-pointer font-medium"
                          onClick={() => openEditDialog(member)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer font-medium"
                          onClick={() => openDeleteDialog(member)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update the details of the member.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Name"
            value={selectedMember?.name || ''}
            onChange={(e) =>
              setSelectedMember({ ...selectedMember, name: e.target.value })
            }
            className="mb-2"
          />
          <Input
            placeholder="Email"
            type="email"
            value={selectedMember?.email || ''}
            onChange={(e) =>
              setSelectedMember({ ...selectedMember, email: e.target.value })
            }
            className="mb-2"
          />
          <Input
            placeholder="Mobile Number"
            value={selectedMember?.mobile_number_1 || ''}
            onChange={(e) =>
              setSelectedMember({
                ...selectedMember,
                mobile_number_1: e.target.value,
              })
            }
            className="mb-4"
          />
          <Button onClick={handleEditMember}>Save</Button>
        </DialogContent>
      </Dialog>

      {/* Delete Member Alert Dialog */}
      <AlertDialog
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this member?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will permanently delete the
              member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Members;
