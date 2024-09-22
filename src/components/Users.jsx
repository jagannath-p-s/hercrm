// Users.js

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [newUser, setNewUser] = useState({
    user_id: "",
    name: "",
    email: "",
    date_of_birth: "",
    mobile_number_1: "",
    mobile_number_2: "",
    emergency_contact_number: "",
    blood_group: "",
    medical_conditions: "",
    allergies: "",
    injuries: "",
    current_medications: "",
    fitness_goals: "",
    role: "Member",
    active: false,
  });
  const [selectedUser, setSelectedUser] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [toggleUserId, setToggleUserId] = useState("");
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [selectedUserForToggle, setSelectedUserForToggle] = useState(null);

  useEffect(() => {
    fetchUsersData();
  }, []);

  // Fetch Users from Supabase
  const fetchUsersData = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsersData(data);
    }
  };

  // Toggle Active Status for User
  const handleToggleActive = (user) => {
    if (user.active) {
      // Prompt for biometric data deletion if setting to inactive
      setSelectedUserForToggle(user);
      setIsBiometricPromptOpen(true);
    } else {
      // Open dialog to ask for user ID when reactivating
      setSelectedUserForToggle(user);
      setIsToggleDialogOpen(true);
    }
  };

  const confirmBiometricDeletion = async () => {
    const user = selectedUserForToggle;
    const { error } = await supabase
      .from("users")
      .update({ active: false })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating active status:", error);
    } else {
      // Add logic to delete user's biometric data from the biometric device here
      console.log("Biometric data deleted for user:", user.user_id);
    }
    setIsBiometricPromptOpen(false);
    fetchUsersData();
  };

  const handleReactivation = async () => {
    const user = selectedUserForToggle;
    const { error } = await supabase
      .from("users")
      .update({ active: true, user_id: toggleUserId })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating user for reactivation:", error);
    } else {
      console.log("User reactivated:", toggleUserId);
    }
    setIsToggleDialogOpen(false);
    fetchUsersData();
  };

  const closeToggleDialog = () => {
    setIsToggleDialogOpen(false);
    setToggleUserId("");
  };

  const handleAddUser = async () => {
    if (newUser.name.trim() && newUser.email.trim()) {
      const { error } = await supabase.from("users").insert([newUser]);
      if (error) {
        console.error("Error adding user:", error);
      } else {
        fetchUsersData();
        setIsDialogOpen(false);
      }
    }
  };

  const handleEditUser = async () => {
    if (selectedUser.name.trim() && selectedUser.email.trim()) {
      const { error } = await supabase
        .from("users")
        .update(selectedUser)
        .eq("id", selectedUser.id);
      if (error) {
        console.error("Error updating user:", error);
      } else {
        fetchUsersData();
        setIsEditDialogOpen(false);
      }
    }
  };

  const handleDeleteUser = async () => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", selectedUser.id);
    if (error) {
      console.error("Error deleting user:", error);
    } else {
      fetchUsersData();
      setIsAlertDialogOpen(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Emergency Contact</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobile_number_1}</TableCell>
                  <TableCell>{user.emergency_contact_number}</TableCell>
                  <TableCell>{user.blood_group}</TableCell>
                  <TableCell>
                    <Badge variant={user.active ? "default" : "destructive"}>
                      {user.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical className="h-5 w-5 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                          {user.active ? (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          )}
                          {user.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedUser(user) || setIsEditDialogOpen(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedUser(user) || setIsAlertDialogOpen(true)}>
                          <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen || isEditDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              placeholder="Name"
              value={isEditDialogOpen ? selectedUser.name : newUser.name}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, name: e.target.value })
                  : setNewUser({ ...newUser, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={isEditDialogOpen ? selectedUser.email : newUser.email}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
              }
            />
            {/* Other Fields */}
            <Input
              placeholder="Mobile Number 1"
              value={isEditDialogOpen ? selectedUser.mobile_number_1 : newUser.mobile_number_1}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, mobile_number_1: e.target.value })
                  : setNewUser({ ...newUser, mobile_number_1: e.target.value })
              }
            />
            <Input
              placeholder="Mobile Number 2"
              value={isEditDialogOpen ? selectedUser.mobile_number_2 : newUser.mobile_number_2}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, mobile_number_2: e.target.value })
                  : setNewUser({ ...newUser, mobile_number_2: e.target.value })
              }
            />
            <Input
              placeholder="Emergency Contact"
              value={isEditDialogOpen ? selectedUser.emergency_contact_number : newUser.emergency_contact_number}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, emergency_contact_number: e.target.value })
                  : setNewUser({ ...newUser, emergency_contact_number: e.target.value })
              }
            />
            <Input
              placeholder="Blood Group"
              value={isEditDialogOpen ? selectedUser.blood_group : newUser.blood_group}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, blood_group: e.target.value })
                  : setNewUser({ ...newUser, blood_group: e.target.value })
              }
            />
            {/* Medical Information */}
            <Input
              placeholder="Medical Conditions"
              value={isEditDialogOpen ? selectedUser.medical_conditions : newUser.medical_conditions}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, medical_conditions: e.target.value })
                  : setNewUser({ ...newUser, medical_conditions: e.target.value })
              }
            />
            <Input
              placeholder="Allergies"
              value={isEditDialogOpen ? selectedUser.allergies : newUser.allergies}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, allergies: e.target.value })
                  : setNewUser({ ...newUser, allergies: e.target.value })
              }
            />
            <Input
              placeholder="Injuries"
              value={isEditDialogOpen ? selectedUser.injuries : newUser.injuries}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, injuries: e.target.value })
                  : setNewUser({ ...newUser, injuries: e.target.value })
              }
            />
            <Input
              placeholder="Current Medications"
              value={isEditDialogOpen ? selectedUser.current_medications : newUser.current_medications}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, current_medications: e.target.value })
                  : setNewUser({ ...newUser, current_medications: e.target.value })
              }
            />
            <Input
              placeholder="Fitness Goals"
              value={isEditDialogOpen ? selectedUser.fitness_goals : newUser.fitness_goals}
              onChange={(e) =>
                isEditDialogOpen
                  ? setSelectedUser({ ...selectedUser, fitness_goals: e.target.value })
                  : setNewUser({ ...newUser, fitness_goals: e.target.value })
              }
            />
          </div>
          <Button onClick={isEditDialogOpen ? handleEditUser : handleAddUser} className="mt-4">
            {isEditDialogOpen ? "Save Changes" : "Add User"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Biometric Data Deletion Prompt */}
      <AlertDialog open={isBiometricPromptOpen} onOpenChange={setIsBiometricPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivating this user will delete their biometric data. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBiometricDeletion}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Active Status Dialog */}
      <Dialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate User</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter User ID"
            value={toggleUserId}
            onChange={(e) => setToggleUserId(e.target.value)}
          />
          <Button onClick={handleReactivation} className="mt-4">
            Activate
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone and will permanently delete the user.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
