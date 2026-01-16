
import React, { useState } from "react";
import QRCode from "react-qr-code";

export default function QRPage() {
  const [text, setText] = useState("");

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">QR Generator</h2>
      <div className="p-4 bg-white rounded shadow w-full max-w-md">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to generate QR"
          className="p-2 border rounded w-full mb-4"
        />

        <div className="p-4 bg-white inline-block rounded shadow">
          <QRCode value={text || "QR Code"} size={200} />
        </div>
      </div>
    </div>
  );
}
