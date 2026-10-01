import { useState } from 'react';
import { type SlugInputProps, useCurrentUser, useEditState, useFormValue } from 'sanity';

// Slug lock (plan 7.5, D-26): once a document is published, its URL can't be changed casually, because
// the link may already be shared on WhatsApp and indexed by Google. A Pentadbir can still unlock it.
export function LockedSlugInput(props: SlugInputProps) {
  const id = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '');
  const type = String(useFormValue(['_type']) ?? '');
  const { published } = useEditState(id, type);
  const publishedSlug = (published as { slug?: { current?: string } } | null)?.slug?.current;
  const user = useCurrentUser();
  const isAdmin = Boolean(user?.roles?.some((r) => r.name === 'administrator'));
  const [unlocked, setUnlocked] = useState(false);

  if (!publishedSlug || unlocked) return props.renderDefault(props);

  return (
    <div style={{ border: '1px solid var(--card-border-color, #ccc)', borderRadius: 6, padding: 12 }}>
      <p style={{ margin: 0, fontWeight: 600 }}>
        <span aria-hidden="true">🔒 </span>
        {publishedSlug}
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.8 }}>
        Pautan ini dikunci kerana halaman telah diterbitkan dan mungkin sudah dikongsi. Mengubahnya akan
        merosakkan pautan lama.
      </p>
      {isAdmin && (
        <button
          type="button"
          onClick={() => setUnlocked(true)}
          style={{
            marginTop: 10,
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #b26b00',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Buka kunci (Pentadbir sahaja)
        </button>
      )}
    </div>
  );
}
