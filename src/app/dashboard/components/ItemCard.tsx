import { Trash, Pencil, MessageCircle, Send } from "lucide-react";
import { Button, Input, Textarea } from "../../components/ui";
import { Spinner } from "../../components/ui/shared/SharedComponents";

interface ItemCardProps {
  item: any;
  isEditing: boolean;
  isDeleting: boolean;
  commentInput: string;
  loading: boolean;
  currentUserId: number;
  onEdit: () => void;
  onDelete: () => void;
  onEditChange: (name: string, value: any) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDeleteConfirm: () => void;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
  onCommentCardHandlers: any;
  CommentCard: any;
}

export function ItemCard({
  item,
  isEditing,
  isDeleting,
  commentInput,
  loading,
  currentUserId,
  onEdit,
  onDelete,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDeleteConfirm,
  onCommentChange,
  onCommentSubmit,
  onCommentCardHandlers,
  CommentCard,
}: ItemCardProps) {
  return (
    <div className="p-4 rounded-xl bg-primary-med shadow-sm mb-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-lg">{item.name}</p>
          <p className="text-sm text-white-off">
            <span className="font-semibold">KES {item.cost}</span> &mdash; <span className="text-yellow-bright">{item.author.name}</span>
            <span className="text-white-off opacity-70 ml-2">({new Date(item.createdAt).toLocaleDateString()})</span>
          </p>
          {item.comment && <p className="text-sm text-white-off opacity-70 mt-2">{item.comment}</p>}
        </div>
        <div className="flex gap-2">
          <Button className="inline-flex items-center px-3 py-1 rounded bg-indigo-600 text-white" onClick={onEdit}>
            <Pencil size={16} />
          </Button>
          <Button className="inline-flex items-center px-3 py-1 rounded bg-red-500 text-white" onClick={onDelete}>
            <Trash size={16} />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-white-off flex items-center gap-2 mb-2"><MessageCircle size={18} /> Comments</h4>
        {item.comments.map((c: any) => (
          <CommentCard
            key={c.id}
            comment={{
              ...c,
              id: c.id.toString(),
              authorId: c.authorId.toString(),
              createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
            }}
            currentUserId={currentUserId.toString()}
            {...onCommentCardHandlers}
          />
        ))}
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Write comment..."
            value={commentInput}
            onChange={(e) => onCommentChange(e.target.value)}
            className="flex-1 rounded-md bg-primary-blue text-white-off"
            disabled={loading}
          />
          <Button
            className="inline-flex items-center px-3 py-2 rounded bg-emerald-500 text-white"
            onClick={onCommentSubmit}
            disabled={loading}
          >
            {loading ? <Spinner /> : <Send size={16} />}
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Item</h3>
            <Input
              value={item.name}
              onChange={(e) => onEditChange("name", e.target.value)}
              className="mb-3"
            />
            <Input
              type="number"
              value={item.cost.toString()}
              onChange={(e) => onEditChange("cost", parseFloat(e.target.value))}
              className="mb-3"
            />
            <Textarea
              value={item.comment}
              onChange={(e) => onEditChange("comment", e.target.value)}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button className="flex-1 bg-primary-magenta text-white" onClick={onEditSave} disabled={loading}>
                {loading ? <Spinner /> : "Update"}
              </Button>
              <Button className="flex-1" onClick={onEditCancel}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-3">Are you absolutely sure?</h3>
            <p className="text-slate-300 mb-4">This will permanently delete this item. This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button className="flex-1 bg-red-500 text-white" onClick={onDeleteConfirm} disabled={loading}>
                {loading ? <Spinner /> : "Yes, delete"}
              </Button>
              <Button className="flex-1" onClick={() => {}}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
