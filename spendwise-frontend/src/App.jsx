
import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import "./App.css";

const emptyTransaction = () => ({
  title: "",
  amount: "",
  type: "EXPENSE",
  category: "Food",
  transactionDate: new Date().toLocaleDateString("en-CA"),
  paymentMethod: "UPI",
  notes: "",
});

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("spendwiseUser")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("spendwiseToken") || ""
  );
  const [mode, setMode] = useState("login");
  const [activeTab, setActiveTab] = useState("Dashboard");

    const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [transaction, setTransaction] = useState(emptyTransaction);
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function request(path, options = {}) {
    return apiRequest(path, options, token);
  }

  function logout() {
    localStorage.removeItem("spendwiseToken");
    localStorage.removeItem("spendwiseUser");
    setToken("");
    setUser(null);
    setTransactions([]);
    setError("");
    setMessage("");
    setEditingId(null);
  }

  async function loadTransactions() {
    try {
      const data = await apiRequest("/transactions", {}, token);
      setTransactions(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      if (err.message.includes("401") || err.message.includes("403")) {
        logout();
        setError("Your session expired. Please log in again.");
      } else {
        setError(err.message);
      }
    }
  }

  useEffect(() => {
    if (token && user) {
      loadTransactions();
    }
  }, [token, user]);

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const isLogin = mode === "login";
      const data = await apiRequest(
        isLogin ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(
            isLogin
              ? { email: form.email, password: form.password }
              : {
                  fullName: form.fullName,
                  email: form.email,
                  password: form.password,
                }
          ),
        }
      );

      if (data?.token) {
        const safeUser = {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        };

        localStorage.setItem("spendwiseToken", data.token);
        localStorage.setItem("spendwiseUser", JSON.stringify(safeUser));
        setToken(data.token);
        setUser(safeUser);
        setActiveTab("Dashboard");
      } else {
        setMode("login");
        setMessage("Registration successful. Please log in.");
      }
    } catch (err) {
      setError(err.message || "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  async function saveTransaction(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        ...transaction,
        amount: Number(transaction.amount),
      };

      if (editingId !== null) {
        await request(`/transactions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Transaction updated successfully.");
      } else {
        await request("/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Transaction added successfully.");
      }

      setTransaction(emptyTransaction());
      setEditingId(null);
      setActiveTab("Transactions");
      await loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  function editTransaction(item) {
    setTransaction({
      title: item.title || "",
      amount: String(item.amount ?? ""),
      type: item.type || "EXPENSE",
      category: item.category || "",
      transactionDate: item.transactionDate || "",
      paymentMethod: item.paymentMethod || "UPI",
      notes: item.notes || "",
    });
    setEditingId(item.id);
    setActiveTab("Add Transaction");
    setError("");
    setMessage("");
  }

  async function deleteTransaction(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await request(`/transactions/${id}`, { method: "DELETE" });
      setMessage("Transaction deleted successfully.");
      await loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  const income = transactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expenses = transactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  if (!user || !token) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleAuth}>
          <h1 className="auth-logo">SpendWise</h1>
          <p className="auth-subtitle">Your personal finance tracker</p>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "selected" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "register" ? "selected" : ""}
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          {mode === "register" && (
            <label>
              Full Name
              <input
                name="fullName"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </label>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <button className="primary-button full-width" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>
      </div>
    );
  }

 return (
  <div className={`app ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
    <aside className="sidebar">
        <h2 className="logo">SpendWise</h2>

        <nav>
          {["Dashboard", "Transactions", "Add Transaction"].map((tab) => (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setError("");
                setMessage("");
                if (tab === "Add Transaction") {
                  setEditingId(null);
                  setTransaction(emptyTransaction());
                }
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button className="nav-item logout-button" onClick={logout}>
          Logout
        </button>
        <p className="sidebar-footer">Personal Finance Tracker</p>
      </aside>

      <main className="main-content">
       
<header className="topbar">
  <div className="topbar-left">
    <button
      type="button"
      className="menu-toggle"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
    >
      ☰
    </button>

    <div>
      <h1>{activeTab}</h1>
      <p>Welcome, {user.fullName || user.email}</p>
    </div>
  </div>

  <nav className="top-nav">
    {["Dashboard", "Transactions", "Add Transaction"].map((tab) => (
      <button
        type="button"
        key={tab}
        className={`top-nav-link ${activeTab === tab ? "active" : ""}`}
        onClick={() => {
          setActiveTab(tab);
          setError("");
          setMessage("");

          if (tab === "Add Transaction") {
            setEditingId(null);
            setTransaction(emptyTransaction());
          }
        }}
      >
        {tab === "Add Transaction" ? "+ Add Transaction" : tab}
      </button>
    ))}

    <button
      type="button"
      className="top-logout"
      onClick={logout}
    >
      Logout
    </button>
  </nav>

  <div className="avatar">
    {(user.fullName || user.email || "U")
      .charAt(0)
      .toUpperCase()}
  </div>
</header>


        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {activeTab === "Dashboard" && (
          <>
            <section className="summary-grid">
              <div className="summary-card">
                <p>Total Balance</p>
                <h2>₹{(income - expenses).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}</h2>
              </div>
              <div className="summary-card income">
                <p>Total Income</p>
                <h2>₹{income.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}</h2>
              </div>
              <div className="summary-card expense">
                <p>Total Expenses</p>
                <h2>₹{expenses.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}</h2>
              </div>
            </section>

            <section className="panel">
              <h2>Recent Transactions</h2>
              <TransactionTable
                transactions={transactions.slice(0, 5)}
                onEdit={editTransaction}
                onDelete={deleteTransaction}
              />
            </section>
          </>
        )}

        {activeTab === "Transactions" && (
          <section className="panel">
            <h2>All Transactions</h2>
            <TransactionTable
              transactions={transactions}
              onEdit={editTransaction}
              onDelete={deleteTransaction}
            />
          </section>
        )}

        {activeTab === "Add Transaction" && (
          <section className="panel">
            <h2>{editingId !== null ? "Edit Transaction" : "Add Transaction"}</h2>

            <form className="transaction-form" onSubmit={saveTransaction}>
              <label>
                Title
                <input
                  name="title"
                  value={transaction.title}
                  onChange={(e) =>
                    setTransaction({ ...transaction, title: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Amount (₹)
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={transaction.amount}
                  onChange={(e) =>
                    setTransaction({ ...transaction, amount: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Type
                <select
                  name="type"
                  value={transaction.type}
                  onChange={(e) =>
                    setTransaction({ ...transaction, type: e.target.value })
                  }
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </label>

              <label>
                Category
                <input
                  name="category"
                  value={transaction.category}
                  onChange={(e) =>
                    setTransaction({ ...transaction, category: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Date
                <input
                  name="transactionDate"
                  type="date"
                  value={transaction.transactionDate}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      transactionDate: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Payment Method
                <select
                  name="paymentMethod"
                  value={transaction.paymentMethod}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label>
                Notes
                <textarea
                  name="notes"
                  rows="3"
                  value={transaction.notes}
                  onChange={(e) =>
                    setTransaction({ ...transaction, notes: e.target.value })
                  }
                />
              </label>

              <button className="primary-button" type="submit">
                {editingId !== null ? "Update Transaction" : "Save Transaction"}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTransaction(emptyTransaction());
                    setActiveTab("Transactions");
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

function TransactionTable({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return <p>No transactions found. Add your first transaction.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>{item.type}</td>
              <td>₹{Number(item.amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}</td>
              <td>{item.transactionDate}</td>
              <td>
                <div className="table-actions">
                  <button className="edit-button" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
