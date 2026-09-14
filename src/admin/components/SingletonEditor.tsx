import React, { useCallback, useEffect, useState } from 'react';

import { requestContentRefresh } from '../../content/ContentProvider';
import { ApiError, adminApi, type AdminRow } from '../api';
import { FieldGrid, pick, type FieldDef, type FormValues } from './fields';
import { ActionButton, Banner, Panel, StatusPill } from './ui';

/**
 * Edit-and-publish screen for a one-of-a-kind record (profile, hero, SEO,
 * appearance). Save writes the draft; Publish copies it into the snapshot
 * the public site reads — the same two-step flow as the reference project.
 */
export const SingletonEditor: React.FC<{
  entity: string;
  title: string;
  description?: string;
  fields: readonly FieldDef[];
}> = ({ entity, title, description, fields }) => {
  const [values, setValues] = useState<FormValues | null>(null);
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  );
  const [busy, setBusy] = useState<'save' | 'publish' | null>(null);

  const load = useCallback(async () => {
    try {
      const row = await adminApi.get<AdminRow>(entity);
      setValues(pick(fields, row as FormValues));
      setPublished(!row.hasUnpublishedChanges);
    } catch (error) {
      setBanner({
        tone: 'error',
        text: error instanceof ApiError ? error.message : 'Could not load this section.',
      });
    }
  }, [entity, fields]);

  useEffect(() => {
    void load();
  }, [load]);

  const change = (name: string, next: unknown) => {
    setValues((current) => (current ? { ...current, [name]: next } : current));
    setPublished(false);
  };

  const save = async () => {
    if (!values) return;
    setBusy('save');
    setErrors({});
    try {
      const row = await adminApi.updateSingleton<AdminRow>(entity, pick(fields, values));
      setValues(pick(fields, row as FormValues));
      setPublished(!row.hasUnpublishedChanges);
      setBanner({ tone: 'success', text: 'Draft saved. Publish to put it on the live site.' });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        setBanner({ tone: 'error', text: error.message });
      }
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (!values) return;
    setBusy('publish');
    setErrors({});
    try {
      // Publish the values currently in the form. Previously this button
      // snapshotted the last saved row, so an edit followed by Publish was
      // silently discarded unless Save draft was clicked first.
      const saved = await adminApi.updateSingleton<AdminRow>(entity, pick(fields, values));
      setValues(pick(fields, saved as FormValues));
      await adminApi.publishSingleton(entity);
      setPublished(true);
      setBanner({ tone: 'success', text: 'Published. The live site is updated.' });
      // Tell any open portfolio tab in this browser to refetch immediately.
      requestContentRefresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        setBanner({ tone: 'error', text: error.message });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <Panel
      title={title}
      description={description}
      actions={
        <>
          <StatusPill published={published} />
          <ActionButton onClick={save} loading={busy === 'save'} disabled={!values}>
            Save draft
          </ActionButton>
          <ActionButton
            tone="primary"
            onClick={publish}
            loading={busy === 'publish'}
            disabled={!values}
          >
            Publish
          </ActionButton>
        </>
      }
    >
      {banner && (
        <div style={{ marginBottom: 18 }}>
          <Banner tone={banner.tone}>{banner.text}</Banner>
        </div>
      )}

      {errors._form?.length ? (
        <div style={{ marginBottom: 18 }}>
          <Banner tone="error">{errors._form.join(' ')}</Banner>
        </div>
      ) : null}

      {values ? (
        <FieldGrid fields={fields} values={values} errors={errors} onChange={change} />
      ) : (
        <p className="ad-help">Loading…</p>
      )}
    </Panel>
  );
};

export default SingletonEditor;
