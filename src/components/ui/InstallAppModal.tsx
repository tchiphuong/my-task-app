"use client";

import {
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Button, Modal } from "@heroui/react";
import { useTranslation } from "react-i18next";

interface InstallAppModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
}

export default function InstallAppModal({
  isOpen,
  onOpenChange,
}: InstallAppModalProps) {
  const { t } = useTranslation();

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("installModal.title")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-6 py-4">
                <p className="text-sm font-normal text-default-500 -mt-2 mb-2">
                  {t("installModal.desc")}
                </p>

                {/* iOS Safari */}
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ArrowUpTrayIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground">
                      {t("installModal.iosTitle")}
                    </h3>
                    <p className="text-sm text-default-500 leading-relaxed">
                      {t("installModal.iosStep1")}
                      <br />
                      {t("installModal.iosStep2")}
                    </p>
                  </div>
                </div>

                {/* Android Chrome */}
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground">
                      {t("installModal.androidTitle")}
                    </h3>
                    <p className="text-sm text-default-500 leading-relaxed">
                      {t("installModal.androidStep1")}
                      <br />
                      {t("installModal.androidStep2")}
                    </p>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary" fullWidth>
                {t("installModal.understand")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
