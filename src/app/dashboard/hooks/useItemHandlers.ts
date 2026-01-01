import { useCallback } from "react";
import { addItem, editItem, deleteItem } from "../../../../actions/items";

export function useItemHandlers(
  onToast: (msg: string, type: "success" | "error") => void,
  onLoadingChange: (loading: boolean) => void
) {
  const handleAddItem = useCallback(
    async (itemData: any, userId: number, onSuccess: (item: any) => void) => {
      onLoadingChange(true);
      try {
        const newData = await addItem({
          ...itemData,
          cost: parseFloat(itemData.cost),
          authorId: userId,
        });
        const normalized = await normalizeItem(newData);
        onSuccess(normalized);
        onToast("Item added!", "success");
      } catch {
        onToast("Failed to add item.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleEditItem = useCallback(
    async (editingItem: any, userId: number, onSuccess: (item: any) => void) => {
      onLoadingChange(true);
      try {
        const updated = await editItem({ ...editingItem, authorId: userId });
        const normalized = await normalizeItem(updated);
        onSuccess(normalized);
        onToast("Item updated!", "success");
      } catch {
        onToast("Failed to update item.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleDeleteItem = useCallback(
    async (id: number, onSuccess: () => void) => {
      onLoadingChange(true);
      try {
        await deleteItem(id);
        onSuccess();
        onToast("Item deleted!", "success");
      } catch {
        onToast("Failed to delete item.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  return { handleAddItem, handleEditItem, handleDeleteItem };
}

async function normalizeItem(item: any) {
  return {
    ...item,
    comment: item.comment ?? "",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString(),
    comments: item.comments
      ? item.comments.map((c: any) => ({
          ...c,
          createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString(),
        }))
      : [],
  };
}
