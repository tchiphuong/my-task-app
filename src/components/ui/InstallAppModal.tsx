"use client";

import {
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Button, Modal } from "@heroui/react";

interface InstallAppModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
}

export default function InstallAppModal({
  isOpen,
  onOpenChange,
}: InstallAppModalProps) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.Header>
              <Modal.Heading className="text-xl font-bold">Cài đặt ứng dụng</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-4 gap-6">
              <p className="text-sm font-normal text-default-500 -mt-2 mb-2">
                Thêm My Task App vào màn hình chính để trải nghiệm mượt mà như app gốc.
              </p>

              {/* iOS Safari */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ArrowUpTrayIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-foreground">
                    Trên iPhone / iPad (Safari)
                  </h3>
                  <p className="text-sm text-default-500 leading-relaxed">
                    1. Bấm vào biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh công cụ phía dưới màn hình.
                    <br />
                    2. Chọn <strong>Thêm vào MH chính</strong> (Add to Home Screen).
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
                    Trên Android (Chrome)
                  </h3>
                  <p className="text-sm text-default-500 leading-relaxed">
                    1. Bấm vào biểu tượng <strong>3 chấm</strong> ở góc trên bên phải trình duyệt.
                    <br />
                    2. Chọn <strong>Cài đặt ứng dụng</strong> (Install app) hoặc <strong>Thêm vào MH chính</strong>.
                  </p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary" className="w-full">
                Đã hiểu
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
