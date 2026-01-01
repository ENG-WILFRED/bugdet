import { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Button, Input } from "@/app/components/ui";
import { Spinner } from "@/app/components/ui/shared/SharedComponents";
import { addTransaction, deleteTransaction, getTransactions } from "@/actions/transactions";

interface TransactionListProps {
  userId: number;
  onTransactionAdded?: () => void;
}

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Education",
  "Other",
];

export function TransactionUpload({ userId, onTransactionAdded }: TransactionListProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleAddTransaction = async () => {
    if (!description || !amount) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const transactionDate = new Date(date);
      await addTransaction(userId, description, parseFloat(amount), category, transactionDate);
      setDescription("");
      setAmount("");
      setCategory("Food & Dining");
      setDate(new Date().toISOString().split("T")[0]);
      setShowForm(false);
      onTransactionAdded?.();
      // Refresh transactions list
      const updated = await getTransactions(userId, 10);
      setTransactions(updated);
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-primary-med shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Upload size={20} className="text-primary-magenta" />
          Daily Transaction Upload
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 rounded-md bg-primary-magenta text-white text-sm font-semibold"
        >
          {showForm ? "Cancel" : "+ Add Transaction"}
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-primary-blue rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-primary-blue text-white"
            />
            <Input
              type="number"
              placeholder="Amount (KES)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-primary-blue text-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-primary-blue text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-primary-blue text-white"
            />
          </div>
          <Button
            onClick={handleAddTransaction}
            disabled={loading}
            className="w-full bg-primary-magenta text-white py-2 rounded-lg font-semibold"
          >
            {loading ? <Spinner /> : "Upload Transaction"}
          </Button>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 bg-primary-blue rounded-lg"
            >
              <div className="flex-1">
                <p className="font-semibold text-sm">{tx.description}</p>
                <p className="text-xs text-white-off opacity-70">
                  {tx.category} • {new Date(tx.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-green-light">KES {tx.amount.toFixed(2)}</p>
                <button
                  onClick={() => handleDeleteTransaction(tx.id)}
                  className="text-red-accent hover:text-orange-dark"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {transactions.length === 0 && !showForm && (
        <p className="text-white-off opacity-70 text-sm text-center py-4">No transactions yet. Add your first one!</p>
      )}
    </div>
  );
}
