"use client";
import { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  image?: string;
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [disableInputs, setDisableInputs] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: usersData, error: usersError } = await supabase
      .from("Users")
      .select("*");

    if (usersError) {
      console.error("Error fetching users:", usersError.message);
      setLoading(false);
      return;
    }

    const usersWithImages = await Promise.all(
      usersData.map(async (user: User) => {
        const { data } = supabase.storage.from("Img").getPublicUrl(`${user.id}.jpg`);
        return { ...user, image: data.publicUrl };
      })
    );

    setUsers(usersWithImages);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async () => {
    if (!name || !age || !email) return;

    setDisableInputs(true);
    setTimeout(() => setDisableInputs(false), 3000);

    if (editingUser) {
      await supabase.from("Users").update({ name, age, email }).eq("id", editingUser.id);
      if (image) {
        await supabase.storage.from("Img").remove([`${editingUser.id}.jpg`]);
        await supabase.storage.from("Img").upload(`${editingUser.id}.jpg`, image);
      }
      setEditingUser(null);
    } else {
      const { data } = await supabase.from("Users").insert([{ name, age, email }]).select();
      if (data && data.length > 0 && image) {
        await supabase.storage.from("Img").upload(`${data[0].id}.jpg`, image);
      }
    }
    
    setName("");
    setAge("");
    setEmail("");
    setImage(null);
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    await supabase.from("Users").delete().eq("id", id);
    await supabase.storage.from("Img").remove([`${id}.jpg`]);
    fetchUsers();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Users Table</h2>
      <div className="mb-4">
        <input
          type="file"
          className="form-control mb-2"
          accept="image/*"
          disabled={disableInputs}
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        <input
          type="text"
          placeholder="Name"
          className="form-control mb-2"
          value={name}
          disabled={disableInputs}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          className="form-control mb-2"
          value={age}
          disabled={disableInputs}
          onChange={(e) => setAge(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="form-control mb-2"
          value={email}
          disabled={disableInputs}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className={`btn ${editingUser ? "btn-warning" : "btn-primary"} w-100`}
          disabled={disableInputs}
          onClick={handleSaveUser}
        >
          {editingUser ? "Update User" : "Add User"}
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Email</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><h3>{user.id}</h3></td>
                <td><h3>{user.name}</h3></td>
                <td><h3>{user.age}</h3></td>
                <td><h3>{user.email}</h3></td>
                <td>
                  <img
                    src={user.image}
                    alt="User"
                    width="100"
                    height="100"
                    className="rounded"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => {
                      setEditingUser(user);
                      setName(user.name);
                      setAge(String(user.age));
                      setEmail(user.email);
                    }}
                  >
                    📝
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.id)}>
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Page;
