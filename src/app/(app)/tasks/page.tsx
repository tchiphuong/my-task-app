"use client";

import {
  CalendarIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  PlayIcon,
  PlusIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import {
  Button,
  Calendar,
  Chip,
  DateField,
  DatePicker,
  Dropdown,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  SearchField,
  Select,
  Switch,
  Tabs,
  TextArea,
  TextField
} from "@heroui/react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

import { AppCard as Card } from "@/components/common/AppCard";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TASK_CATEGORIES } from "@/constants";
import { Task, useTaskStore } from "@/store/useTaskStore";

export default function TasksPage() {
  const [mounted, setMounted] = useState(false);
  const account = useTaskStore((state) => state.getCurrentAccount());
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Tab trạng thái trên mobile
  const [activeTab, setActiveTab] = useState<string>("todo");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tasks = account?.tasks || [];

  // Lấy danh sách Categories độc nhất để làm bộ lọc
  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));

  // Lọc danh sách tasks
  const filteredTasks = tasks.filter((task) => {
    if (task.isDaily) return false;

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getTasksByStatus = (status: Task["status"]) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string | boolean> = {};

    formData.forEach((value, key) => {
      if (typeof value === "string") {
        data[key] = value;
      }
    });

    if (!data.title?.toString().trim()) return;

    const taskData = {
      title: data.title as string,
      description: (data.description as string) || "",
      priority: (data.priority || "medium") as Task["priority"],
      category: (data.category || "Công việc") as Task["category"],
      dueDate: (data.dueDate as string) || format(new Date(), "yyyy-MM-dd"),
      isDaily: data.isDaily === "true",
      status: (editingTask ? editingTask.status : "todo") as Task["status"],
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsModalOpen(false);
  };



  const handleTaskMenuAction = (task: Task, actionKey: string) => {
    if (actionKey === "edit") {
      handleOpenEditModal(task);
    } else if (actionKey === "complete") {
      updateTask(task.id, { status: "done" });
    } else if (actionKey === "start") {
      updateTask(task.id, { status: "in_progress" });
    } else if (actionKey === "stop") {
      updateTask(task.id, { status: "todo" });
    } else if (actionKey === "delete") {
      setDeleteTaskId(task.id);
    }
  };

  const renderTaskCard = (task: Task) => {
    const isOverdue = task.dueDate && task.dueDate < format(new Date(), "yyyy-MM-dd") && task.status !== "done";
    const formattedDueDate = task.dueDate ? format(parseISO(task.dueDate), "dd/MM/yyyy") : "";

    return (
      <Card
        key={task.id}
        className={`hover:-translate-y-0.5 ${isOverdue ? "border-danger-200 dark:border-danger-900/30 bg-danger-50/10" : ""
          }`}
      >
        <Card.Content className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className={`font-bold text-sm text-default-900 line-clamp-2 text-left ${task.status === "done" ? "line-through text-default-400" : ""}`}>
              {task.title}
            </h3>
            <Dropdown>
              <Button isIconOnly size="sm" variant="ghost">
                <EllipsisVerticalIcon className="w-4 h-4 text-default-400" />
              </Button>
              <Dropdown.Popover className="min-w-40">
                <Dropdown.Menu onAction={(key: React.Key) => handleTaskMenuAction(task, key.toString())}>
                  <Dropdown.Item id="edit" textValue="Chỉnh sửa">
                    <Label>Chỉnh sửa</Label>
                  </Dropdown.Item>
                  {task.status !== "done" && (
                    <Dropdown.Item id="complete" textValue="Hoàn thành">
                      <Label className="text-success font-semibold">Hoàn thành</Label>
                    </Dropdown.Item>
                  )}
                  {task.status === "todo" && (
                    <Dropdown.Item id="start" textValue="Bắt đầu làm">
                      <Label className="text-primary font-semibold">Bắt đầu làm</Label>
                    </Dropdown.Item>
                  )}
                  {task.status === "in_progress" && (
                    <Dropdown.Item id="stop" textValue="Tạm dừng">
                      <Label>Tạm dừng</Label>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item id="delete" variant="danger" textValue="Xóa công việc">
                    <Label>Xóa công việc</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>

          {task.description && (
            <p className="text-xs text-default-500 line-clamp-2 font-medium text-left">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {(() => {
              const opt = PRIORITY_OPTIONS.find(o => o.code === task.priority);
              return (
                <Chip size="sm" variant="soft" color={opt?.color || "default"}>
                  {opt?.name || "Thấp"}
                </Chip>
              );
            })()}
            <Chip size="sm" variant="soft" color="default">
              {task.category}
            </Chip>
          </div>

          <div className="flex justify-between items-center border-t border-default-50 dark:border-default-100/10 pt-2.5 mt-1">
            <span className={`text-2xs flex items-center gap-1 font-semibold ${isOverdue ? "text-danger-500 font-bold" : "text-default-400"}`}>
              <CalendarIcon className="w-3.5 h-3.5" />
              {isOverdue ? `Trễ: ${formattedDueDate}` : formattedDueDate}
            </span>

            <div className="flex gap-1">
              {task.status !== "done" && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="secondary"
                  className="text-success"
                  onPress={() => updateTask(task.id, { status: "done" })}
                >
                  <CheckIcon className="w-4 h-4" />
                </Button>
              )}
              {task.status === "todo" && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="secondary"
                  className="text-primary"
                  onPress={() => updateTask(task.id, { status: "in_progress" })}
                >
                  <PlayIcon className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Trang & Nút Thêm */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-default-900 tracking-tight">Công việc</h1>
          <p className="text-xs text-default-400 mt-0.5 font-medium">Quản lý các công việc cần hoàn thành của bạn.</p>
        </div>
        <Button
          variant="primary"
          onPress={handleOpenAddModal}
        >
          <PlusIcon className="w-5 h-5" />
          Thêm việc
        </Button>
      </div>

      {/* 2. Bộ Lọc Tìm Kiếm */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchField value={searchQuery} onChange={setSearchQuery} className="grow" aria-label="Tìm kiếm">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Tìm công việc của bạn..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <div className="flex gap-2 shrink-0">
          <Select
            aria-label="Danh mục"
            placeholder="Danh mục"
            className="w-32"
            {...({ selectedKey: selectedCategory, onSelectionChange: (key: React.Key | null) => setSelectedCategory(key as string) })}
          >
            <Select.Trigger>
              <TagIcon className="w-4 h-4 text-default-400 mr-2" />
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="min-w-30">
              <ListBox>
                <ListBox.Item id="all" textValue="Tất cả">Tất cả<ListBox.ItemIndicator /></ListBox.Item>
                {TASK_CATEGORIES.map((cat) => (
                  <ListBox.Item key={cat.code} id={cat.name} textValue={cat.name}>{cat.name}<ListBox.ItemIndicator /></ListBox.Item>
                ))}
                {categories.filter(c => !TASK_CATEGORIES.some(tc => tc.name === c)).map((cat) => (
                  <ListBox.Item key={cat} id={cat} textValue={cat}>{cat}<ListBox.ItemIndicator /></ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <Select
            aria-label="Độ ưu tiên"
            placeholder="Độ ưu tiên"
            className="w-32"
            {...({ selectedKey: selectedPriority, onSelectionChange: (key: React.Key | null) => setSelectedPriority(key as string) })}
          >
            <Select.Trigger>
              <FlagIcon className="w-4 h-4 text-default-400 mr-2" />
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="min-w-30">
              <ListBox>
                <ListBox.Item id="all" textValue="Tất cả">Tất cả<ListBox.ItemIndicator /></ListBox.Item>
                {PRIORITY_OPTIONS.map((opt) => (
                  <ListBox.Item key={opt.code} id={opt.code} textValue={opt.name}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${opt.color}`} />
                      <span>{opt.name}</span>
                    </div>
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {/* 3. Giao diện Task List - Mobile-first Tabs */}
      <div className="md:hidden">
        <Tabs
          {...({ selectedKey: activeTab, onSelectionChange: (key: React.Key) => setActiveTab(key as string) })}
          variant="primary"
          className="w-full"
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Trạng thái công việc">
              <Tabs.Tab id="todo">
                <span className="flex items-center gap-1.5">
                  <ClipboardDocumentCheckIcon className="w-4 h-4 text-default-500" />
                  {STATUS_OPTIONS.find(o => o.code === "todo")?.name} ({getTasksByStatus("todo").length})
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="in_progress">
                <span className="flex items-center gap-1.5">
                  <PlayIcon className="w-4 h-4 text-primary-500" />
                  {STATUS_OPTIONS.find(o => o.code === "in_progress")?.name} ({getTasksByStatus("in_progress").length})
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="done">
                <span className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-success-500" />
                  {STATUS_OPTIONS.find(o => o.code === "done")?.name} ({getTasksByStatus("done").length})
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="todo">
            <div className="flex flex-col gap-3 mt-4">
              {getTasksByStatus("todo").length === 0 ? (
                <div className="text-center py-12 text-default-400 text-xs">Chưa có công việc nào.</div>
              ) : (
                getTasksByStatus("todo").map(renderTaskCard)
              )}
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="in_progress">
            <div className="flex flex-col gap-3 mt-4">
              {getTasksByStatus("in_progress").length === 0 ? (
                <div className="text-center py-12 text-default-400 text-xs">Không có công việc nào đang thực hiện.</div>
              ) : (
                getTasksByStatus("in_progress").map(renderTaskCard)
              )}
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="done">
            <div className="flex flex-col gap-3 mt-4">
              {getTasksByStatus("done").length === 0 ? (
                <div className="text-center py-12 text-default-400 text-xs">Chưa có công việc nào hoàn thành.</div>
              ) : (
                getTasksByStatus("done").map(renderTaskCard)
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* 4. Giao diện Kanban Board - Desktop Grid (md:grid) */}
      <div className="hidden md:grid grid-cols-3 gap-6 items-start mt-2">
        {/* Cột việc cần làm */}
        <div className="flex flex-col gap-3 bg-default-50/50 p-4 rounded-2xl border border-default-100/50 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-default-500 pointer-events-none" />
          <div className="flex justify-between items-center px-1 mb-1 relative z-10">
            <span className="font-extrabold text-sm tracking-tight text-default-700 flex items-center gap-1.5">
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-default-500" />
              {STATUS_OPTIONS.find(o => o.code === "todo")?.name}
            </span>
            <Chip size="sm" variant="soft">{getTasksByStatus("todo").length}</Chip>
          </div>
          <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1 relative z-10">
            {getTasksByStatus("todo").length === 0 ? (
              <div className="text-center py-12 text-default-400 text-xs border-2 border-dashed border-default-100 rounded-xl">Kéo hoặc thêm việc vào đây</div>
            ) : (
              getTasksByStatus("todo").map(renderTaskCard)
            )}
          </div>
        </div>

        {/* Cột việc đang làm */}
        <div className="flex flex-col gap-3 bg-default-50/50 p-4 rounded-2xl border border-default-100/50 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-primary-500 pointer-events-none" />
          <div className="flex justify-between items-center px-1 mb-1 relative z-10">
            <span className="font-extrabold text-sm tracking-tight text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
              <PlayIcon className="w-4 h-4 text-primary-500" />
              {STATUS_OPTIONS.find(o => o.code === "in_progress")?.name}
            </span>
            <Chip size="sm" variant="soft" color="accent">{getTasksByStatus("in_progress").length}</Chip>
          </div>
          <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1 relative z-10">
            {getTasksByStatus("in_progress").length === 0 ? (
              <div className="text-center py-12 text-default-400 text-xs border-2 border-dashed border-default-100 rounded-xl">Không có việc đang làm</div>
            ) : (
              getTasksByStatus("in_progress").map(renderTaskCard)
            )}
          </div>
        </div>

        {/* Cột việc đã xong */}
        <div className="flex flex-col gap-3 bg-default-50/50 p-4 rounded-2xl border border-default-100/50 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-success-500 pointer-events-none" />
          <div className="flex justify-between items-center px-1 mb-1 relative z-10">
            <span className="font-extrabold text-sm tracking-tight text-success-600 dark:text-success-400 flex items-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-success-500" />
              {STATUS_OPTIONS.find(o => o.code === "done")?.name}
            </span>
            <Chip size="sm" variant="soft" color="success">{getTasksByStatus("done").length}</Chip>
          </div>
          <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1 relative z-10">
            {getTasksByStatus("done").length === 0 ? (
              <div className="text-center py-12 text-default-400 text-xs border-2 border-dashed border-default-100 rounded-xl">Chưa có việc hoàn thành</div>
            ) : (
              getTasksByStatus("done").map(renderTaskCard)
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTaskId}
        onOpenChange={(isOpen) => !isOpen && setDeleteTaskId(null)}
        title="Xóa công việc"
        content="Bạn có chắc chắn muốn xóa công việc này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa luôn"
        isDanger={true}
        onConfirm={() => {
          if (deleteTaskId) {
            deleteTask(deleteTaskId);
          }
          setDeleteTaskId(null);
        }}
      />

      {/* 5. Modal Thêm/Sửa Công việc */}
      <Modal.Backdrop isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{editingTask ? "Chỉnh sửa công việc" : "Thêm việc mới"}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 py-4 w-full">
              <Form
                id="task-form"
                className="w-full flex flex-col gap-4"
                validationBehavior="native"
                onSubmit={handleSubmit}
              >
                <TextField
                  name="title"
                  defaultValue={editingTask ? editingTask.title : ""}
                  isRequired
                  className="w-full"
                >
                  <Label>Tên công việc</Label>
                  <Input variant="secondary" placeholder="Nhập tên việc cần làm..." />
                  <FieldError />
                </TextField>

                <TextField
                  name="description"
                  defaultValue={editingTask?.description || ""}
                  className="w-full"
                >
                  <Label>Mô tả chi tiết</Label>
                  <TextArea variant="secondary" placeholder="Ghi chú thêm thông tin chi tiết (tùy chọn)..." />
                  <FieldError />
                </TextField>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    name="priority"
                    aria-label="Độ ưu tiên"
                    placeholder="Độ ưu tiên"
                    className="w-full"
                    defaultValue={editingTask ? editingTask.priority : "medium"}
                  >
                    <Label>Độ ưu tiên</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <ListBox.Item key={opt.code} id={opt.code} textValue={opt.name}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${opt.color}`} />
                              <span>{opt.name}</span>
                            </div>
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <FieldError />
                  </Select>

                  <DatePicker
                    name="dueDate"
                    defaultValue={editingTask?.dueDate ? parseDate(editingTask.dueDate) : today(getLocalTimeZone())}
                    className="w-full"
                  >
                    <Label>Hạn chót</Label>
                    <DateField.Group fullWidth>
                      <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                      <DateField.Suffix>
                        <DatePicker.Trigger>
                          <DatePicker.TriggerIndicator />
                        </DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <FieldError />
                    <DatePicker.Popover>
                      <Calendar aria-label="Hạn chót">
                        <Calendar.Header>
                          <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                          </Calendar.YearPickerTrigger>
                          <Calendar.NavButton slot="previous" />
                          <Calendar.NavButton slot="next" />
                        </Calendar.Header>
                        <Calendar.Grid>
                          <Calendar.GridHeader>
                            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                          </Calendar.GridHeader>
                          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                        </Calendar.Grid>
                        <Calendar.YearPickerGrid>
                          <Calendar.YearPickerGridBody>
                            {({ year }) => <Calendar.YearPickerCell year={year} />}
                          </Calendar.YearPickerGridBody>
                        </Calendar.YearPickerGrid>
                      </Calendar>
                    </DatePicker.Popover>
                  </DatePicker>
                </div>

                <TextField
                  name="category"
                  defaultValue={editingTask?.category || "Công việc"}
                  className="w-full"
                >
                  <Label>Danh mục</Label>
                  <Input variant="secondary" placeholder="Ví dụ: Công việc, Học tập, Cá nhân..." />
                  <FieldError />
                </TextField>

                <Switch
                  name="isDaily"
                  value="true"
                  defaultSelected={editingTask ? editingTask.isDaily : false}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    Công việc hàng ngày
                  </Switch.Content>
                </Switch>
              </Form>
            </Modal.Body>
            <Modal.Footer className="w-full">
              <Button variant="ghost" className="font-semibold text-xs text-danger" onPress={() => setIsModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                form="task-form"
                variant="primary"
              >
                <CheckIcon className="w-4 h-4" />
                {editingTask ? "Lưu thay đổi" : "Tạo công việc"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
