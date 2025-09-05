import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";

function numberToWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];
  function twoDigitWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
  }
  function inWords(num: number): string {
    if (num === 0) return 'Zero';
    if (num > 999999999) return 'Overflow';
    let str = '';
    const n = ("000000000" + num).slice(-9);
    const crore = parseInt(n.slice(0, 2), 10);
    const lakh = parseInt(n.slice(2, 4), 10);
    const thousand = parseInt(n.slice(4, 6), 10);
    const hundred = parseInt(n.slice(6, 7), 10);
    const rest = parseInt(n.slice(7, 9), 10);
    if (crore) str += twoDigitWords(crore) + ' Crore ';
    if (lakh) str += twoDigitWords(lakh) + ' Lakh ';
    if (thousand) str += twoDigitWords(thousand) + ' Thousand ';
    if (hundred) str += a[hundred] + ' Hundred ';
    if (rest) str += (str.trim() !== '' ? 'and ' : '') + twoDigitWords(rest) + ' ';
    return str.trim();
  }
  return inWords(Math.floor(num));
}

const LOCAL_STORAGE_KEY = 'buyerDetailsList';

export default function App() {
  // "page": 0 = form, 1 = preview
  const [page, setPage] = useState(0);

  // Form state
  const [buyer, setBuyer] = useState({ name: "", address: "", gstin: "" });
  const [savedBuyers, setSavedBuyers] = useState<any[]>([]);


  const [shippingAddress, setShippingAddress] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [poNo, setPoNo] = useState("");
  const [poDate, setPoDate] = useState("");
  const [taxType, setTaxType] = useState("IGST");
  const [transportName, setTransportName] = useState("");
  const [transportID, setTransportID] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  // Products as array of objects
  const [products, setProducts] = useState<any[]>([
    { description: "", hsn: "", qty: 1, unit: "NOS", rate: 0 }
  ]);
  // For print
  const previewRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setSavedBuyers(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // Save buyer to list if not already present
    const exists = savedBuyers.some(b => b.name === buyer.name);
    const updatedList = exists ? savedBuyers : [...savedBuyers, buyer];
    setSavedBuyers(updatedList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    alert("Form submitted! Now in preview mode.")
  };


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setBuyer(prev => ({ ...prev, name }));
    const match = savedBuyers.find(b => b.name === name);
    if (match) {
      setBuyer({ name: match.name, address: match.address, gstin: match.gstin });
    }
  };


  // Invoice calculations
  const total = products.reduce((sum, p) => sum + (+p.qty) * (+p.rate), 0);
  let tax = 0, taxRows: any = null;
  if (taxType === "IGST") {
    tax = total * 0.12;
    taxRows = (
      <tr>
        <td colSpan={6} className="text-right font-bold">IGST @12%</td>
        <td>₹ {tax.toFixed(2)}</td>
      </tr>
    );
  } else {
    const half = (total * 0.18) / 2;
    taxRows = (
      <>
        <tr>
          <td colSpan={6} className="text-right font-bold">SGST @9%</td>
          <td>₹ {half.toFixed(2)}</td>
        </tr>
        <tr>
          <td colSpan={6} className="text-right font-bold">CGST @9%</td>
          <td>₹ {half.toFixed(2)}</td>
        </tr>
      </>
    );
    tax = half * 2;
  }
  const grandTotal = total + tax;
  const rupees = Math.floor(grandTotal);
  const paise = Math.round((grandTotal - rupees) * 100);
  const amountWords = `${numberToWords(rupees)} Rupees${paise > 0 ? ' and ' + numberToWords(paise) + ' Paise' : ''}`;

  // Handlers
  const handleProductChange = (idx: number, field: string, value: any) => {
    setProducts(products.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    ));
  };
  const addProduct = () => setProducts([...products, { description: "", hsn: "", qty: 1, unit: "NOS", rate: 0 }]);
  const removeProduct = (idx: number) => setProducts(products.length === 1 ? products : products.filter((_, i) => i !== idx));

  // Print logic
  const handlePrint = useReactToPrint({
    documentTitle: `Invoice_${invoiceNo || 'Untitled'}`,
  });

  // --- Render ---
  if (page === 1) {
    // Invoice Preview Page
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4">
        <div className="flex justify-between items-center mb-4">
          <button className="text-blue-600 hover:underline" onClick={() => setPage(0)}>← Back to Edit</button>
          {/* <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handlePrint(previewRef.current)}>Print Invoice</button> */}
        </div>
        <div ref={previewRef}>
          <div id="invoice" className="border p-4 rounded bg-white shadow">
            <h3 id="invoiceTitle" className="text-2xl font-bold text-center mb-2">Tax Invoice</h3>
            <p id="company" className="text-xl font-bold text-center mb-1"><strong> SAI BELTING </strong></p>
            <p id="address" className="text-center mb-1">
              G-58, Site - B, UPSIDC Industrial Area, <br />
              Surajpur, Greater Noida (U.P.) - 201306 <br />
            </p>
            <p id="contact" className="text-center mb-2">Phone: +91-9818522978, Email: saibelting35@gmail.com</p>
            <section id="customer" className="flex flex-col md:flex-row gap-2 mb-3">
              <p id="buyer" className="border rounded p-3 w-full md:w-1/2">
                <strong>M/S: </strong>{buyer.name}<br />
                <strong>Billing Address: </strong>{buyer.address}<br />
                <strong>Shipping Address: </strong>{shippingAddress}<br />
                <strong>GSTIN:</strong> {buyer.gstin}
              </p>
              <p id="invR" className="border rounded p-3 w-full md:w-1/2">
                <strong>Invoice No:</strong> {invoiceNo} <br />
                <strong>Invoice Date:</strong> {invoiceDate ? (() => {
                  const d = new Date(invoiceDate);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  return `${day}/${month}/${year}`;
                })() : ""}<br />

                <strong>PO No:</strong> {poNo} <br />

                <strong>PO Date:</strong> {poDate ? (() => {
                  const d = new Date(poDate);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  return `${day}/${month}/${year}`;
                })() : ""}
              </p>
            </section>
            <div className="overflow-x-auto">
              <table className="table-auto w-full mb-3 border rounded">
                <thead>
                  <tr className="bg-gray-200">
                    <th>S.No.</th>
                    <th>Description</th>
                    <th>HSN Code</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody className="text-center divide-y divide-gray-200">
                  {products.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{item.description}</td>
                      <td>{item.hsn}</td>
                      <td>{item.qty}</td>
                      <td>{item.unit}</td>
                      <td>₹ {Number(item.rate).toFixed(2)}</td>
                      <td>₹ {(Number(item.qty) * Number(item.rate)).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={6} className="text-right font-bold">Total</td>
                    <td>₹ {total.toFixed(2)}</td>
                  </tr>
                  {taxRows}
                  <tr>
                    <td colSpan={6} className="text-right font-bold">Grand Total</td>
                    <td>₹ {grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="border rounded p-3 mb-2">
              <strong>Amount in Words:</strong> {amountWords} Only
            </p>
            <section className="transporter  flex">
              <p className="border rounded p-3 mb-2 w-full">
                <strong>Transporter:</strong> {transportName} <br />
                <strong>Transporter ID:</strong> {transportID} <br />
                <strong>Vehicle No.:</strong> {vehicleNo}
              </p>
              <p id="bank" className="border rounded p-3 mb-2 w-full ml-2">
                <strong>Bank Details:</strong><br />
                Bank: Punjab National Bank<br />
                Branch: Sector-12, Noida<br />
                Account No.: 468002100001440<br />
                IFSC Code: PUNB0466000
              </p>
            </section>
            <p id="terms" className="border rounded p-3 mb-2">
              <strong>Terms & Conditions:</strong><br />
              1. Goods once sold will not be taken back.<br />
              2. Interest @ 18% per annum will be charged if the payment is not made within the stipulated time.<br />
              3. Subject to G.B. Nagar jurisdiction only.
            </p>
            
            
            <p id="sign" className="text-right mt-8">
              <strong>For SAI BELTING</strong><br /><br />(Authorized Signatory)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Page 0: Form
  return (
    <div className="w-full mx-auto mt-0 p-4 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-6">Dynamic Invoice Generator</h2>
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <form className="border bg-white rounded shadow p-6" onSubmit={handleSubmit}>
          <h3 className="text-xl font-bold mb-4">Invoice Details</h3>
          <label className="block font-medium mt-2">Invoice No</label>
          <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="border input input-bordered w-full mt-1 p-2 rounded" />


          <label className="block font-medium mt-2">Buyer Name</label>
          <input value={buyer.name} 
          onChange={handleNameChange}
          required 
          className="border input input-bordered w-full mt-1 p-2 rounded" 
          />

          <datalist id="buyer-suggestions">
            {savedBuyers.map((suggestion, index) => (
              <option key={index} value={suggestion.name} />
            ))}
          </datalist>

          <label className="block font-medium mt-2">Buyer GSTIN</label>
          <input value={buyer.gstin} onChange={e => setBuyer({ ...buyer, gstin: e.target.value.toUpperCase() })} className="border input input-bordered w-full mt-1 p-2 uppercase rounded" />
          
          <span className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <span>
              <label className="block font-medium mt-2">Billing Address</label>
              <textarea value={buyer.address} onChange={e => setBuyer({ ...buyer, address: e.target.value })} required className="border textarea h-full textarea-bordered w-full mt-1 p-2 rounded" />
            </span>
            <span>
              <label className="block font-medium mt-2">Shipping Address</label>
              <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required className="border textarea h-full textarea-bordered w-full mt-1 p-2 rounded" />
            </span>
          </span>
        
          <label className="block font-medium mt-2">Date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={e => setInvoiceDate(e.target.value)}
            className="border input input-bordered w-full mt-1 p-2 rounded"
          />


          <label className="block font-medium mt-2">PO Number</label>
          <input value={poNo} onChange={e => setPoNo(e.target.value)} className="border input input-bordered w-full mt-1 p-2 rounded" />
          <label className="block font-medium mt-2">PO Date</label>
          <input type="date" value={poDate} onChange={e => setPoDate(e.target.value)} className="border input input-bordered w-full mt-1 p-2 rounded" />

          <h4 className="text-lg font-semibold mt-6 mb-2">Product Entry</h4>
          <span className="border rounded  grid grid-cols-1 md:grid-cols-8 gap-2 mb-1 items-center">
            <span className="font-bold text-center col-span-1">S.No.</span>
            <span className="font-bold text-center col-span-2">Description</span>
            <span className="font-bold text-center">HSN</span>
            <span className="font-bold text-center">Qty</span>
            <span className="font-bold text-center">Unit</span>
            <span className="font-bold text-center">Rate</span>
            
          </span>
          {products.map((item, idx) => (
            
            <div key={idx} className="border rounded p-2 grid grid-cols-1 md:grid-cols-8 gap-2 mb-1 items-center">
              <span className="font-bold text-center">{idx + 1}.</span>
              <input
                placeholder="Description"
                value={item.description}
                onChange={e => handleProductChange(idx, "description", e.target.value)}
                className="input input-bordered w-full text-center px-2 col-span-2"
                required
              />
              <input
                placeholder="HSN"
                value={item.hsn}
                onChange={e => handleProductChange(idx, "hsn", e.target.value)}
                className="input input-bordered w-full text-center px-2"
              />
              <input
                type="number"
                min={1}
                placeholder="Qty"
                value={item.qty}
                onChange={e => handleProductChange(idx, "qty", e.target.value)}
                className="input input-bordered w-full text-center"
                required
              />
              <input
                placeholder="Unit"
                value={item.unit}
                onChange={e => handleProductChange(idx, "unit", e.target.value)}
                className="input input-bordered w-full text-center px-2"
              />
              <input
                min={0}                
                placeholder="Rate"
                value={item.rate}
                onChange={e => handleProductChange(idx, "rate", e.target.value)}
                className="input input-bordered w-full text-center px-2"
                required
              />
              <button type="button" onClick={() => removeProduct(idx)} className="text-red-600 rounded-full w-8 h-8 mr-7 justify-self-end font-bold text-xl hover cursor-pointer">×</button>
            </div>
          ))}
          <button type="button" onClick={addProduct} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
            Add Item
          </button>

          <label className="block font-medium mt-4">Tax Type</label>
          <select value={taxType} onChange={e => setTaxType(e.target.value)} className="border rounded p-1 select select-bordered w-full mt-1">
            <option value="IGST">IGST (12%)</option>
            <option value="SGST">SGST/CGST (9% each)</option>
          </select>

          <h3 className="text-lg font-semibold mt-6 mb-2">Transporter Details</h3>
          <label className="block font-medium mt-2">Transporter Name</label>
          <input value={transportName} onChange={e => setTransportName(e.target.value)} className="border rounded p-1 input input-bordered w-full mt-1" />
          <label className="block font-medium mt-2">Transporter ID</label>
          <input value={transportID} onChange={e => setTransportID(e.target.value)} className="border rounded p-1 input input-bordered w-full mt-1" />
          <label className="block font-medium mt-2">Vehicle No.</label>
          <input value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="border rounded p-1 input input-bordered w-full mt-1" />

          <div className="mt-8">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded text-lg">
              Preview Invoice →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}