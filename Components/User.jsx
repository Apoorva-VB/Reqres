import React, { useEffect, useState } from "react";
import "./User.css";
import "./EditUser.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://reqres.in/api/users?page=${currentPage}&per_page=4`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.data);
        setTotalPages(data.total_pages);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      let allData = [];
      for (let page = 1; page <= totalPages; page++) {
        const response = await fetch(
          `https://reqres.in/api/users?page=${page}&per_page=4`
        );
        if (response.ok) {
          const data = await response.json();
          allData = [...allData, ...data.data];
        }
      }
      setAllUsers(allData);
    };

    if (totalPages > 1) {
      fetchAllUsers();
    }
  }, [totalPages]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsers(users.filter((user) => user.id !== id));
        setAllUsers(allUsers.filter((user) => user.id !== id)); // Also update allUsers
        setMessage("User deleted successfully!");
        setTimeout(() => setMessage(""), 2000);
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://reqres.in/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) throw new Error("Failed to update user");

      // Create the updated user with all original properties plus the edited ones
      const updatedUser = {
        ...editingUser,
        ...editFormData,
      };

      // Update both users arrays
      setUsers(
        users.map((user) => (user.id === editingUser.id ? updatedUser : user))
      );

      setAllUsers(
        allUsers.map((user) =>
          user.id === editingUser.id ? updatedUser : user
        )
      );

      setMessage("User updated successfully!");
      setEditingUser(null);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const displayedUsers = searchTerm
    ? allUsers.filter((user) =>
        `${user.first_name} ${user.last_name} ${user.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : users;

  return (
    <div className="user-container">
      <h2 className="user-title">User List</h2>
      {message && <div className="message">{message}</div>}
      {error && <div className="error-message">Error: {error}</div>}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      {isLoading ? (
        <div className="loading">Loading users...</div>
      ) : displayedUsers.length === 0 ? (
        <div className="no-results">No users found matching your search.</div>
      ) : (
        <div className="user-grid">
          {displayedUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-avatar-container">
                <img
                  src={user.avatar}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="user-avatar"
                />
              </div>
              <div className="user-info">
                <h3 className="user-name">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="user-email">{user.email}</p>
              </div>
              <div className="user-actions">
                <button
                  onClick={() => handleEditClick(user)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="pagination-button"
        >
          &larr; Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="pagination-button"
        >
          Next &rarr;
        </button>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-container">
            <button onClick={closeEditModal} className="close-button">
              ×
            </button>
            <h3>Edit User</h3>
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={editFormData.first_name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={editFormData.last_name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
