import { Modal, Button } from "@heroui/react";

interface ConfirmModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly title?: string;
  readonly content: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onConfirm: () => void;
  readonly isDanger?: boolean;
}

export function ConfirmModal({
  isOpen,
  onOpenChange,
  title = "Xác nhận",
  content,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  isDanger = false
}: ConfirmModalProps) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-100">
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-default-600">{content}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                {cancelLabel}
              </Button>
              <Button 
                slot="close"
                variant={isDanger ? "danger" : "primary"} 
                onPress={() => {
                  onConfirm();
                }}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
