import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ApiError } from "../api/client";
import { createTask, deleteTask, fetchTasks, updateTask } from "../api/tasks";
import {
  priorityLabel,
  priorityOptions,
  statusLabel,
  statusOptions,
} from "../lib/taskLabels";
import {
  type TaskDto,
  type TaskItemStatusValue,
  type TaskPriorityValue,
  TaskItemStatus,
  TaskPriority,
} from "../types/api";

type CreateFormState = {
  title: string;
  description: string;
  priority: TaskPriorityValue;
  estimatedMinutes: string | number;
  dueDate: string;
};

function emptyCreateForm(): CreateFormState {
  return {
    title: "",
    description: "",
    priority: TaskPriority.Medium,
    estimatedMinutes: "",
    dueDate: "",
  };
}

export function TasksPage() {
  const qc = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm);
  const [editing, setEditing] = useState<TaskDto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const query = useMemo(() => {
    const q: { from?: string; to?: string } = {};
    if (from.trim()) q.from = new Date(from).toISOString();
    if (to.trim()) q.to = new Date(to).toISOString();
    return q;
  }, [from, to]);

  const tasksQuery = useQuery({
    queryKey: ["tasks", query.from ?? "", query.to ?? ""] as const,
    queryFn: () => fetchTasks(query),
  });

  const invalidateTasks = () => {
    void qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      createTask({
        title: createForm.title.trim(),
        description: createForm.description.trim() || null,
        priority: createForm.priority,
        estimatedMinutes:
          createForm.estimatedMinutes === ""
            ? null
            : Number(createForm.estimatedMinutes),
        dueDate: createForm.dueDate
          ? new Date(createForm.dueDate).toISOString()
          : null,
      }),
    onSuccess: () => {
      setCreateForm(emptyCreateForm());
      setFormError(null);
      invalidateTasks();
    },
    onError: (e: unknown) => {
      setFormError(e instanceof ApiError ? e.message : "Ошибка создания");
    },
  });

  const updateMut = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("no task");
      return updateTask(editing.id, {
        title: editing.title.trim() || null,
        description: editing.description?.trim() ?? null,
        status: editing.status,
        priority: editing.priority,
        estimatedMinutes: editing.estimatedMinutes ?? null,
        actualMinutes: editing.actualMinutes ?? null,
        interruptionCount: editing.interruptionCount,
        dueDate: editing.dueDate,
      });
    },
    onSuccess: () => {
      setEditing(null);
      setFormError(null);
      invalidateTasks();
    },
    onError: (e: unknown) => {
      setFormError(e instanceof ApiError ? e.message : "Ошибка сохранения");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      setEditing(null);
      invalidateTasks();
    },
  });

  const completeMut = useMutation({
    mutationFn: (task: TaskDto) =>
      updateTask(task.id, {
        status: TaskItemStatus.Done,
      }),
    onSuccess: () => {
      invalidateTasks();
    },
  });

  const tasks = tasksQuery.data ?? [];

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Задачи</h1>
        <p className="muted">
          Управление задачами для планирования и обучения модели.
        </p>
      </header>

      <section className="card stack">
        <h2 className="section-title">Фильтр по датам</h2>
        <div className="row row--wrap">
          <label className="field field--inline">
            <span className="field__label">С</span>
            <input
              className="input"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="field field--inline">
            <span className="field__label">По</span>
            <input
              className="input"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            Сбросить
          </button>
        </div>
      </section>

      <div className="split">
        <section className="card stack">
          <h2 className="section-title">Новая задача</h2>
          <p className="muted">
            Параметры планирования: укажите, сколько времени займет задача и к
            какому времени ее желательно завершить
          </p>
          {formError && !editing ? (
            <div className="banner banner--error">{formError}</div>
          ) : null}
          <label className="field">
            <span className="field__label">Название</span>
            <input
              className="input"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Описание</span>
            <textarea
              className="input input--area"
              rows={3}
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <label className="field">
            <span className="field__label">Приоритет</span>
            <select
              className="input"
              value={createForm.priority}
              onChange={(e) =>
                setCreateForm((f) => ({
                  ...f,
                  priority: Number(e.target.value) as TaskPriorityValue,
                }))
              }
            >
              {priorityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label-row">
              <span className="field__label">Сколько примерно займет (мин)</span>
              <Hint text="Оценка длительности задачи: сколько минут понадобится на выполнение" />
            </span>
            <input
              className="input"
              type="number"
              min={0}
              value={createForm.estimatedMinutes}
              onChange={(e) =>
                setCreateForm((f) => ({
                  ...f,
                  estimatedMinutes:
                    e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="field">
            <span className="field__label-row">
              <span className="field__label">Когда нужно завершить (дедлайн)</span>
              <Hint text="Крайний срок: до этого времени задачу желательно завершить" />
            </span>
            <input
              className="input"
              type="datetime-local"
              value={createForm.dueDate}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </label>
          <button
            type="button"
            className="btn btn--primary"
            disabled={createMut.isPending || !createForm.title.trim()}
            onClick={() => createMut.mutate()}
          >
            {createMut.isPending ? "Создание…" : "Добавить задачу"}
          </button>
        </section>

        <section className="card stack">
          <h2 className="section-title">Список</h2>
          {tasksQuery.isLoading ? (
            <p className="muted">Загрузка…</p>
          ) : tasksQuery.isError ? (
            <div className="banner banner--error">
              {tasksQuery.error instanceof ApiError
                ? tasksQuery.error.message
                : "Не удалось загрузить задачи"}
            </div>
          ) : tasks.length === 0 ? (
            <p className="muted">Задач пока нет.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((t) => (
                <li key={t.id} className="task-row">
                  <div className="task-row__main">
                    <span className="task-row__title">{t.title}</span>
                    <span className="task-row__meta muted">
                      {priorityLabel(t.priority)} · {statusLabel(t.status)}
                    </span>
                  </div>
                  <div className="task-row__actions">
                    {t.status !== TaskItemStatus.Done ? (
                      <button
                        type="button"
                        className="btn btn--small btn--primary"
                        disabled={completeMut.isPending}
                        onClick={() => completeMut.mutate(t)}
                      >
                        Завершить
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn--small btn--ghost"
                      onClick={() => {
                        setEditing({ ...t });
                        setFormError(null);
                      }}
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      className="btn btn--small btn--danger"
                      onClick={() => {
                        if (confirm("Удалить задачу?")) deleteMut.mutate(t.id);
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {editing ? (
        <section className="card stack overlay-panel">
          <div className="row row--space">
            <h2 className="section-title">Редактирование</h2>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setEditing(null);
                setFormError(null);
              }}
            >
              Закрыть
            </button>
          </div>
          {formError ? (
            <div className="banner banner--error">{formError}</div>
          ) : null}
          <p className="muted">
            Параметры планирования: длительность задачи и желаемый дедлайн
          </p>
          <label className="field">
            <span className="field__label">Название</span>
            <input
              className="input"
              value={editing.title}
              onChange={(e) =>
                setEditing((x) => (x ? { ...x, title: e.target.value } : x))
              }
            />
          </label>
          <label className="field">
            <span className="field__label">Описание</span>
            <textarea
              className="input input--area"
              rows={3}
              value={editing.description ?? ""}
              onChange={(e) =>
                setEditing((x) =>
                  x ? { ...x, description: e.target.value } : x,
                )
              }
            />
          </label>
          <div className="row row--wrap">
            <label className="field">
              <span className="field__label">Статус</span>
              <select
                className="input"
                value={editing.status}
                onChange={(e) =>
                  setEditing((x) =>
                    x
                      ? {
                          ...x,
                          status: Number(e.target.value) as TaskItemStatusValue,
                        }
                      : x,
                  )
                }
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Приоритет</span>
              <select
                className="input"
                value={editing.priority}
                onChange={(e) =>
                  setEditing((x) =>
                    x
                      ? {
                          ...x,
                          priority: Number(e.target.value) as TaskPriorityValue,
                        }
                      : x,
                  )
                }
              >
                {priorityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="row row--wrap">
            <label className="field">
              <span className="field__label-row">
                <span className="field__label">Сколько займет (мин)</span>
                <Hint text="Оценка длительности задачи: сколько минут понадобится на выполнение" />
              </span>
              <input
                className="input"
                type="number"
                min={0}
                value={editing.estimatedMinutes ?? ""}
                onChange={(e) =>
                  setEditing((x) =>
                    x
                      ? {
                          ...x,
                          estimatedMinutes:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }
                      : x,
                  )
                }
              />
            </label>
            <label className="field">
              <span className="field__label">Факт, мин</span>
              <input
                className="input"
                type="number"
                min={0}
                value={editing.actualMinutes ?? ""}
                onChange={(e) =>
                  setEditing((x) =>
                    x
                      ? {
                          ...x,
                          actualMinutes:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }
                      : x,
                  )
                }
              />
            </label>
            <label className="field">
              <span className="field__label">Прерывания</span>
              <input
                className="input"
                type="number"
                min={0}
                value={editing.interruptionCount}
                onChange={(e) =>
                  setEditing((x) =>
                    x
                      ? { ...x, interruptionCount: Number(e.target.value) }
                      : x,
                  )
                }
              />
            </label>
          </div>
          <label className="field">
            <span className="field__label-row">
              <span className="field__label">Когда завершить (дедлайн)</span>
              <Hint text="Крайний срок: до этого времени задачу желательно завершить" />
            </span>
            <input
              className="input"
              type="datetime-local"
              value={
                editing.dueDate
                  ? toLocalDatetimeValue(editing.dueDate)
                  : ""
              }
              onChange={(e) =>
                setEditing((x) =>
                  x
                    ? {
                        ...x,
                        dueDate: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      }
                    : x,
                )
              }
            />
          </label>
          <button
            type="button"
            className="btn btn--primary"
            disabled={updateMut.isPending}
            onClick={() => updateMut.mutate()}
          >
            {updateMut.isPending ? "Сохранение…" : "Сохранить"}
          </button>
        </section>
      ) : null}
    </div>
  );
}

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Hint({ text }: { text: string }) {
  return (
    <span className="hint" title={text} aria-label={text}>
      !
    </span>
  );
}
