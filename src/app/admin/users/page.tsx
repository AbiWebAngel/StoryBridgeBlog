"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type UserRecord = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  disabled?: boolean;
  createdAt?: string;
};

export default function AdminUsersPage() {
  
const { user: currentAuthUser, authReady } = useAuth();
// Get auth functions from context
  
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userToUpdate, setUserToUpdate] = useState<{
    uid: string;
    newRole: string;
    userName: string;
    currentRole: string;
  } | null>(null);
  const [userToDisable, setUserToDisable] = useState<{
    uid: string;
    userName: string;
    currentDisabled: boolean;
  } | null>(null);

  // Format date to day/month/year
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  // Fetch all users only when logged in
  const fetchUsers = async () => {
    if (!currentAuthUser) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/getUsers");
      const data = await res.json();
      const usersData = data.users || [];
      
      // Sort users: current user always first, then other enabled users, then disabled users
      if (currentAuthUser?.uid) {
        const sortedUsers = [...usersData].sort((a, b) => {
          // Current user always first (regardless of disabled status)
          if (a.uid === currentAuthUser.uid) return -1;
          if (b.uid === currentAuthUser.uid) return 1;
          
          // For other users: enabled first, then disabled
          if (!a.disabled && b.disabled) return -1;
          if (a.disabled && !b.disabled) return 1;
          
          // Within enabled or disabled groups, sort by date (newest first)
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      } else {
        const sortedUsers = [...usersData].sort((a, b) => {
          // Enabled users first, then disabled
          if (!a.disabled && b.disabled) return -1;
          if (a.disabled && !b.disabled) return 1;
          
          // Within groups, sort by date (newest first)
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      }
    } catch (error) {
      setErrorMessage("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  // Only fetch when Firebase auth is ready
  if (!authReady) return;

  if (currentAuthUser) {
    fetchUsers();
  } else {
    setUsers([]);
    setFilteredUsers([]);
    setLoading(false);
  }
}, [authReady, currentAuthUser]);


  // Filter users based on search query
  useEffect(() => {
    if (!currentAuthUser) return;
    
    if (searchQuery.trim() === "") {
      // Apply sorting with current user always first
      const sorted = [...users].sort((a, b) => {
        // Current user always first (regardless of disabled status)
        if (a.uid === currentAuthUser.uid) return -1;
        if (b.uid === currentAuthUser.uid) return 1;
        
        // Enabled users first, then disabled
        if (!a.disabled && b.disabled) return -1;
        if (a.disabled && !b.disabled) return 1;
        
        // Within groups, sort by date (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setFilteredUsers(sorted);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query) ||
          (user.disabled && "disabled".includes(query)) ||
          (!user.disabled && "enabled".includes(query)) ||
          (!user.disabled && "active".includes(query)) ||
          (user.disabled && "inactive".includes(query)) ||
          formatDate(user.createdAt).toLowerCase().includes(query)
      );
      
      // Sort filtered results with current user always first
      const sortedFiltered = [...filtered].sort((a, b) => {
        // Current user always first (regardless of disabled status)
        if (a.uid === currentAuthUser.uid) return -1;
        if (b.uid === currentAuthUser.uid) return 1;
        
        // Enabled users first, then disabled
        if (!a.disabled && b.disabled) return -1;
        if (a.disabled && !b.disabled) return 1;
        
        // Within groups, sort by date (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setFilteredUsers(sortedFiltered);
    }
  }, [searchQuery, users, currentAuthUser]);

  // Handle role change with confirmation
  const handleRoleChange = (uid: string, newRole: string, user: UserRecord) => {
    // Prevent changing current user's role
    if (uid === currentAuthUser?.uid) {
      setErrorMessage("You cannot change your own role.");
      return;
    }

    const currentRole = user.role || "user";
    if (newRole === currentRole) return;

    setUserToUpdate({
      uid,
      newRole,
      userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      currentRole,
    });
  };

  // Handle disable/enable with confirmation
  const handleDisableClick = (user: UserRecord) => {
    // Prevent disabling current user
    if (user.uid === currentAuthUser?.uid) {
      setErrorMessage("You cannot disable your own account.");
      return;
    }

    setUserToDisable({
      uid: user.uid,
      userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      currentDisabled: user.disabled || false,
    });
  };

  // Confirm and update role
  const confirmUpdateRole = async () => {
    if (!userToUpdate) return;

    setUpdatingUid(userToUpdate.uid);
    setErrorMessage("");
    setSuccessMessage("");
    setUserToUpdate(null);

    try {
      const res = await fetch("/api/admin/updateUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userToUpdate.uid, role: userToUpdate.newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating role");

      setSuccessMessage(`Role updated successfully! ${userToUpdate.userName} is now ${userToUpdate.newRole}.`);
      await fetchUsers();
    } catch {
      setErrorMessage("Failed to update role.");
    } finally {
      setUpdatingUid(null);
    }
  };

  // Confirm and update disable status
  const confirmUpdateDisableStatus = async () => {
    if (!userToDisable) return;

    setUpdatingUid(userToDisable.uid);
    setErrorMessage("");
    setSuccessMessage("");
    setUserToDisable(null);

    try {
      const res = await fetch("/api/admin/setUserDisabled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userToDisable.uid,
          disabled: !userToDisable.currentDisabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage(
        userToDisable.currentDisabled
          ? `User re-enabled successfully. ${userToDisable.userName} can now log in again.`
          : `User disabled successfully. ${userToDisable.userName} can no longer log in.`
      );

      await fetchUsers();
    } catch {
      setErrorMessage("Failed to update user status.");
    } finally {
      setUpdatingUid(null);
    }
  };

  // Cancel updates
  const cancelUpdate = () => {
    setUserToUpdate(null);
    setUserToDisable(null);
  };
  // Show loading until Firebase has finished initializing
  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0E8DB]">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg !font-sans">
          Loading users...
        </p>
      </div>
    );
  }


  return (
  <>
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          User Management
        </h1>

        {/* Guest State - When user is not logged in */}
        {!currentAuthUser && (
          <div className="space-y-6 mt-8">
            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
                Please Log In
              </h2>
              <div className="text-center">
                <p className="text-lg text-[#4A3820] mb-6">
                  Log In as an administrator to access user management
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Content - Only show when logged in */}
        {currentAuthUser && (
          <>
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
             <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              {/* LEFT: Heading + counts */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-medium text-[#4A3820] !font-sans">
                  Users
                </h2>
                <p className="text-sm text-[#4A3820]/70 mt-1">
                  Total: <strong>{users.length}</strong> ·
                  Active: <strong>{users.filter(u => !u.disabled).length}</strong> ·
                  Disabled: <strong>{users.filter(u => u.disabled).length}</strong>
                </p>
              </div>

              {/* RIGHT: Search */}
              <div className="w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by name, email, role, disabled/enabled, or date (DD/MM/YYYY)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-96 px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                />
              </div>
            </div>


              {!loading && filteredUsers.length === 0 ? (
                  <div className="text-center text-[#4A3820] p-4">
                    {searchQuery ? "No users match your search." : "No users found."}
                  </div>
                ) : (
                // ADDED: Scrollable container with max height
                <div 
                  className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollable-description"
                >
                  {filteredUsers.map((u) => {
                    const isSuperAdmin = u.uid === "z2Vhrt7WiBSBDLlvnNuJ3PMtsvk2";
                    const isCurrentUser = u.uid === currentAuthUser?.uid;
                    return (
                      <div
                        key={u.uid}
                        className={`rounded-lg bg-white border border-[#D8CDBE] p-4 shadow-md ${
                          isCurrentUser ? "border-l-4 border-l-[#805C2C]" : ""
                        } ${u.disabled ? "opacity-80" : ""}`}
                      >
                        {/* UPPER SECTION: User Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          {/* User Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <p className="text-[#4A3820] font-bold">
                                {u.firstName} {u.lastName}
                                {isCurrentUser && (
                                  <span className="ml-2 px-2 py-1 !text-sm bg-amber-100 text-amber-800 rounded-full">You</span>
                                )}
                              </p>
                              {/* Role Badges */}
                              {isSuperAdmin && (
                                <span className="ml-2 px-2 py-1 !text-sm bg-purple-100 text-purple-800 rounded-full">
                                  Super Admin
                                </span>
                              )}
                              {u.role === 'admin' && (
                                <span className="ml-2 px-2 py-1 !text-sm bg-red-100 text-red-800 rounded-full">Admin</span>
                              )}
                              {u.role === 'author' && (
                                <span className="ml-2 px-2 py-1 !text-sm bg-blue-100 text-blue-800 rounded-full">Author</span>
                              )}
                              {u.disabled && (
                                <span className="ml-2 px-2 py-1 !text-sm bg-gray-200 text-gray-800 rounded-full">
                                  Disabled
                                </span>
                              )}
                            </div>
                            {/* Email and Date */}
                            <p className="text-[#4A3820]/80 truncate mb-1">
                              {u.email}
                            </p>
                            <p className="text-sm text-[#4A3820]/60">
                              Joined: {formatDate(u.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* LOWER SECTION: Controls - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          {/* Role Selector */}
                          <div className="flex items-center gap-2">
                            <select
                              className={`px-3 py-2 rounded-lg border-2 ${
                                isCurrentUser 
                                  ? 'border-gray-400 bg-gray-100 text-gray-500' 
                                  : 'border-[#805C2C] bg-[#F0E8DB] text-[#4A3820]'
                              } font-inter min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed`}
                              value={u.role || "reader"}
                              disabled={isSuperAdmin || isCurrentUser || updatingUid === u.uid}
                              onChange={(e) => handleRoleChange(u.uid, e.target.value, u)}
                            >
                              <option value="reader">Reader</option>
                              <option value="author">Author</option>
                              <option value="admin">Admin</option>
                            </select>

                            {updatingUid === u.uid && (
                              <span className="text-[#4A3820] text-sm">Updating...</span>
                            )}
                          </div>

                          {/* Disable/Enable Button - New design */}
                          <button
                            disabled={isSuperAdmin || isCurrentUser || updatingUid === u.uid}
                            onClick={() => handleDisableClick(u)}
                            className={`
                              px-4 py-2 rounded-lg font-medium transition-all duration-200
                              w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed !font-sans
                              ${isSuperAdmin ? 'border-purple-300 text-purple-400 cursor-not-allowed' : ''}
                              ${u.disabled 
                                ? "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white" 
                                : "border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              }
                              ${isCurrentUser ? 'border-gray-400 text-gray-500 hover:bg-gray-100 hover:text-gray-500' : ''}
                            `}
                          >
                            {u.disabled ? "Enable User" : "Disable User"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Role Change Confirmation Modal */}
    {userToUpdate && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="!font-sans text-2xl font-bold text-[#4A3820] mb-4">
            Confirm Role Change
          </h3>
          <p className="text-[#4A3820] mb-6 !font-sans">
            Are you sure you want to change <strong>{userToUpdate.userName}</strong>'s role from{" "}
            <span className="font-bold text-[#805C2C] !text-xl !font-sans">{userToUpdate.currentRole}</span> to{" "}
            <span className="font-bold text-[#805C2C] !text-xl !font-sans">{userToUpdate.newRole}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={cancelUpdate}
              className="px-4 py-2 rounded-lg border-2 border-[#D8CDBE] text-[#4A3820] !font-sans hover:bg-[#F0E8DB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmUpdateRole}
              className="px-4 py-2 rounded-lg bg-[#805C2C] text-white !font-sans hover:bg-[#6B4C24] transition-colors"
            >
              Confirm Change
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Disable/Enable Confirmation Modal */}
    {userToDisable && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="!font-sans text-2xl font-bold text-[#4A3820] mb-4">
            {userToDisable.currentDisabled ? "Enable User" : "Disable User"}
          </h3>
          <p className="text-[#4A3820] mb-6 !font-sans">
            Are you sure you want to {userToDisable.currentDisabled ? "enable" : "disable"} <strong>{userToDisable.userName}</strong>?
            {!userToDisable.currentDisabled && (
              <span className="block mt-2 text-sm text-red-600">
                This will prevent the user from logging into their account.
              </span>
            )}
            {userToDisable.currentDisabled && (
              <span className="block mt-2 text-sm text-emerald-600">
                This will allow the user to log into their account again.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={cancelUpdate}
              className="px-4 py-2 rounded-lg border-2 border-[#D8CDBE] text-[#4A3820] !font-sans hover:bg-[#F0E8DB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmUpdateDisableStatus}
              className={`px-4 py-2 rounded-lg text-white !font-sans transition-colors ${
                userToDisable.currentDisabled 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Confirm {userToDisable.currentDisabled ? "Enable" : "Disable"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}