import React from 'react';

/**
 * Renders `**emphasised**` spans inside otherwise plain copy.
 *
 * The hero paragraph used to hardcode `<span className="text-fg font-normal">`
 * around three phrases. Now that the copy is editable, the emphasis has to
 * travel with the text — so it is written as `**like this**` in the admin
 * panel and rendered with the exact same classes here. Nothing about the
 * rendered output changed.
 */
type Props = {
  text: string;
  /** Classes applied to the emphasised runs. */
  emphasisClassName?: string;
};

export const RichText: React.FC<Props> = ({
  text,
  emphasisClassName = 'text-fg font-normal',
}) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
          <span key={index} className={emphasisClassName}>
            {part.slice(2, -2)}
          </span>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};

export default RichText;
