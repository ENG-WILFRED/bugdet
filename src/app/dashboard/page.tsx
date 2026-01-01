"use client";

import dynamic from "next/dynamic";

const BudgetDashboard = dynamic(() => import("./analytics"), {
  loading: () => <div className="py-8 text-center text-slate-100">Loading dashboard...</div>,
});

export default function DashboardPage() {
  return <BudgetDashboard />;
}

