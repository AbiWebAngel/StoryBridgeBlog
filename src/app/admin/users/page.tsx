"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Adjust the import path as needed

type UserRecord = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

export default function AdminUsersPage() {
  const { user: currentAuthUser } = useAuth(); // Get current user from auth context
  
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

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/getUsers");
      const data = await res.json();
      const usersData = data.users || [];
      
      // Sort users: current user first, then others
      if (currentAuthUser?.uid) {
        const sortedUsers = [...usersData].sort((a, b) => {
          if (a.uid === currentAuthUser.uid) return -1;
          if (b.uid === currentAuthUser.uid) return 1;
          return 0;
        });
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      } else {
        setUsers(usersData);
        setFilteredUsers(usersData);
      }
    } catch (error) {
      setErrorMessage("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentAuthUser?.uid]); // Refetch when current user changes

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
      );
      
      // Maintain current user as first in filtered results if present
      if (currentAuthUser?.uid) {
        const currentUser = users.find(u => u.uid === currentAuthUser.uid);
        if (currentUser && filtered.some(u => u.uid === currentAuthUser.uid)) {
          const filteredWithoutCurrent = filtered.filter(u => u.uid !== currentAuthUser.uid);
          setFilteredUsers([currentUser, ...filteredWithoutCurrent]);
          return;
        }
      }
      
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users, currentAuthUser?.uid]);

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

  // Cancel role update
  const cancelUpdateRole = () => {
    setUserToUpdate(null);
  };

  return (
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          User Management
        </h1>

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-medium text-[#4A3820] !font-sans">
              Users
            </h2>
            
            {/* Search Field */}
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
              />
              {searchQuery && (
                <p className="!text-sm text-[#4A3820]/70 mt-1">
                  Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-[#4A3820]">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-[#4A3820] p-4">
              {searchQuery ? "No users match your search." : "No users found."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((u) => {
                const isCurrentUser = u.uid === currentAuthUser?.uid;
                return (
                  <div
                    key={u.uid}
                    className={`rounded-lg bg-white border border-[#D8CDBE] p-4 shadow-md ${
                      isCurrentUser ? "border-l-4 border-l-[#805C2C]" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline flex-wrap">
                          <p className="text-[#4A3820] font-bold">
                            {u.firstName} {u.lastName}
                            {isCurrentUser && (
                              <span className="ml-2 px-2 py-1 !text-sm bg-amber-100 text-amber-800 rounded-full">You</span>
                            )}
                          </p>
                          {u.role === 'admin' && (
                            <span className="ml-2 px-2 py-1 !text-sm bg-red-100 text-red-800 rounded-full">Admin</span>
                          )}
                          {u.role === 'editor' && (
                            <span className="ml-2 px-2 py-1 !text-sm bg-blue-100 text-blue-800 rounded-full">Editor</span>
                          )}
                        </div>
                        <p className="text-[#4A3820]/80 mb-2">{u.email}</p>
                      </div>

                      {/* Role Selector */}
                      <div className="flex items-center gap-3">
                        <select
                          className={`px-3 py-2 rounded-lg border-2 ${
                            isCurrentUser 
                              ? 'border-gray-400 bg-gray-100 text-gray-500' 
                              : 'border-[#805C2C] bg-[#F0E8DB] text-[#4A3820]'
                          } font-inter min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed`}
                          value={u.role || "user"}
                          disabled={updatingUid === u.uid || isCurrentUser}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value, u)}
                        >
                          <option value="user">User</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>

                        {updatingUid === u.uid && (
                          <span className="text-[#4A3820] text-sm">Updating...</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {userToUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="!font-sans text-xl font-bold text-[#4A3820] mb-4">
              Confirm Role Change
            </h3>
            <p className="text-[#4A3820] mb-6">
              Are you sure you want to change <strong>{userToUpdate.userName}</strong>'s role from{" "}
              <span className="font-semibold text-[#805C2C]">{userToUpdate.currentRole}</span> to{" "}
              <span className="font-semibold text-[#805C2C]">{userToUpdate.newRole}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelUpdateRole}
                className="px-4 py-2 rounded-lg border-2 border-[#D8CDBE] text-[#4A3820] hover:bg-[#F0E8DB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateRole}
                className="px-4 py-2 rounded-lg bg-[#805C2C] text-white hover:bg-[#6B4C24] transition-colors"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}