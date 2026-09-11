import React, { useCallback, useEffect, useState } from 'react';

import { requestContentRefresh } from '../../content/ContentProvider';
import { ApiError, adminApi, type AdminRow } from '../api';
import { FieldGrid, blankValues, pick, type FieldDef, type FormValues } from './fields';
import { ActionButton, Banner, EmptyState, IconButton, Panel, StatusPill } from './ui';

type Props = {
  entity: string;
  title: string;
  description?: string;
  fields: readonly FieldDef[];
  /** How each row is labelled in the collapsed list. */
  titleOf: (row: FormValues) => string;
  /** Optional subtitle under the row title. */
  subtitleOf?: (row: FormValues) => string;
  /** Seed values for a new row, merged over the field defaults. */
  newRow?: () => FormValues;
  addLabel?: string;
  /** Some lists (e.g. sections) are fixed and should not grow or shrink. */
  fixed?: boolean;
};

/**
 * Ordered list of records with inline editing, drag-free reordering,
 * per-row publish and delete. Used for every repeatable content type:
 * navigation, sections, stats, services, guarantees, skills, career and
 * social links.
 */
export const CollectionEditor: React.FC<Props> = ({
  entity,
  title,
  description,
  fields,
  titleOf,
  subtitleOf,
  newRow,
  addLabel = 'Add item',
  fixed = false,
}) => {
  const [rows, setRows] = useState<(FormValues & { id: string; __published: boolean })[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, Record<string, string[]>>>({});
  const [banner, setBanner] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.list<AdminRow>(entity);
      setRows(
        data.map((row) => ({
          ...pick(fields, row as FormValues),
          id: row.id,
          __published: !row.hasUnpublishedChanges,
        })),
      );
    } catch (error) {
      setBanner({
        tone: 'error',
        text: error instanceof ApiError ? error.message : 'Could not load this list.',
      });
    } finally {
      setLoading(false);
    }
  }, [entity, fields]);

  useEffect(() => {
    void load();
  }, [load]);

  const change = (id: string, name: string, next: unknown) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [name]: next, __published: false } : row)),
    );

  const save = async (id: string) => {
    const row = rows.find((candidate) => candidate.id === id);
    if (!row) return;

    setBusyId(id);
    setErrors((current) => ({ ...current, [id]: {} }));
    try {
      const saved = await adminApi.update<AdminRow>(entity, id, pick(fields, row));
      setRows((current) =>
        current.map((candidate) =>
          candidate.id === id
            ? {
                ...pick(fields, saved as FormValues),
                id,
                __published: !saved.hasUnpublishedChanges,
              }
            : candidate,
        ),
      );
      setBanner({ tone: 'success', text: 'Draft saved.' });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors((current) => ({ ...current, [id]: error.fieldErrors }));
        setBanner({ tone: 'error', text: error.message });
      }
    } finally {
      setBusyId(null);
    }
  };

  const publish = async (id: string) => {
    setBusyId(id);
    try {
      await adminApi.publishRow(entity, id);
      setRows((current) =>
        current.map((row) => (row.id === id ? { ...row, __published: true } : row)),
      );
      setBanner({ tone: 'success', text: 'Published. The live site is updated.' });
      requestContentRefresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors((current) => ({ ...current, [id]: error.fieldErrors }));
        setBanner({ tone: 'error', text: error.message });
      }
    } finally {
      setBusyId(null);
    }
  };

  const add = async () => {
    const draft = { ...blankValues(fields), ...(newRow?.() ?? {}) };
    // Keep new rows unique and ordered last without a round-trip.
    if ('stableKey' in draft && !draft.stableKey) {
      draft.stableKey = `${entity}-${Date.now().toString(36)}`;
    }
    if ('sortOrder' in draft) draft.sortOrder = rows.length;
    if ('visible' in draft) draft.visible = true;

    setBusyId('new');
    try {
      const created = await adminApi.create<AdminRow>(entity, pick(fields, draft));
      setRows((current) => [
        ...current,
        { ...pick(fields, created as FormValues), id: created.id, __published: false },
      ]);
      setOpenId(created.id);
      setBanner({ tone: 'info', text: 'Added as a draft. Fill it in, save, then publish.' });
    } catch (error) {
      if (error instanceof ApiError) setBanner({ tone: 'error', text: error.message });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    const row = rows.find((candidate) => candidate.id === id);
    if (!window.confirm(`Delete "${row ? titleOf(row) : 'this item'}"? This cannot be undone.`)) {
      return;
    }

    setBusyId(id);
    try {
      await adminApi.remove(entity, id);
      setRows((current) => current.filter((candidate) => candidate.id !== id));
      setBanner({ tone: 'success', text: 'Deleted. Publish the section to update the live site.' });
      requestContentRefresh();
    } catch (error) {
      if (error instanceof ApiError) setBanner({ tone: 'error', text: error.message });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next.map((row, order) => ({ ...row, sortOrder: order, __published: false })));

    try {
      await adminApi.reorder(
        entity,
        next.map((row) => row.id),
      );
      setBanner({ tone: 'info', text: 'Order saved. Publish the moved items to go live.' });
    } catch (error) {
      if (error instanceof ApiError) setBanner({ tone: 'error', text: error.message });
      void load();
    }
  };

  const publishAllRows = async () => {
    setBusyId('all');
    try {
      for (const row of rows) await adminApi.publishRow(entity, row.id);
      setRows((current) => current.map((row) => ({ ...row, __published: true })));
      setBanner({ tone: 'success', text: 'Everything in this section is published.' });
      requestContentRefresh();
    } catch (error) {
      if (error instanceof ApiError) setBanner({ tone: 'error', text: error.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Panel
      title={title}
      description={description}
      actions={
        <>
          <ActionButton onClick={publishAllRows} loading={busyId === 'all'} disabled={!rows.length}>
            Publish all
          </ActionButton>
          {!fixed && (
            <ActionButton tone="primary" onClick={add} loading={busyId === 'new'}>
              + {addLabel}
            </ActionButton>
          )}
        </>
      }
    >
      {banner && (
        <div className="mb-5">
          <Banner tone={banner.tone}>{banner.text}</Banner>
        </div>
      )}

      {loading ? (
        <p className="font-body text-[12px] text-fg-subtle">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState>Nothing here yet.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, index) => {
            const open = openId === row.id;

            return (
              <li key={row.id} className="rounded-[2px] border border-line bg-surface-2/60">
                <div className="flex flex-wrap items-center gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : row.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={open}
                  >
                    <span
                      className="font-mono text-[10px] text-fg-subtle"
                      aria-hidden="true"
                    >
                      {open ? '▾' : '▸'}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-body text-[13px] text-fg">
                        {titleOf(row) || '(untitled)'}
                      </span>
                      {subtitleOf && (
                        <span className="block truncate font-body text-[11px] font-light text-fg-subtle">
                          {subtitleOf(row)}
                        </span>
                      )}
                    </span>
                  </button>

                  <StatusPill published={row.__published} />

                  {row.visible === false && (
                    <span className="rounded-[2px] border border-line px-2 py-0.5 font-body text-[8.5px] uppercase tracking-[0.16em] text-fg-subtle">
                      Hidden
                    </span>
                  )}

                  <div className="flex shrink-0 gap-1">
                    <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
                      ↑
                    </IconButton>
                    <IconButton
                      label="Move down"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                    >
                      ↓
                    </IconButton>
                    {!fixed && (
                      <IconButton label="Delete" onClick={() => void remove(row.id)}>
                        ✕
                      </IconButton>
                    )}
                  </div>
                </div>

                {open && (
                  <div className="border-t border-line-soft p-4 sm:p-5">
                    <FieldGrid
                      fields={fields}
                      values={row}
                      errors={errors[row.id]}
                      onChange={(name, next) => change(row.id, name, next)}
                    />

                    <div className="mt-5 flex flex-wrap gap-2">
                      <ActionButton onClick={() => void save(row.id)} loading={busyId === row.id}>
                        Save draft
                      </ActionButton>
                      <ActionButton
                        tone="primary"
                        onClick={() => void publish(row.id)}
                        loading={busyId === row.id}
                      >
                        Publish
                      </ActionButton>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
};

export default CollectionEditor;
