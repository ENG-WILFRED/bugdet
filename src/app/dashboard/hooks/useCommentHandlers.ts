import { useCallback } from "react";
import {
  addComment as addCommentAction,
  editComment as editCommentAction,
  deleteComment as deleteCommentAction,
  addReaction,
  removeReaction,
  flagComment,
  removeFlag,
} from "../../../../actions/comments";

export function useCommentHandlers(
  onToast: (msg: string, type: "success" | "error" | "info") => void,
  onLoadingChange: (loading: boolean) => void
) {
  const handleAddComment = useCallback(
    async (itemId: number, userName: string, message: string, onSuccess: (comment: any) => void) => {
      if (!message || !userName) return;
      onLoadingChange(true);
      try {
        const comment = await addCommentAction({
          itemId,
          authorId: 0,
          message,
        });
        onSuccess(comment);
        onToast("Comment sent!", "success");
      } catch {
        onToast("Failed to send comment.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleEditComment = useCallback(
    async (commentId: number, message: string) => {
      onLoadingChange(true);
      try {
        await editCommentAction({ commentId, message });
        onToast("Comment updated!", "success");
      } catch {
        onToast("Failed to update comment.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      onLoadingChange(true);
      try {
        await deleteCommentAction(commentId);
        onToast("Comment deleted!", "success");
      } catch {
        onToast("Failed to delete comment.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleReactComment = useCallback(
    async (commentId: number, userId: number, emoji: string) => {
      onLoadingChange(true);
      try {
        await addReaction({ commentId, userId, emoji });
        onToast("Reacted!", "success");
      } catch {
        onToast("Failed to react.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleRemoveReaction = useCallback(
    async (commentId: number, userId: number) => {
      onLoadingChange(true);
      try {
        await removeReaction({ commentId, userId, emoji: "👍" });
        onToast("Reaction removed!", "success");
      } catch {
        onToast("Failed to remove reaction.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleFlagComment = useCallback(
    async (commentId: number, userId: number, reason: string) => {
      onLoadingChange(true);
      try {
        await flagComment({ commentId, userId, reason });
        onToast("Comment flagged!", "success");
      } catch {
        onToast("Failed to flag comment.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  const handleRemoveFlag = useCallback(
    async (commentId: number, userId: number) => {
      onLoadingChange(true);
      try {
        await removeFlag({ commentId, userId });
        onToast("Flag removed!", "success");
      } catch {
        onToast("Failed to remove flag.", "error");
      } finally {
        onLoadingChange(false);
      }
    },
    [onToast, onLoadingChange]
  );

  return {
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    handleReactComment,
    handleRemoveReaction,
    handleFlagComment,
    handleRemoveFlag,
  };
}
