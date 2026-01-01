import { Plus } from "lucide-react";
import { Button, Input, Textarea } from "../../components/ui";
import { Spinner } from "../../components/ui/shared/SharedComponents";

interface AddItemModalProps {
  isOpen: boolean;
  newItem: { name: string; cost: string; comment: string };
  loading: boolean;
  onNameChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AddItemModal({
  isOpen,
  newItem,
  loading,
  onNameChange,
  onCostChange,
  onCommentChange,
  onSave,
  onCancel,
}: AddItemModalProps) {
  return (
    <div className="fab-container">
      <Button className="fab-btn" onClick={() => {}}>
        <Plus size={32} />
      </Button>
      {isOpen && (
        <div className="add-modal">
          <h3 className="modal-title">Add Budget Item</h3>
          <Input
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="add-modal-input"
          />
          <Input
            type="number"
            placeholder="Cost"
            value={newItem.cost}
            onChange={(e) => onCostChange(e.target.value)}
            className="add-modal-input"
          />
          <Textarea
            placeholder="Comment"
            value={newItem.comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="add-modal-textarea"
          />
          <div className="modal-actions">
            <Button className="modal-primary-btn" onClick={onSave} disabled={loading}>
              {loading ? <Spinner /> : "Save"}
            </Button>
            <Button className="modal-secondary-btn" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
