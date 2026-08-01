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
  CheckIcon as CheckSolid,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckSolid,
  PlayIcon as PlaySolid
} from "@heroicons/react/24/solid";
import {
  Button,
  Chip,
  Dropdown,
  FieldError,
  Form,
  Label,
  ListBox,
  Modal,
  SearchField,
  Switch,
  Tabs,
  TextField
} from "@heroui/react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AppCard as Card,
  AppDatePicker as DatePicker,
  AppInput as Input,
  AppSelect as Select,
  AppTextArea as TextArea} from "@/components/common";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PRIORITY_OPTIONS, TASK_CATEGORIES, TASK_PRIORITY, TASK_STATUS } from "@/constants";
import { Task, useTaskStore } from "@/store/useTaskStore";

export default function TasksPage() {
  const { t } = useTranslation();
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
      status: (editingTask ? editingTask.status : TASK_STATUS.TODO) as Task["status"],
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
    const isOverdue = task.dueDate && task.dueDate < format(new Date(), "yyyy-MM-dd") && task.status !== TASK_STATUS.DONE;
    const formattedDueDate = task.dueDate ? format(parseISO(task.dueDate), "dd/MM/yyyy") : "";

    return (
      <Card
        key={task.id}
        className={`hover:-translate-y-0.5 ${isOverdue ? "border-danger-200 dark:border-danger-900/30 bg-danger-50/10" : ""
          }`}
      >
        <Card.Content className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className={`font-bold text-sm text-default-900 line-clamp-2 text-left ${task.status === TASK_STATUS.DONE ? "line-through text-default-400" : ""}`}>
              {task.title}
            </h3>
            <Dropdown>
              <Button isIconOnly size="sm" variant="ghost">
                <EllipsisVerticalIcon className="w-4 h-4 text-default-400" />
              </Button>
              <Dropdown.Popover className="min-w-40">
                <Dropdown.Menu onAction={(key: React.Key) => handleTaskMenuAction(task, key.toString())}>
                  <Dropdown.Item id="edit" textValue={t("tasks.edit")}>
                    <Label>{t("tasks.edit")}</Label>
                  </Dropdown.Item>
                  {task.status !== TASK_STATUS.DONE && (
                    <Dropdown.Item id="complete" textValue={t("tasks.complete")}>
                      <Label className="text-success font-semibold">{t("tasks.complete")}</Label>
                    </Dropdown.Item>
                  )}
                  {task.status === TASK_STATUS.TODO && (
                    <Dropdown.Item id="start" textValue={t("tasks.start")}>
                      <Label className="text-primary font-semibold">{t("tasks.start")}</Label>
                    </Dropdown.Item>
                  )}
                  {task.status === TASK_STATUS.IN_PROGRESS && (
                    <Dropdown.Item id="stop" textValue={t("tasks.pause")}>
                      <Label>{t("tasks.pause")}</Label>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item id="delete" variant="danger" textValue={t("tasks.delete")}>
                    <Label>{t("tasks.delete")}</Label>
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
                  {opt ? t(`tasks.form.priority.${opt.code}`) : t("tasks.form.priority.low")}
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
              {isOverdue ? t("tasks.overdue", { date: formattedDueDate }) : formattedDueDate}
            </span>

            <div className="flex gap-1">
              {task.status !== TASK_STATUS.DONE && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="secondary"
                  className="text-success"
                  onPress={() => updateTask(task.id, { status: TASK_STATUS.DONE })}
                >
                  <CheckIcon className="w-4 h-4" />
                </Button>
              )}
              {task.status === TASK_STATUS.TODO && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="secondary"
                  className="text-primary"
                  onPress={() => updateTask(task.id, { status: TASK_STATUS.IN_PROGRESS })}
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
          <h1 className="text-xl md:text-2xl font-black text-default-900 tracking-tight">{t("menu.tasks")}</h1>
          <p className="text-xs text-default-400 mt-0.5 font-medium">{t("tasks.subtitle")}</p>
        </div>
        <Button
          variant="primary"
          onPress={handleOpenAddModal}
        >
          <PlusIcon className="w-5 h-5" />
          {t("tasks.add")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="grow">
          <SearchField value={searchQuery} onChange={setSearchQuery} aria-label={t("tasks.search")}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={t("tasks.searchPlaceholder")} />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="w-32">
            <Select
              aria-label={t("tasks.category")}
              placeholder={t("tasks.category")}
              {...({ selectedKey: selectedCategory, onSelectionChange: (key: React.Key | null) => setSelectedCategory(key as string) })}
            >
              <Select.Trigger>
                <span className="mr-2 flex items-center justify-center text-default-400">
                  <TagIcon width={16} height={16} />
                </span>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all" textValue={t("tasks.all")}>{t("tasks.all")}<ListBox.ItemIndicator /></ListBox.Item>
                  {TASK_CATEGORIES.map((cat) => (
                    <ListBox.Item key={cat.code} id={cat.name} textValue={cat.name}>{cat.name}<ListBox.ItemIndicator /></ListBox.Item>
                  ))}
                  {categories.filter(c => !TASK_CATEGORIES.some(tc => tc.name === c)).map((cat) => (
                    <ListBox.Item key={cat} id={cat} textValue={cat}>{cat}<ListBox.ItemIndicator /></ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <div className="w-32">
            <Select
              aria-label={t("tasks.priority")}
              placeholder={t("tasks.priority")}
              {...({ selectedKey: selectedPriority, onSelectionChange: (key: React.Key | null) => setSelectedPriority(key as string) })}
            >
              <Select.Trigger>
                <span className="mr-2 flex items-center justify-center text-default-400">
                  <FlagIcon width={16} height={16} />
                </span>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all" textValue={t("tasks.all")}>{t("tasks.all")}<ListBox.ItemIndicator /></ListBox.Item>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <ListBox.Item key={opt.code} id={opt.code} textValue={t(`tasks.form.priority.${opt.code}`)}>
                      <Chip size="sm" variant="soft" color={opt.color}>
                        {t(`tasks.form.priority.${opt.code}`)}
                      </Chip>
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Giao diện Task List - Mobile-first Tabs */}
      <div className="md:hidden">
        <Tabs
          {...({ selectedKey: activeTab, onSelectionChange: (key: React.Key) => setActiveTab(key as string) })}
          variant="primary"
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label={t("tasks.form.status.title")}>
              <Tabs.Tab id="todo">
                <span className="flex items-center gap-1 text-default-500">
                  {activeTab === "todo" ? (
                    <ClipboardDocumentCheckSolid width={18} height={18} />
                  ) : (
                    <ClipboardDocumentCheckIcon width={18} height={18} />
                  )}
                  <span className="text-xs">({getTasksByStatus("todo").length})</span>
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="in_progress">
                <span className="flex items-center gap-1 text-primary-500">
                  {activeTab === "in_progress" ? (
                    <PlaySolid width={18} height={18} />
                  ) : (
                    <PlayIcon width={18} height={18} />
                  )}
                  <span className="text-xs">({getTasksByStatus("in_progress").length})</span>
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="done">
                <span className="flex items-center gap-1 text-success-500">
                  {activeTab === "done" ? (
                    <CheckSolid width={18} height={18} />
                  ) : (
                    <CheckIcon width={18} height={18} />
                  )}
                  <span className="text-xs">({getTasksByStatus("done").length})</span>
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="todo">
            <div className="flex flex-col gap-3 mt-4">
              {getTasksByStatus("todo").length === 0 ? (
                <div className="text-center py-12 text-default-400 text-xs">{t("tasks.noTasksTodo")}</div>
              ) : (
                getTasksByStatus("todo").map(renderTaskCard)
              )}
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="in_progress">
            <div className="flex flex-col gap-3 mt-4">
              {getTasksByStatus("in_progress").length === 0 ? (
                <div className="text-center py-12 text-default-400 text-xs">{t("tasks.noTasksDoing")}</div>
              ) : (
                getTasksByStatus("in_progress").map(renderTaskCard)
              )}
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="done">
            <div className="flex flex-col gap-3 mt-4">
              {getTasksByStatus("done").length === 0 ? (
                <div className="text-center py-12 text-default-400 text-xs">{t("tasks.noTasksCompleted")}</div>
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
              {t("tasks.form.status.todo")}
            </span>
            <Chip size="sm" variant="soft">{getTasksByStatus("todo").length}</Chip>
          </div>
          <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1 relative z-10">
            {getTasksByStatus("todo").length === 0 ? (
              <div className="text-center py-12 text-default-400 text-xs border-2 border-dashed border-default-100 rounded-xl">{t("tasks.dragTodo")}</div>
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
              {t("tasks.form.status.doing")}
            </span>
            <Chip size="sm" variant="soft" color="accent">{getTasksByStatus("in_progress").length}</Chip>
          </div>
          <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1 relative z-10">
            {getTasksByStatus("in_progress").length === 0 ? (
              <div className="text-center py-12 text-default-400 text-xs border-2 border-dashed border-default-100 rounded-xl">{t("tasks.noTasksDoing")}</div>
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
              {t("tasks.form.status.completed")}
            </span>
            <Chip size="sm" variant="soft" color="success">{getTasksByStatus("done").length}</Chip>
          </div>
          <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1 relative z-10">
            {getTasksByStatus("done").length === 0 ? (
              <div className="text-center py-12 text-default-400 text-xs border-2 border-dashed border-default-100 rounded-xl">{t("tasks.noTasksCompleted")}</div>
            ) : (
              getTasksByStatus("done").map(renderTaskCard)
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTaskId}
        onOpenChange={(isOpen) => !isOpen && setDeleteTaskId(null)}
        title={t("tasks.deleteConfirmTitle")}
        content={t("tasks.deleteConfirmDesc")}
        confirmLabel={t("tasks.deleteSubmit")}
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
              <Modal.Heading>{editingTask ? t("tasks.edit") : t("tasks.add")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4 py-4 w-full">
              <Form
                id="task-form"
                className="w-full flex flex-col gap-4"
                validationBehavior="native"
                onSubmit={handleSubmit}
              >
                <div className="w-full">
                  <TextField
                    name="title"
                    defaultValue={editingTask ? editingTask.title : ""}
                    isRequired
                  >
                    <Label>{t("tasks.form.title")}</Label>
                    <Input placeholder={t("tasks.form.titlePlaceholder")} />
                    <FieldError />
                  </TextField>
                </div>

                <div className="w-full">
                  <TextField
                    name="description"
                    defaultValue={editingTask?.description || ""}
                  >
                    <Label>{t("tasks.form.desc")}</Label>
                    <TextArea placeholder={t("tasks.form.descPlaceholder")} />
                    <FieldError />
                  </TextField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full">
                    <Select
                      name="priority"
                      aria-label={t("tasks.form.priority.title")}
                      placeholder={t("tasks.form.priority.title")}
                      defaultValue={editingTask ? editingTask.priority : TASK_PRIORITY.MEDIUM}
                    >
                      <Label>{t("tasks.form.priority.title")}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {PRIORITY_OPTIONS.map((opt) => (
                            <ListBox.Item key={opt.code} id={opt.code} textValue={t(`tasks.form.priority.${opt.code}`)}>
                              <Chip size="sm" variant="soft" color={opt.color}>
                                {t(`tasks.form.priority.${opt.code}`)}
                              </Chip>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <FieldError />
                    </Select>
                  </div>

                  <div className="w-full">
                    <DatePicker
                      name="dueDate"
                      label={t("tasks.form.dueDate")}
                      defaultValue={editingTask?.dueDate ? parseDate(editingTask.dueDate) : today(getLocalTimeZone())}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <TextField
                    name="category"
                    defaultValue={editingTask?.category || "Công việc"}
                  >
                    <Label>{t("tasks.category")}</Label>
                    <Input placeholder={t("tasks.form.categoryPlaceholder")} />
                    <FieldError />
                  </TextField>
                </div>

                <Switch
                  name="isDaily"
                  value="true"
                  defaultSelected={editingTask ? editingTask.isDaily : false}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    {t("tasks.form.isDaily")}
                  </Switch.Content>
                </Switch>
              </Form>
            </Modal.Body>
            <Modal.Footer className="w-full">
              <Button variant="ghost" className="font-semibold text-xs text-danger" onPress={() => setIsModalOpen(false)}>
                {t("confirmModal.cancel")}
              </Button>
              <Button
                type="submit"
                form="task-form"
                variant="primary"
              >
                <CheckIcon className="w-4 h-4" />
                {editingTask ? t("tasks.form.submitEdit") : t("tasks.form.submitAdd")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
