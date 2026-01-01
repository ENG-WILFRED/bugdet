import { WebSocket } from "ws";
import {
  addComment,
  editComment,
  deleteComment,
  addReaction,
  removeReaction,
  flagComment,
  removeFlag
} from "../../comments";

// Handle a single incoming message
export async function handleCommentEvent(ws: WebSocket, message: string) {
  try {
    const { event, data } = JSON.parse(message);

    switch (event) {
      case "comment:add": {
        const { itemId, authorId, message, parentId, mentionUserIds } = data;
        await addComment({ itemId, authorId, message, parentId, mentionUserIds });
        break;
      }
      case "comment:edit": {
        const { commentId, message } = data;
        await editComment({ commentId, message });
        break;
      }
      case "comment:delete": {
        const { commentId } = data;
        await deleteComment(commentId);
        break;
      }
      case "comment:react": {
        const { commentId, userId, emoji } = data;
        await addReaction({ commentId, userId, emoji });
        break;
      }
      case "comment:unreact": {
        const { commentId, userId, emoji } = data;
        await removeReaction({ commentId, userId, emoji });
        break;
      }
      case "comment:flag": {
        const { commentId, userId, reason } = data;
        await flagComment({ commentId, userId, reason });
        break;
      }
      case "comment:unflag": {
        const { commentId, userId } = data;
        await removeFlag({ commentId, userId });
        break;
      }
      default: {
        console.warn("Unknown comment event:", event);
      }
    }
  } catch (error) {
    console.error("Failed to handle comment event:", error);
    ws.send(JSON.stringify({ event: "error", data: { message: "Invalid message" } }));
  }
}
