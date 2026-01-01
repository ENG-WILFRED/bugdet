import { useEffect, useState } from "react";
import { Pencil, Trash, Flag, Smile, Send, CornerDownRight, Loader2 } from "lucide-react";
import { Input, Button, Textarea } from "../../components/ui";
import { getNestedCommentsByItem } from "../../../../actions/comments";

type Reaction = {
  userId: string;
  type: string; // emoji
};

type Flag = {
  userId: string;
  reason: string;
};

export type Comment = {
  id: string;
  message: string;
  author: { name: string };
  authorId: string;
  createdAt: string;
  editedAt?: string;
  reactions?: Reaction[];
  flags?: Flag[];
  replies?: Comment[];
  parentId?: string | null;
};

type CommentCardProps = {
  comment: Comment;
  currentUserId: string;
  onEdit: (id: string, message: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onFlag: (id: string, reason: string) => void;
  onReply: (id: string, message: string) => void;
  onRemoveReaction: (id: string, emoji: string) => void;
  onRemoveFlag: (id: string) => void;
  depth?: number; // for indentation
};

export default function CommentCard({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
  onFlag,
  onReply,
  onRemoveReaction,
  onRemoveFlag,
  depth = 0,
}: CommentCardProps) {
  const [editing, setEditing] = useState(false);
  const [editMsg, setEditMsg] = useState(comment.message);
  const [replying, setReplying] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");
  const [flagged, setFlagged] = useState(
    comment.flags?.some((f) => f.userId === currentUserId)
  );
  const [flagLoading, setFlagLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  // Group reactions by emoji
  const reactionMap = comment.reactions
    ? comment.reactions.reduce<Record<string, { count: number; reacted: boolean }>>((acc, r) => {
        if (!acc[r.type]) acc[r.type] = { count: 0, reacted: false };
        acc[r.type].count += 1;
        if (r.userId === currentUserId) acc[r.type].reacted = true;
        return acc;
      }, {})
    : {};
    useEffect(()=>{

      getNestedCommentsByItem(8)
    },[])
  
  const bgGradient = depth === 0 
    ? "bg-gradient-to-r from-yellow-400 to-indigo-400" 
    : "bg-gradient-to-r from-slate-100 to-sky-100";
  const marginLeftClass = depth === 0 ? "ml-0" : `ml-${Math.min(depth * 6, 24)}`;

  return (
    <div
      className={`${bgGradient} rounded-lg shadow-md px-5 py-4 mb-5 transition-shadow duration-200 hover:shadow-lg ${marginLeftClass}`}
    >
      <div className="flex justify-between items-center font-bold mb-1">
        <span className="text-indigo-900">{comment.author.name}</span>
        <span className="text-slate-500 text-sm">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
      {editing ? (
        <div className="flex gap-2 mb-3">
          <Textarea
            value={editMsg}
            onChange={(e) => setEditMsg(e.target.value)}
            className="flex-1 rounded-lg border border-indigo-500 px-4 py-2 bg-slate-100 text-slate-900"
          />
          <Button
            className="bg-primary-magenta text-white font-bold px-4 py-2 rounded-lg"
            onClick={() => {
              onEdit(comment.id, editMsg);
              setEditing(false);
            }}
          >
            Save
          </Button>
          <Button
            className="bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-lg"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mb-2">
          <span className="text-slate-900 text-base">{comment.message}</span>
          {comment.editedAt && (
            <span className="text-indigo-500 text-xs ml-2">(edited)</span>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <Button
          className="bg-none border-none text-indigo-900 cursor-pointer rounded-sm px-1 py-1 transition-colors duration-150 flex items-center gap-1 font-semibold hover:bg-indigo-500/10"
          onClick={() => setReplying((v) => !v)}
          title="Reply"
        >
          <CornerDownRight size={16} />
        </Button>
        {Object.entries(reactionMap).map(([emoji, data]) => (
          <Button
            key={emoji}
            className={`bg-none border-none cursor-pointer rounded-sm px-1 py-1 transition-colors duration-150 flex items-center gap-1 font-semibold hover:bg-indigo-500/10 ${data.reacted ? "text-emerald-500" : "text-indigo-900"}`}
            onClick={() =>
              data.reacted
                ? onRemoveReaction(comment.id, emoji)
                : onReact(comment.id, emoji)
            }
            title={data.reacted ? "Remove reaction" : "React"}
          >
            <span>{emoji}</span>
            <span>{data.count}</span>
          </Button>
        ))}
        <Button
          className="bg-none border-none text-indigo-900 cursor-pointer rounded-sm px-1 py-1 transition-colors duration-150 flex items-center gap-1 font-semibold hover:bg-indigo-500/10"
          onClick={() => onReact(comment.id, "👍")}
          title="React"
        >
          <Smile size={16} />
        </Button>
        <Button
          className={`bg-none border-none cursor-pointer rounded-sm px-1 py-1 transition-colors duration-150 flex items-center gap-1 font-semibold hover:bg-indigo-500/10 ${flagged ? "text-red-500" : "text-indigo-900"}`}
          onClick={async () => {
            setFlagLoading(true);
            if (flagged) {
              await onRemoveFlag(comment.id);
              setFlagged(false);
            } else {
              await onFlag(comment.id, "Inappropriate");
              setFlagged(true);
            }
            setFlagLoading(false);
          }}
          title={flagged ? "Remove flag" : "Flag"}
          disabled={flagLoading}
        >
          {flagLoading ? <Loader2 className="animate-spin" size={16} /> : <Flag size={16} />}
        </Button>
        {comment.authorId === currentUserId && (
          <>
            <Button
              className="bg-none border-none text-indigo-900 cursor-pointer rounded-sm px-1 py-1 transition-colors duration-150 flex items-center gap-1 font-semibold hover:bg-indigo-500/10"
              onClick={() => setEditing(true)}
              title="Edit"
            >
              <Pencil size={16} />
            </Button>
            <Button
              className="bg-none border-none text-indigo-900 cursor-pointer rounded-sm px-1 py-1 transition-colors duration-150 flex items-center gap-1 font-semibold hover:bg-indigo-500/10"
              onClick={() => onDelete(comment.id)}
              title="Delete"
            >
              <Trash size={16} />
            </Button>
          </>
        )}
      </div>

      {replying && (
        <div className="flex gap-2 mb-3 pl-4 border-l-2 border-indigo-500 bg-white/8 rounded">
          <Input
            value={replyMsg}
            onChange={(e) => setReplyMsg(e.target.value)}
            className="flex-1 rounded-lg border border-indigo-500 px-4 py-2 bg-slate-100 text-slate-900"
            placeholder="Write a reply..."
            disabled={replyLoading}
          />
          <Button
            className="bg-primary-magenta text-white font-bold px-4 py-2 rounded-lg"
            onClick={async () => {
              if (!replyMsg.trim()) return;
              setReplyLoading(true);
              await onReply(comment.id, replyMsg);
              setReplyMsg("");
              setReplyLoading(false);
              setReplying(false);
            }}
            disabled={replyLoading}
          >
            {replyLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </Button>
        </div>
      )}

      {/* Render replies recursively inside this card */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
              onFlag={onFlag}
              onReply={onReply}
              onRemoveReaction={onRemoveReaction}
              onRemoveFlag={onRemoveFlag}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}