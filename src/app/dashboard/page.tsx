"use client";

import { useState, useEffect } from "react";
import { Plus, Trash, Pencil, MessageCircle, Users, DollarSign, Send, LogOut } from "lucide-react";
import { Button, Input, Textarea } from "../../components/ui";
import { getItems, addItem, editItem, deleteItem, addComment } from "../../../actions/items";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

function Spinner() {
    return (
        <span style={{
            display: "inline-block",
            width: 22,
            height: 22,
            border: "3px solid #818cf8",
            borderTop: "3px solid #fbbf24",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
        }} />
    );
}

export default function DashboardPage() {
    const userContext = useUser();
    const user = userContext?.user;
    const hydrated = userContext?.hydrated;
    console.log("User Context:", userContext);
    const router = useRouter();
    type Author = {
        name: string;
        id: number;
        password: string;
    };

    type Comment = {
        id: number;
        authorId: number;
        author: Author;
        message: string;
        itemId: number;
        createdAt: Date | string;
    };

    type Item = {
        id: number;
        name: string;
        cost: number;
        comment: string;
        authorId: number;
        author: Author;
        createdAt: Date | string;
        comments: Comment[];
    };

    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState({ name: "", cost: "", comment: "" });
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(false);
    const [cardVisible, setCardVisible] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // Protected route: redirect if not logged in
    useEffect(() => {
        if (hydrated && !user) {
            router.replace("/login");
        }
    }, [hydrated, user, router]);

    useEffect(() => {
        setTimeout(() => setCardVisible(true), 100);
        getItems().then((data) => {
            const normalized = data.map((item) => ({
                ...item,
                comment: item.comment ?? "",
                createdAt: typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString(),
                comments: item.comments
                    ? item.comments.map((c) => ({
                        ...c,
                        createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString(),
                    }))
                    : [],
            }));
            setItems(normalized);
        });
    }, []);

    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem("user");
        router.replace("/login");
    };

    // Add Item
    const handleAdd = async () => {
        if (!user) return;
        setLoading(true);
        setToast(null);
        try {
            const newData = await addItem({
                ...newItem,
                cost: parseFloat(newItem.cost),
                authorId: user.id,
            });
            const normalizedNewData = {
                ...newData,
                comment: newData.comment ?? "",
                createdAt: typeof newData.createdAt === "string" ? newData.createdAt : newData.createdAt.toISOString(),
                comments: newData.comments
                    ? newData.comments.map((c) => ({
                        ...c,
                        createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString(),
                    }))
                    : [],
            };
            setItems([normalizedNewData, ...items]);
            setNewItem({ name: "", cost: "", comment: "" });
            setToast({ message: "Item added!", type: "success" });
        } catch {
            setToast({ message: "Failed to add item.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Edit Item
    const handleEdit = async () => {
        if (!editingItem || !user) return;
        setLoading(true);
        setToast(null);
        try {
            const updated = await editItem({ ...editingItem, authorId: user.id });
            const normalizedUpdated = {
                ...updated,
                comment: updated.comment ?? "",
                createdAt: typeof updated.createdAt === "string" ? updated.createdAt : updated.createdAt.toISOString(),
                comments: updated.comments
                    ? updated.comments.map((c) => ({
                        ...c,
                        createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString(),
                    }))
                    : [],
            };
            setItems(items.map((i) => (i.id === normalizedUpdated.id ? normalizedUpdated : i)));
            setEditingItemId(null);
            setEditingItem(null);
            setToast({ message: "Item updated!", type: "success" });
        } catch {
            setToast({ message: "Failed to update item.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Delete Item
    const handleDelete = async (id: number) => {
        setLoading(true);
        setToast(null);
        try {
            await deleteItem(id);
            setItems(items.filter((i) => i.id !== id));
            setDeletingItemId(null);
            setToast({ message: "Item deleted!", type: "success" });
        } catch {
            setToast({ message: "Failed to delete item.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Add Comment
    const handleAddComment = async (itemId: number) => {
        const message = commentInputs[itemId];
        if (!message || !user) return;
        setLoading(true);
        setToast(null);
        try {
            const comment = await addComment(itemId, user.name, message);
            const normalizedComment = {
                ...comment,
                createdAt: typeof comment.createdAt === "string" ? comment.createdAt : comment.createdAt.toISOString(),
            };
            setItems(
                items.map((item) =>
                    item.id === itemId ? { ...item, comments: [normalizedComment, ...item.comments] } : item
                )
            );
            setCommentInputs({ ...commentInputs, [itemId]: "" });
            setToast({ message: "Comment sent!", type: "success" });
        } catch {
            setToast({ message: "Failed to send comment.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Toast component
    function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
        const colors = {
            success: "#22c55e",
            error: "#ef4444",
            info: "#38bdf8"
        };
        useEffect(() => {
            const timer = setTimeout(onClose, 2500);
            return () => clearTimeout(timer);
        }, [onClose]);
        return (
            <div style={{
                position: "fixed",
                top: 32,
                left: "50%",
                transform: "translateX(-50%)",
                background: colors[type],
                color: "#fff",
                padding: "1rem 2rem",
                borderRadius: "1rem",
                fontWeight: 600,
                fontSize: "1.1rem",
                zIndex: 1000,
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                animation: "toastFadeIn 0.4s"
            }}>
                {message}
                <style>{`
          @keyframes toastFadeIn {
            0% { opacity: 0; transform: translateY(-20px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        `}</style>
            </div>
        );
    }

    // Profile image logic
    const getProfileImage = (name: string) => {
        if (name.toLowerCase() === "reuben") return "/gitau.png";
        if (name.toLowerCase() === "peter") return "/peter.png";
        if (name.toLowerCase() === "john") return "/john.png";
        if (name.toLowerCase() === "wilfred") return "/wilfred.jpeg";
        return "/default.png"; // fallback image
    };

    if (!hydrated) return null;
    if (!user) return null;

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                background: "linear-gradient(135deg, #2d1068 0%, #1e1b4b 100%)",
                padding: "2rem 0",
                opacity: cardVisible ? 1 : 0,
                transform: cardVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)",
                overflowY: "auto",
                display: "flex",                // Add flex
                flexDirection: "column",        // Stack vertically
                alignItems: "center",           // Center horizontally
            }}
        >
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Top Bar */}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 2rem",
                marginBottom: "1rem",
                width: "900px",                 // Centered width
                maxWidth: "100%",
            }}>

                <Button
                    onClick={handleLogout}
                    style={{
                        background: "linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)",
                        color: "#fff",
                        borderRadius: "0.5rem",
                        border: "none",
                        padding: "0.5rem 1rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                    }}
                >
                    <LogOut size={18} />
                    Logout
                </Button>
            </div>

            {/* Profile Image and Name */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "1.5rem"
            }}>
                <img
                    src={getProfileImage(user.name)}
                    alt={user.name}
                    style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "4px solid #818cf8",
                        boxShadow: "0 2px 12px rgba(59,130,246,0.15)",
                        background: "#1e1b4b"
                    }}
                />
                <span style={{
                    marginTop: 10,
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    color: "#fbbf24",
                    textAlign: "center",
                    letterSpacing: "0.5px"
                }}>
                    {user.name}
                </span>
            </div>

            {/* Heading */}
            <h1 style={{
                fontSize: "2.6rem",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: "2rem",
                background: "linear-gradient(90deg, #fbbf24 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
                textShadow: "0 2px 12px #0ea5e9",
                width: "900px",                 // Centered width
                maxWidth: "100%",
            }}>
                <Users size={40} style={{ verticalAlign: "middle", marginRight: 12 }} />
                Collaborate and manage our expenses together
            </h1>

            {/* Widgets */}
            <div
                style={{
                    display: "flex",
                    gap: 24,
                    width: "100%",                // Make container full width
                    maxWidth: 900,                // Limit max width for large screens
                    marginBottom: 32,
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        flex: "1 1 220px",          // Allow to grow and shrink, min width 220px
                        minWidth: 220,
                        maxWidth: 400,              // Optional: limit max width per widget
                        background: "linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)",
                        borderRadius: "1.2rem",
                        boxShadow: "0 2px 12px rgba(59,130,246,0.10)",
                        padding: "1.5rem",
                        color: "#fff",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "1.2rem",
                        justifyContent: "space-between",
                        width: "100%",              // Responsive width
                    }}
                >
                    <span>TOTAL ITEMS</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {items.length}
                        <Plus size={24} />
                    </span>
                </div>
                <div
                    style={{
                        flex: "1 1 220px",
                        minWidth: 220,
                        maxWidth: 400,
                        background: "linear-gradient(90deg, #22c55e 0%, #38bdf8 100%)",
                        borderRadius: "1.2rem",
                        boxShadow: "0 2px 12px rgba(34,197,94,0.10)",
                        padding: "1.5rem",
                        color: "#fff",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "1.2rem",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <span>TOTAL AMOUNT</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        Ksh {totalCost}
                        <DollarSign size={24} />
                    </span>
                </div>
            </div>

            {/* List */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "900px",                 // Centered width
                gap: 24,
                maxWidth: "100%",
            }}>
                {items.map((item) => (
                    <div key={item.id} style={{
                        padding: "1.5rem",
                        borderRadius: "1.2rem",
                        background: "transparent",
                        backgroundColor: "rgba(49,46,129,0.45)",
                        boxShadow: "0 2px 12px rgba(59,130,246,0.10)",
                        color: "#f1f5f9",
                        transition: "box-shadow 0.2s",
                        position: "relative"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 2, color: "#fbbf24" }}>{item.name}</p>
                                <p style={{ fontSize: "1rem", marginBottom: 2 }}>
                                    <span style={{ color: "#bae6fd" }}>Ksh {item.cost}</span> &mdash; <span style={{ color: "#fbbf24" }}>{item.author.name}</span> <span style={{ color: "#818cf8" }}>({new Date(item.createdAt).toLocaleDateString()})</span>
                                </p>
                                <p style={{ fontSize: "0.98rem", fontStyle: "italic", color: "#bae6fd" }}>{item.comment}</p>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button style={{
                                    background: "linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)",
                                    color: "#fbbf24",
                                    borderRadius: "0.5rem",
                                    border: "none",
                                    padding: "0.4rem 0.7rem",
                                    fontWeight: 700,
                                    cursor: "pointer"
                                }} onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditingItem(item);
                                }}>
                                    <Pencil size={16} />
                                </Button>
                                <Button style={{
                                    background: "linear-gradient(90deg, #ef4444 0%, #fbbf24 100%)",
                                    color: "#fff",
                                    borderRadius: "0.5rem",
                                    border: "none",
                                    padding: "0.4rem 0.7rem",
                                    fontWeight: 700,
                                    cursor: "pointer"
                                }} onClick={() => setDeletingItemId(item.id)}>
                                    <Trash size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Comments */}
                        <div style={{ marginTop: 18 }}>
                            <h4 style={{
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                color: "#fbbf24",
                                letterSpacing: "-0.5px"
                            }}>
                                <MessageCircle size={18} style={{ marginRight: 6 }} /> Comments
                            </h4>
                            {item.comments.map((c) => (
                                <div key={c.id} style={{
                                    fontSize: "0.98rem",
                                    marginLeft: 12,
                                    marginBottom: 6,
                                    background: "rgba(49,46,129,0.35)",
                                    borderRadius: "0.5rem",
                                    padding: "0.5rem 0.8rem",
                                    color: "#f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8
                                }}>
                                    <span style={{ fontWeight: 700, color: "#fbbf24" }}>{c.author.name}</span>
                                    <span style={{ color: "#bae6fd" }}>{c.message}</span>
                                    <span style={{ fontSize: "0.85rem", color: "#818cf8", marginLeft: "auto" }}>
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <Input
                                    placeholder="Write comment..."
                                    value={commentInputs[item.id] || ""}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [item.id]: e.target.value })}
                                    style={{
                                        flex: 1,
                                        background: "rgba(49,46,129,0.45)",
                                        border: "none",
                                        color: "#f1f5f9",
                                        borderRadius: "0.5rem",
                                        padding: "0.5rem 1rem"
                                    }}
                                    disabled={loading}
                                />
                                <Button style={{
                                    background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)",
                                    color: "#fbbf24",
                                    borderRadius: "0.5rem",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                }} onClick={() => handleAddComment(item.id)} disabled={loading}>
                                    {loading ? <Spinner /> : <Send size={16} />}
                                    {loading ? "Sending..." : "Send"}
                                </Button>
                            </div>
                        </div>

                        {/* Inline Edit Modal */}
                        {editingItemId === item.id && (
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                margin: "auto",
                                background: "linear-gradient(135deg, #312e81 0%, #0ea5e9 100%)",
                                borderRadius: "1.2rem",
                                padding: "2rem 1.5rem",
                                color: "#f1f5f9",
                                boxShadow: "0 2px 24px rgba(49,46,129,0.25)",
                                minWidth: 320,
                                maxWidth: 400,
                                zIndex: 10,
                                animation: "modalFadeIn 0.5s"
                            }}>
                                <h3 style={{
                                    fontWeight: 800,
                                    fontSize: "1.3rem",
                                    marginBottom: 18,
                                    color: "#fbbf24",
                                    textAlign: "center"
                                }}>Edit Item</h3>
                                <Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ marginBottom: 12, background: "rgba(49,46,129,0.45)", color: "#f1f5f9", border: "none", borderRadius: "0.5rem", padding: "0.7rem 1rem" }} />
                                <Input type="number" value={editingItem.cost.toString()} onChange={(e) => setEditingItem({ ...editingItem, cost: parseFloat(e.target.value) })} style={{ marginBottom: 12, background: "rgba(49,46,129,0.45)", color: "#f1f5f9", border: "none", borderRadius: "0.5rem", padding: "0.7rem 1rem" }} />
                                <Textarea value={editingItem.comment} onChange={(e) => setEditingItem({ ...editingItem, comment: e.target.value })} style={{ marginBottom: 12, background: "rgba(49,46,129,0.45)", color: "#f1f5f9", border: "none", borderRadius: "0.5rem", padding: "0.7rem 1rem" }} />
                                <div style={{ display: "flex", gap: 12 }}>
                                    <Button style={{
                                        width: "100%",
                                        background: "linear-gradient(90deg, #fbbf24 0%, #38bdf8 100%)",
                                        color: "#312e81",
                                        borderRadius: "0.5rem",
                                        fontWeight: 700,
                                        border: "none",
                                        padding: "0.9rem",
                                        marginTop: 8,
                                        cursor: "pointer"
                                    }} onClick={handleEdit} disabled={loading}>
                                        {loading ? <Spinner /> : "Update"}
                                    </Button>
                                    <Button style={{
                                        width: "100%",
                                        background: "linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)",
                                        color: "#fbbf24",
                                        borderRadius: "0.5rem",
                                        fontWeight: 700,
                                        border: "none",
                                        padding: "0.9rem",
                                        marginTop: 8,
                                        cursor: "pointer"
                                    }} onClick={() => { setEditingItemId(null); setEditingItem(null); }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Inline Delete Modal */}
                        {deletingItemId === item.id && (
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                margin: "auto",
                                background: "linear-gradient(135deg, #312e81 0%, #ef4444 100%)",
                                borderRadius: "1.2rem",
                                padding: "2rem 1.5rem",
                                color: "#f1f5f9",
                                boxShadow: "0 2px 24px rgba(49,46,129,0.25)",
                                minWidth: 320,
                                maxWidth: 400,
                                zIndex: 10,
                                animation: "modalFadeIn 0.5s"
                            }}>
                                <h3 style={{
                                    color: "#fbbf24",
                                    fontWeight: 800,
                                    fontSize: "1.3rem",
                                    textAlign: "center",
                                    marginBottom: 18
                                }}>Are you absolutely sure?</h3>
                                <p style={{ color: "#bae6fd", marginBottom: 16, textAlign: "center" }}>
                                    This will permanently delete this item. This action cannot be undone.
                                </p>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <Button style={{
                                        background: "linear-gradient(90deg, #ef4444 0%, #fbbf24 100%)",
                                        color: "#fff",
                                        borderRadius: "0.5rem",
                                        border: "none",
                                        padding: "0.8rem 1.2rem",
                                        fontWeight: 700,
                                        cursor: "pointer"
                                    }} onClick={() => handleDelete(item.id)} disabled={loading}>
                                        {loading ? <Spinner /> : "Yes, delete"}
                                    </Button>
                                    <Button style={{
                                        background: "linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)",
                                        color: "#fbbf24",
                                        borderRadius: "0.5rem",
                                        fontWeight: 700,
                                        border: "none",
                                        padding: "0.8rem 1.2rem",
                                        marginTop: 8,
                                        cursor: "pointer"
                                    }} onClick={() => setDeletingItemId(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Item Modal (fixed button and modal at bottom right) */}
            <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 100 }}>
                <Button style={{
                    borderRadius: "50%",
                    width: 56,
                    height: 56,
                    fontSize: "2rem",
                    background: "linear-gradient(135deg, #fbbf24 0%, #38bdf8 100%)",
                    color: "#312e81",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.15)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }} onClick={() => setEditingItemId(-1)}>
                    <Plus size={32} />
                </Button>
                {editingItemId === -1 && (
                    <div style={{
                        position: "absolute",
                        bottom: 70,
                        right: 0,
                        background: "linear-gradient(135deg, #312e81 0%, #0ea5e9 100%)",
                        borderRadius: "1.2rem",
                        padding: "2rem 1.5rem",
                        color: "#f1f5f9",
                        boxShadow: "0 2px 24px rgba(49,46,129,0.25)",
                        minWidth: 320,
                        maxWidth: 400,
                        margin: "0 auto",
                        animation: "modalFadeIn 0.5s"
                    }}>
                        <h3 style={{
                            fontWeight: 800,
                            fontSize: "1.3rem",
                            marginBottom: 18,
                            color: "#fbbf24",
                            textAlign: "center"
                        }}>Add Budget Item</h3>
                        <Input
                            placeholder="Name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            style={{
                                marginBottom: 12,
                                background: "rgba(49,46,129,0.45)",
                                color: "#000", // text color
                                border: "none",
                                marginRight: 6,
                                borderRadius: "0.5rem",
                                padding: "0.7rem 1rem",
                                // placeholder color is set via global CSS below
                            }}
                        />
                        <Input
                            type="number"
                            placeholder="Cost"
                            value={newItem.cost}
                            onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                            style={{
                                marginBottom: 12,
                                background: "rgba(49,46,129,0.45)",
                                color: "#000",
                                border: "none",
                                borderRadius: "0.5rem",
                                padding: "0.7rem 1rem",
                                // placeholder color is set via global CSS below
                            }}
                        />
                        <Textarea
                            placeholder="Comment"
                            value={newItem.comment}
                            onChange={(e) => setNewItem({ ...newItem, comment: e.target.value })}
                            style={{
                                marginBottom: 12,
                                background: "rgba(49,46,129,0.45)",
                                color: "#000",
                                border: "none",
                                borderRadius: "0.5rem",
                                padding: "0.7rem 1rem",
                            }}
                        />
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button style={{
                                width: "100%",
                                background: "linear-gradient(90deg, #fbbf24 0%, #38bdf8 100%)",
                                color: "#312e81",
                                borderRadius: "0.5rem",
                                fontWeight: 700,
                                border: "none",
                                padding: "0.9rem",
                                marginTop: 8,
                                cursor: "pointer"
                            }} onClick={handleAdd} disabled={loading}>
                                {loading ? <Spinner /> : "Save"}
                            </Button>
                            <Button style={{
                                width: "100%",
                                background: "linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)",
                                color: "#fbbf24",
                                borderRadius: "0.5rem",
                                fontWeight: 700,
                                border: "none",
                                padding: "0.9rem",
                                marginTop: 8,
                                cursor: "pointer"
                            }} onClick={() => setEditingItemId(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <style>
                {`
          input::placeholder, textarea::placeholder {
            color: #000 !important;
            opacity: 1;
          }
        `}
            </style>
        </div>
    );
}