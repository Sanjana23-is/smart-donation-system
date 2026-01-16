import React, { useEffect, useState } from "react";
import api from "../../api";

export default function AdminInventories() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/inventories");
    setRows(res.data);
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">📦 Inventory Records</h2>

      <table className="w-full bg-white border rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Product ID</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((i) => (
            <tr key={i.inventoryId} className="border-t hover:bg-gray-50">
              <td className="border p-2">{i.inventoryId}</td>
              <td className="border p-2">{i.productId}</td>
              <td className="border p-2">{i.location}</td>
              <td className="border p-2">{i.quantity}</td>
              <td className="border p-2">{i.unit}</td>
              <td className="border p-2">{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
