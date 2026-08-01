import { Button, Modal } from "@heroui/react";
import { useTranslation } from "react-i18next";

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
  title,
  content,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isDanger = false
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t("confirmModal.defaultTitle");
  const displayConfirmLabel = confirmLabel ?? t("confirmModal.confirm");
  const displayCancelLabel = cancelLabel ?? t("confirmModal.cancel");

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{displayTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-default-600">{content}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                {displayCancelLabel}
              </Button>
              <Button
                slot="close"
                variant={isDanger ? "danger" : "primary"}
                onPress={() => {
                  onConfirm();
                }}
              >
                {displayConfirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
