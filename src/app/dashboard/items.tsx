"use client";

import React, { useEffect, useState } from "react";
import { PieChart, DollarSign } from "lucide-react";
import { useUser } from "@/app/UserContext";
import { useRouter } from "next/navigation";
import { getItems } from "../../../actions/items";
import { getNestedCommentsByItem } from "../../../actions/comments";
import { ItemCard } from "./components/ItemCard";
import { AddItemModal } from "./components/AddItemModal";
import { TransactionUpload } from "./components/TransactionUpload";
import { ReminderSettings } from "./components/ReminderSettings";
import { Toast } from "../components/ui/shared/SharedComponents";
import { useItemHandlers } from "./hooks/useItemHandlers";
import { useCommentHandlers } from "./hooks/useCommentHandlers";
import { getProfileImage } from "./utils/profileUtils";


type Author = { name: string; id: number };
type Comment = { id: number; authorId: number; author: Author; message: string; itemId: number; createdAt: string };
type Item = { id: number; name: string; cost: number; comment: string; author: Author; createdAt: string; comments: Comment[] };

export default function DashboardPage() {
    const userContext = useUser();
    const user = userContext?.user;
    const hydrated = userContext?.hydrated;
    const router = useRouter();

    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState({ name: "", cost: "", comment: "" });
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(false);
    const [cardVisible, setCardVisible] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    useEffect(() => {
        if (hydrated && !user) router.replace("/login");
    }, [hydrated, user, router]);

    useEffect(() => {
        setTimeout(() => setCardVisible(true), 100);
        (async () => {
            const data = await getItems();
            const normalized = await Promise.all(
                data.map(async (item: any) => ({
                    ...item,
                    comment: item.comment ?? "",
                    createdAt: typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString(),
                    comments: await getNestedCommentsByItem(item.id),
                }))
            );
            setItems(normalized);
        })();
    }, []);

    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

    const showToast = (message: string, type: "success" | "error" | "info") => setToast({ message, type });

    const { handleAddItem, handleEditItem, handleDeleteItem } = useItemHandlers(showToast, setLoading);
    const commentHandlers = useCommentHandlers(showToast, setLoading);

    const handleAdd = async () => {
        if (!user) return;
        await handleAddItem(newItem, user.id, (normalized) => {
            setItems([normalized, ...items]);
            setNewItem({ name: "", cost: "", comment: "" });
            setEditingItemId(null);
        });
    };

    const handleEdit = async () => {
        if (!editingItem || !user) return;
        await handleEditItem(editingItem, user.id, (normalized) => {
            setItems(items.map((i) => (i.id === normalized.id ? normalized : i)));
            setEditingItemId(null);
            setEditingItem(null);
        });
    };

    const handleDelete = async (id: number) => {
        await handleDeleteItem(id, () => setItems(items.filter((i) => i.id !== id)));
    };

    const handleAddComment = async (itemId: number) => {
        const message = commentInputs[itemId];
        if (!message || !user) return;
        setLoading(true);
        try {
            const { addComment } = await import("../../../actions/items");
            const comment = await addComment(itemId, user.name, message);
            const normalizedComment = { ...comment, createdAt: typeof comment.createdAt === "string" ? comment.createdAt : comment.createdAt.toISOString() };
            setItems(items.map((item) => (item.id === itemId ? { ...item, comments: [normalizedComment, ...item.comments] } : item)));
            setCommentInputs({ ...commentInputs, [itemId]: "" });
            showToast("Comment sent!", "success");
        } catch {
            showToast("Failed to send comment.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!hydrated || !user) return null;

    return (
        <div className={`min-h-screen w-full bg-primary-dark text-white-off transition-all duration-700 px-4 md:px-8 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="w-full">
                <div className="flex flex-col items-center mb-6">
                    <img src={getProfileImage(user.name)} alt={user.name} className="w-20 h-20 rounded-full ring-4 ring-primary-magenta mb-2 object-cover" />
                    <span className="text-xl font-bold text-yellow-bright">{user.name}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6"><PieChart size={40} className="inline-block align-middle mr-3" /> Manage your personal budget and track spendings</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-primary-magenta text-white shadow-sm flex items-center justify-between">
                        <div>TOTAL ITEMS</div>
                        <div className="text-2xl font-bold">{items.length}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-primary-med text-white shadow-sm flex items-center justify-between">
                        <div>TOTAL AMOUNT</div>
                        <div className="text-2xl font-bold">Ksh {totalCost} <DollarSign size={24} className="inline-block ml-2" /></div>
                    </div>
                </div>

                {user && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <TransactionUpload userId={user.id} />
                        <ReminderSettings userId={user.id} />
                    </div>
                )}

                <div className="list-container">
                {items.map((item) => (
                    <ItemCard
                        key={item.id}
                        item={editingItemId === item.id ? editingItem : item}
                        isEditing={editingItemId === item.id}
                        isDeleting={deletingItemId === item.id}
                        commentInput={commentInputs[item.id] || ""}
                        loading={loading}
                        currentUserId={user.id}
                        onEdit={() => { setEditingItemId(item.id); setEditingItem(item); }}
                        onDelete={() => setDeletingItemId(item.id)}
                        onEditChange={(field, value) => setEditingItem({ ...editingItem, [field]: value })}
                        onEditSave={handleEdit}
                        onEditCancel={() => { setEditingItemId(null); setEditingItem(null); }}
                        onDeleteConfirm={() => handleDelete(item.id)}
                        onCommentChange={(value) => setCommentInputs({ ...commentInputs, [item.id]: value })}
                        onCommentSubmit={() => handleAddComment(item.id)}
                        onCommentCardHandlers={{
                            onEdit: (commentId: string, message: string) => commentHandlers.handleEditComment(Number(commentId), message),
                            onDelete: (commentId: string) => commentHandlers.handleDeleteComment(Number(commentId)),
                            onReact: (commentId: string, emoji: string) => commentHandlers.handleReactComment(Number(commentId), user.id, emoji),
                            onFlag: (commentId: string, reason: string) => commentHandlers.handleFlagComment(Number(commentId), user.id, reason),
                            onReply: () => {},
                            onRemoveReaction: (commentId: string) => commentHandlers.handleRemoveReaction(Number(commentId), user.id),
                            onRemoveFlag: (commentId: string) => commentHandlers.handleRemoveFlag(Number(commentId), user.id),
                        }}
                        CommentCard={undefined}
                    />
                ))}
            </div>

            <AddItemModal isOpen={editingItemId === -1} newItem={newItem} loading={loading} onNameChange={(value) => setNewItem({ ...newItem, name: value })} onCostChange={(value) => setNewItem({ ...newItem, cost: value })} onCommentChange={(value) => setNewItem({ ...newItem, comment: value })} onSave={handleAdd} onCancel={() => setEditingItemId(null)} />
            </div>
        </div>
    );
}

