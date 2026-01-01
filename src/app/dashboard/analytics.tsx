"use client";

import { useState, useEffect, useRef } from "react";
import { Download, TrendingUp, Wallet, Target, Eye, EyeOff } from "lucide-react";
import { getItems } from "../../../actions/items";
import { useUser } from "@/app/UserContext";
import { useRouter } from "next/navigation";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { initiateMpesa } from "../../../actions/mpesa";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

function BudgetDashboard() {
  const userContext = useUser();
  const user = userContext?.user;
  const hydrated = userContext?.hydrated;
  const router = useRouter();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const mpesaFormRef = useRef<HTMLFormElement | null>(null);
  const mpesaAmountRef = useRef<HTMLInputElement | null>(null);
  const mpesaPhoneRef = useRef<HTMLInputElement | null>(null);
  
  const [items, setItems] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "items">("overview");

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    })();
  }, []);

  // Calculate statistics
  const totalSpent = items.reduce((sum, item) => sum + item.cost, 0);
  const itemCount = items.length;
  const averageSpent = itemCount > 0 ? (totalSpent / itemCount).toFixed(2) : 0;

  // Get spending by category (using item names as categories)
  const _catMap = items.reduce((map, item) => {
    const existing = map.get(item.name) || { name: item.name, value: 0 };
    existing.value += item.cost;
    map.set(item.name, existing);
    return map;
  }, new Map<string, { name: string; value: number }>());

  const categoryDataArr: { name: string; value: number }[] = [];
  for (const v of _catMap.values()) {
    categoryDataArr.push(v as { name: string; value: number });
  }
  const categoryData: { name: string; value: number }[] = categoryDataArr
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  // Get monthly spending trend
  const monthlyData = Array.from(
    items.reduce((map, item) => {
      const date = new Date(item.date || item.createdAt);
      const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const existing = map.get(month) || { month, amount: 0 };
      existing.amount += item.cost;
      map.set(month, existing);
      return map;
    }, new Map()).values()
  ).sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Get daily spending
  const dailyData = Array.from(
    items.reduce((map, item) => {
      const date = new Date(item.date || item.createdAt).toLocaleDateString();
      const existing = map.get(date) || { date, amount: 0 };
      existing.amount += item.cost;
      map.set(date, existing);
      return map;
    }, new Map()).values()
  ).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: "#0f172a",
        allowTaint: true,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`budget-report-${user?.name}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaInitiate = async () => {
    try {
      const amountStr = window.prompt('Enter amount (KES)');
      if (!amountStr) return;
      const phone = window.prompt('Enter phone (2547XXXXXXXX)');
      if (!phone) return;
      const amount = Number(amountStr);
      if (Number.isNaN(amount) || amount <= 0) {
        setToast({ message: 'Invalid amount', type: 'error' });
        return;
      }
      // populate hidden form and submit to server action
      if (mpesaAmountRef.current) mpesaAmountRef.current.value = String(amount);
      if (mpesaPhoneRef.current) mpesaPhoneRef.current.value = phone;
      setLoading(true);
      setToast(null);
      mpesaFormRef.current?.requestSubmit();
      // optimistic message
      setToast({ message: 'Payment initiated — check your phone', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err?.message || String(err), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen w-full bg-primary-dark text-white-off py-8 px-4 md:px-8">
      <form ref={mpesaFormRef} action={initiateMpesa as any} className="hidden">
        <input ref={mpesaAmountRef} name="amount" />
        <input ref={mpesaPhoneRef} name="phone" />
      </form>
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 text-white px-8 py-4 rounded-2xl font-bold z-50 ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-sky-500'}`}>
          {toast.message}
        </div>
      )}
      <div className="w-full" ref={dashboardRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-primary-magenta mb-1">Budget Dashboard</h1>
            <p className="text-sm text-white-off">Welcome, {user.name}! 📊</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleMpesaInitiate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-magenta text-white font-bold"
              title="Pay with M-Pesa"
            >
              <Wallet size={18} />
              <span>Pay (M-Pesa)</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-med text-white-off"
              title="Download as PDF"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-3 py-2 rounded-md ${activeTab === "overview" ? "bg-primary-med" : "bg-transparent"}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-3 py-2 rounded-md ${activeTab === "items" ? "bg-primary-med" : "bg-transparent"}`}
            onClick={() => setActiveTab("items")}
          >
            All Items
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="overview-content">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet size={24} />
                    <h3 className="font-semibold">Total Spent</h3>
                  </div>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-white-off">
                    {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <p className="text-2xl font-bold">{showBalance ? `KES ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}</p>
                <p className="text-sm text-white-off opacity-70">All expenses combined</p>
              </div>

              <div className="p-4 rounded-xl bg-primary-magenta text-white shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={24} />
                  <h3 className="font-semibold">Items</h3>
                </div>
                <p className="text-2xl font-bold">{itemCount}</p>
                <p className="text-sm">Budget entries</p>
              </div>

              <div className="p-4 rounded-xl bg-primary-med shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={24} />
                  <h3 className="font-semibold">Average</h3>
                </div>
                <p className="text-2xl font-bold">KES {Number(averageSpent).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-white-off opacity-70">Per item</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-container">
              {/* Bar Chart - Monthly Spending */}
              {monthlyData.length > 0 && (
                <div className="p-4 rounded-xl bg-primary-med mb-4">
                  <h3 className="font-semibold mb-2">Monthly Spending Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="month" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Bar dataKey="amount" fill="#f59e0b" name="Amount (KES)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Line Chart - Daily Spending */}
              {dailyData.length > 0 && (
                <div className="p-4 rounded-xl bg-primary-med mb-4">
                  <h3 className="font-semibold mb-2">Last 7 Days Spending</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="date" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#06b6d4"
                        name="Amount (KES)"
                        strokeWidth={2}
                        dot={{ fill: "#06b6d4" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pie Chart - Category Distribution */}
              {categoryData.length > 0 && (
                <div className="p-4 rounded-xl bg-primary-med mb-4">
                  <h3 className="font-semibold mb-2">Spending by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: KES ${value.toFixed(0)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                        labelStyle={{ color: "#f1f5f9" }}
                        formatter={(value: any) => `KES ${Number(value || 0).toFixed(2)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Spending Items */}
            <div className="p-4 rounded-xl bg-primary-med">
              <h3 className="font-semibold mb-3">Top 5 Spending Items</h3>
              <div>
                {items
                  .sort((a, b) => b.cost - a.cost)
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-primary-blue">
                      <div className="flex items-center gap-3">
                        <div className="text-white-off opacity-70">#{index + 1}</div>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-white-off opacity-70">{item.author?.name || "Unknown"}</p>
                        </div>
                      </div>
                      <div className="text-yellow-bright">KES {item.cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "items" && (
          <div className="bg-primary-med rounded-xl p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white-off opacity-70 text-sm">
                    <th className="py-2">Item Name</th>
                    <th className="py-2">Cost</th>
                    <th className="py-2">Author</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-700">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">KES {item.cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="py-2">{item.author?.name || "Unknown"}</td>
                      <td className="py-2">{new Date(item.date || item.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">{item.comment || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Go to Full Dashboard */}
        <div className="mt-6 flex justify-end">
          <button onClick={() => router.push("/dashboard/items")} className="px-4 py-2 rounded-md bg-primary-magenta text-white font-bold">Manage Items & Comments →</button>
        </div>
      </div>
    </div>
  );
}

export default BudgetDashboard;
